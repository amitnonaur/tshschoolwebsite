"""Attendance: daily class marking + monthly summaries."""
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Dict

from sms_utils import ALL_CLASSES, audit

router = APIRouter(prefix="/api")

STATUSES = ["P", "A", "L"]  # Present, Absent, Leave
DATE_RE = r"^\d{4}-\d{2}-\d{2}$"


class AttendanceSave(BaseModel):
    class_name: str
    date: str = Field(pattern=DATE_RE)
    records: Dict[str, str]  # reg_id -> P/A/L (missing = not marked)

    @field_validator("class_name")
    @classmethod
    def check_class(cls, v):
        if v not in ALL_CLASSES:
            raise ValueError("Invalid class")
        return v

    @field_validator("records")
    @classmethod
    def check_records(cls, v):
        for k, s in v.items():
            if s not in STATUSES:
                raise ValueError("Status must be P, A or L")
        return v


def attendance_router(db, get_current_admin):

    @router.get("/attendance/class")
    async def get_class_attendance(class_name: str, date: str, admin=Depends(get_current_admin)):
        if class_name not in ALL_CLASSES or not re.fullmatch(DATE_RE, date):
            raise HTTPException(status_code=400, detail="Invalid class or date")
        session = None
        students = await db.students.find(
            {"class_name": class_name, "status": "Active"},
            {"full_name": 1, "reg_id": 1, "roll_number": 1, "session": 1},
        ).sort("roll_number", 1).to_list(500)
        doc = await db.attendance.find_one({"class_name": class_name, "date": date})
        return {
            "students": [{"reg_id": s["reg_id"], "full_name": s["full_name"], "roll_number": s.get("roll_number")} for s in students],
            "records": doc.get("records", {}) if doc else {},
            "marked": bool(doc),
            "marked_by": doc.get("marked_by") if doc else None,
        }

    @router.post("/attendance/class")
    async def save_class_attendance(payload: AttendanceSave, admin=Depends(get_current_admin)):
        doc = {
            "class_name": payload.class_name,
            "date": payload.date,
            "records": payload.records,
            "marked_by": admin["email"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.attendance.update_one(
            {"class_name": payload.class_name, "date": payload.date},
            {"$set": doc, "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        await audit(db, admin, "attendance.mark", f"{payload.class_name} on {payload.date}: {len(payload.records)} students")
        return {"success": True, "marked": len(payload.records)}

    @router.get("/attendance/student/{reg_id}")
    async def student_attendance(reg_id: str, month: str = "", admin=Depends(get_current_admin)):
        """month = 'YYYY-MM'; returns per-day status + monthly summary."""
        student = await db.students.find_one({"reg_id": reg_id})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        if not month:
            month = datetime.now(timezone.utc).strftime("%Y-%m")
        docs = await db.attendance.find({"date": {"$regex": f"^{month}"}, f"records.{reg_id}": {"$exists": True}}).to_list(40)
        days = []
        counts = {"P": 0, "A": 0, "L": 0}
        for d in sorted(docs, key=lambda x: x["date"]):
            status = d["records"].get(reg_id)
            if status in counts:
                counts[status] += 1
                days.append({"date": d["date"], "status": status})
        total_marked = sum(counts.values())
        return {
            "month": month,
            "days": days,
            "present": counts["P"], "absent": counts["A"], "leave": counts["L"],
            "total_marked": total_marked,
            "attendance_pct": round(counts["P"] / total_marked * 100, 1) if total_marked else None,
        }

    return router
