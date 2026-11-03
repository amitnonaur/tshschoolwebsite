"""Fees: defaults, student fee records, payments, dues, tracker."""
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from sms_utils import current_session, audit, serialise

router = APIRouter(prefix="/api")

MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"]
MONTH_NUM = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12}


def _month_key(session: str, month: str) -> str:
    """'2728' + 'January' -> '2028-01'; '2728' + 'April' -> '2027-04'"""
    n = MONTH_NUM[month]
    year = 2000 + int(session[:2]) + (1 if n <= 3 else 0)
    return f"{year}-{n:02d}"


class PaymentIn(BaseModel):
    reg_id: str
    month: str
    amount: float = Field(gt=0, le=1000000)
    method: str = "Cash"
    note: str = ""
    date: str | None = None

    @field_validator("month")
    @classmethod
    def check_month(cls, v):
        if v not in MONTHS:
            raise ValueError("Invalid month.")
        return v

    @field_validator("method")
    @classmethod
    def check_method(cls, v):
        if v not in ("Cash", "UPI", "Bank Transfer", "Cheque", "Other"):
            raise ValueError("Invalid payment method.")
        return v


def fees_router(db, get_current_admin):

    @router.get("/fees/defaults")
    async def get_defaults(admin=Depends(get_current_admin)):
        settings = await db.settings.find_one({"_id": "school"}) or {}
        return {"fee_defaults": settings.get("fee_defaults", {})}

    @router.put("/fees/defaults")
    async def set_defaults(payload: dict, admin=Depends(get_current_admin)):
        defaults = payload.get("fee_defaults", {})
        clean = {}
        for cls, amt in defaults.items():
            try:
                amt = float(amt)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail=f"Invalid fee for {cls}")
            if amt < 0 or amt > 1000000:
                raise HTTPException(status_code=400, detail=f"Invalid fee for {cls}")
            clean[cls] = amt
        await db.settings.update_one({"_id": "school"}, {"$set": {"fee_defaults": clean}}, upsert=True)
        await audit(db, admin, "fees.defaults", f"Updated default annual fees for {len(clean)} class(es)")
        return {"success": True, "fee_defaults": clean}

    @router.get("/fees/summary")
    async def summary(session: str = "", admin=Depends(get_current_admin)):
        session = session or current_session()
        students = await db.students.find({"session": session, "status": {"$ne": "Archived"}}).to_list(5000)
        payments = await db.fee_payments.find({"session": session}).to_list(20000)
        monthly_fee = {s["reg_id"]: round(s.get("annual_fee", 0) / 12, 2) for s in students}
        expected = round(sum(monthly_fee.values()) * 12, 2)
        collected = round(sum(p["amount"] for p in payments), 2)
        now_key = datetime.now(timezone.utc).strftime("%Y-%m")
        prev_key_dt = datetime.now(timezone.utc)
        prev_year, prev_month = (prev_key_dt.year, prev_key_dt.month - 1) if prev_key_dt.month > 1 else (prev_key_dt.year - 1, 12)
        prev_key = f"{prev_year}-{prev_month:02d}"
        this_month = round(sum(p["amount"] for p in payments if p.get("month_key") == now_key), 2)
        prev_month_col = round(sum(p["amount"] for p in payments if p.get("month_key") == prev_key), 2)
        # per-student outstanding
        paid_by_student = {}
        for p in payments:
            paid_by_student[p["reg_id"]] = paid_by_student.get(p["reg_id"], 0) + p["amount"]
        dues = []
        for s in students:
            due = round(s.get("annual_fee", 0) - paid_by_student.get(s["reg_id"], 0), 2)
            if due > 0:
                paid_months = [p.get("month") for p in payments if p["reg_id"] == s["reg_id"]]
                pending = [m for m in MONTHS if m not in paid_months]
                dues.append({
                    "reg_id": s["reg_id"], "full_name": s["full_name"], "course": s["course"],
                    "class_name": s["class_name"], "due": due, "pending_months": pending,
                    "mobile_primary": s.get("mobile_primary"), "father_name": s.get("father_name"),
                })
        # monthly revenue Apr..Mar
        revenue = {m: 0.0 for m in MONTHS}
        for p in payments:
            if p.get("month") in revenue:
                revenue[p["month"]] = round(revenue[p["month"]] + p["amount"], 2)
        return {
            "session": session,
            "expected": expected,
            "collected": collected,
            "total_dues": round(expected - collected, 2),
            "this_month": this_month,
            "prev_month": prev_month_col,
            "revenue_by_month": [{"month": m, "amount": revenue[m]} for m in MONTHS],
            "dues": sorted(dues, key=lambda d: -d["due"]),
        }

    @router.get("/fees/student/{reg_id}")
    async def student_fees(reg_id: str, admin=Depends(get_current_admin)):
        s = await db.students.find_one({"reg_id": reg_id})
        if not s:
            raise HTTPException(status_code=404, detail="Student not found")
        payments = await db.fee_payments.find({"reg_id": reg_id}).sort("created_at", -1).to_list(500)
        total_paid = round(sum(p["amount"] for p in payments), 2)
        return {
            "student": serialise({k: v for k, v in s.items() if k != "photo"}),
            "payments": [serialise(p) for p in payments],
            "total_paid": total_paid,
            "due": round(s.get("annual_fee", 0) - total_paid, 2),
        }

    @router.post("/fees/payments")
    async def add_payment(payload: PaymentIn, admin=Depends(get_current_admin)):
        s = await db.students.find_one({"reg_id": payload.reg_id})
        if not s:
            raise HTTPException(status_code=404, detail="Student not found")
        session = s["session"]
        existing = await db.fee_payments.find_one({"reg_id": payload.reg_id, "session": session, "month": payload.month})
        if existing:
            raise HTTPException(status_code=409, detail=f"{payload.month} fee already recorded for this student. Edit the existing payment instead.")
        doc = payload.model_dump()
        doc.update({
            "session": session,
            "month_key": _month_key(session, payload.month),
            "date": payload.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "recorded_by": admin["email"],
        })
        await db.fee_payments.insert_one(doc)
        await audit(db, admin, "fees.payment", f"₹{payload.amount} from {s['full_name']} ({payload.reg_id}) for {payload.month}", "student", payload.reg_id)
        return {"success": True, "payment": serialise(doc)}

    return router
