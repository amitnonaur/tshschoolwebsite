"""Timetable builder + full backup export."""
import io
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import Dict, List

from sms_utils import ALL_CLASSES, audit

router = APIRouter(prefix="/api")

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
MAX_PERIODS = 10


class TimetableSave(BaseModel):
    class_name: str
    periods: List[str] = Field(min_length=1, max_length=MAX_PERIODS)
    grid: Dict[str, List[str]]  # day -> [subject per period index]
    published: bool = True

    @field_validator("class_name")
    @classmethod
    def check_class(cls, v):
        if v not in ALL_CLASSES:
            raise ValueError("Invalid class")
        return v

    @field_validator("grid")
    @classmethod
    def check_grid(cls, v):
        for day in v:
            if day not in DAYS:
                raise ValueError("Invalid day")
        return v


def misc_router(db, get_current_admin):

    @router.get("/timetable/{class_name}")
    async def get_timetable(class_name: str, admin=Depends(get_current_admin)):
        doc = await db.timetables.find_one({"class_name": class_name})
        if not doc:
            return {"found": False, "class_name": class_name, "days": DAYS}
        doc = dict(doc)
        doc["id"] = str(doc.pop("_id"))
        doc["found"] = True
        return doc

    @router.post("/timetable")
    async def save_timetable(payload: TimetableSave, admin=Depends(get_current_admin)):
        doc = payload.model_dump()
        doc.update({
            "updated_by": admin["email"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.timetables.update_one(
            {"class_name": payload.class_name},
            {"$set": doc, "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        await audit(db, admin, "timetable.save", f"Timetable saved for {payload.class_name}")
        return {"success": True}

    # ---------- Full backup ----------
    @router.get("/admin/backup")
    async def backup(admin=Depends(get_current_admin)):
        import openpyxl
        wb = openpyxl.Workbook()

        def sheet(name, docs, headers, row_fn):
            ws = wb.create_sheet(name[:31])
            ws.append(headers)
            for d in docs:
                ws.append(row_fn(d))

        students = await db.students.find({}, {"photo": 0, "edit_history": 0}).to_list(10000)
        sheet("Students", students,
              ["Reg ID", "Name", "DOB", "Gender", "Father", "Mother", "Mobile", "Alt Mobile", "Address", "Previous School",
               "Course", "Class", "Roll", "Subjects", "Session", "Session Start", "Session End", "Annual Fee", "Admission Date", "Admission Status", "Status"],
              lambda d: [d.get("reg_id"), d.get("full_name"), d.get("dob"), d.get("gender"), d.get("father_name"), d.get("mother_name"),
                         d.get("mobile_primary"), d.get("mobile_alt"), d.get("address"), d.get("previous_school"),
                         d.get("course"), d.get("class_name"), d.get("roll_number"), ", ".join(d.get("subjects", [])),
                         d.get("session"), d.get("session_start"), d.get("session_end"), d.get("annual_fee"),
                         d.get("admission_date"), d.get("admission_status"), d.get("status")])

        payments = await db.fee_payments.find().to_list(50000)
        sheet("Fee Payments", payments,
              ["Reg ID", "Session", "Month", "Amount", "Method", "Date", "Note", "Recorded By"],
              lambda d: [d.get("reg_id"), d.get("session"), d.get("month"), d.get("amount"), d.get("method"), d.get("date"), d.get("note"), d.get("recorded_by")])

        finance = await db.finance_entries.find().to_list(20000)
        sheet("Finance", finance,
              ["Date", "Type", "Category", "Amount", "Note", "Session", "Recorded By"],
              lambda d: [d.get("date"), d.get("kind"), d.get("category"), d.get("amount"), d.get("note"), d.get("session"), d.get("recorded_by")])

        attendance = await db.attendance.find().to_list(20000)
        att_rows = []
        for d in attendance:
            for reg_id, status in d.get("records", {}).items():
                att_rows.append({"class_name": d["class_name"], "date": d["date"], "reg_id": reg_id, "status": status})
        sheet("Attendance", att_rows,
              ["Class", "Date", "Reg ID", "Status"],
              lambda d: [d["class_name"], d["date"], d["reg_id"], d["status"]])

        results = await db.test_results.find().to_list(5000)
        res_rows = []
        for r in results:
            for row in r.get("rows", []):
                entry = {"Class": r["class_name"], "Month": r["month"], "Year": r["year"], "Reg ID": row["reg_id"],
                         "Total": row["total"], "Max": row["max_total"], "Pct": row["percentage"], "Grade": row["grade"], "Rank": row["rank"], "Published": r.get("published")}
                for s in r["subjects"]:
                    entry[s] = row["marks"].get(s)
                res_rows.append(entry)
        subj_cols = sorted({s for r in results for s in r.get("subjects", [])})
        sheet("Test Results", res_rows,
              ["Class", "Month", "Year", "Reg ID"] + subj_cols + ["Total", "Max", "Pct", "Grade", "Rank", "Published"],
              lambda d: [d["Class"], d["Month"], d["Year"], d["Reg ID"]] + [d.get(s) for s in subj_cols] + [d["Total"], d["Max"], d["Pct"], d["Grade"], d["Rank"], d["Published"]])

        promotions = await db.promotions.find().to_list(10000)
        sheet("Promotions", promotions,
              ["Reg ID", "Decision", "From Class", "To Class", "From Roll", "To Roll", "From Session", "To Session", "Date", "By"],
              lambda d: [d.get("reg_id"), d.get("decision"), d.get("from_class"), d.get("to_class"), d.get("from_roll"), d.get("to_roll"), d.get("from_session"), d.get("to_session"), d.get("promoted_at"), d.get("by")])

        if "Sheet" in wb.sheetnames and len(wb.sheetnames) > 1:
            del wb["Sheet"]
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        await audit(db, admin, "backup.download", f"Full backup downloaded ({len(students)} students)")
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=tsh-backup-{datetime.now(timezone.utc).strftime('%Y-%m-%d')}.xlsx"},
        )

    return router
