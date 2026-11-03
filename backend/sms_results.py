"""Monthly test results: marks entry, auto totals/grades/ranks, retrieval, export."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from typing import Dict, List

from sms_utils import ALL_CLASSES, COURSES, grade_for, audit

router = APIRouter(prefix="/api")

MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


class MarkEntry(BaseModel):
    reg_id: str
    marks: Dict[str, float | None]  # subject -> marks (None = absent)


class ResultSave(BaseModel):
    course: str
    class_name: str
    month: str
    year: int = Field(ge=2020, le=2100)
    subjects: List[str] = Field(min_length=1, max_length=12)
    max_marks: Dict[str, float] = {}
    entries: List[MarkEntry] = Field(min_length=1)
    published: bool = False

    @field_validator("course")
    @classmethod
    def check_course(cls, v):
        if v not in COURSES:
            raise ValueError("Invalid course")
        return v

    @field_validator("class_name")
    @classmethod
    def check_class(cls, v):
        if v not in ALL_CLASSES:
            raise ValueError("Invalid class")
        return v

    @field_validator("month")
    @classmethod
    def check_month(cls, v):
        if v not in MONTH_NAMES:
            raise ValueError("Invalid month")
        return v


def _compute(entries, subjects, max_marks):
    """Returns list of computed rows with totals, pct, grade, rank (standard competition ranking)."""
    rows = []
    for e in entries:
        absent_subjects = [s for s in subjects if e["marks"].get(s) is None]
        total = sum(e["marks"].get(s) or 0 for s in subjects)
        max_total = sum(max_marks.get(s, 100) for s in subjects)
        pct = round(total / max_total * 100, 2) if max_total else 0
        rows.append({
            **e,
            "total": round(total, 2),
            "max_total": max_total,
            "percentage": pct,
            "grade": "AB" if len(absent_subjects) == len(subjects) else grade_for(pct),
            "absent_subjects": absent_subjects,
        })
    ranked = sorted(rows, key=lambda r: -r["total"])
    prev_total, prev_rank = None, 0
    for idx, r in enumerate(ranked, start=1):
        if r["total"] != prev_total:
            prev_rank = idx
            prev_total = r["total"]
        r["rank"] = prev_rank
    return rows


def results_router(db, get_current_admin):

    @router.get("/results/fetch-batch")
    async def fetch_batch(class_name: str, session: str, admin=Depends(get_current_admin)):
        docs = await db.students.find(
            {"class_name": class_name, "session": session, "status": "Active"},
            {"full_name": 1, "reg_id": 1, "roll_number": 1, "subjects": 1},
        ).sort("roll_number", 1).to_list(500)
        return [{"reg_id": d["reg_id"], "full_name": d["full_name"], "roll_number": d.get("roll_number"), "subjects": d.get("subjects", [])} for d in docs]

    @router.get("/results")
    async def get_result(course: str, class_name: str, month: str, year: int, admin=Depends(get_current_admin)):
        doc = await db.test_results.find_one({"course": course, "class_name": class_name, "month": month, "year": year})
        if not doc:
            return {"found": False}
        doc = dict(doc)
        doc["id"] = str(doc.pop("_id"))
        doc["found"] = True
        return doc

    @router.post("/results")
    async def save_result(payload: ResultSave, admin=Depends(get_current_admin)):
        key = {"course": payload.course, "class_name": payload.class_name, "month": payload.month, "year": payload.year}
        entries = [e.model_dump() for e in payload.entries]
        # validate students exist
        reg_ids = [e["reg_id"] for e in entries]
        if len(reg_ids) != len(set(reg_ids)):
            raise HTTPException(status_code=409, detail="Duplicate students in marks entry.")
        for rid in reg_ids:
            if not await db.students.find_one({"reg_id": rid}):
                raise HTTPException(status_code=404, detail=f"Student {rid} not found.")
        max_marks = {s: float(payload.max_marks.get(s, 100)) for s in payload.subjects}
        rows = _compute(entries, payload.subjects, max_marks)
        doc = {
            **key,
            "subjects": payload.subjects,
            "max_marks": max_marks,
            "rows": rows,
            "published": payload.published,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": admin["email"],
        }
        await db.test_results.update_one(key, {"$set": doc, "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        await audit(db, admin, "results.save", f"{payload.class_name} {payload.month} {payload.year}: {len(rows)} students, published={payload.published}")
        return {"success": True, "rows": rows}

    @router.get("/results/ranking")
    async def ranking(course: str, class_name: str, month: str, year: int, admin=Depends(get_current_admin)):
        doc = await db.test_results.find_one({"course": course, "class_name": class_name, "month": month, "year": year})
        if not doc or not doc.get("rows"):
            return {"found": False}
        rows = sorted(doc["rows"], key=lambda r: r["rank"])
        subjects = doc["subjects"]
        subject_avg = {}
        for s in subjects:
            vals = [r["marks"].get(s) for r in rows if r["marks"].get(s) is not None]
            subject_avg[s] = round(sum(vals) / len(vals), 2) if vals else None
        totals = [r["total"] for r in rows]
        return {
            "found": True,
            "published": doc.get("published", False),
            "top": rows[:10],
            "first": rows[0] if rows else None,
            "second": rows[1] if len(rows) > 1 else None,
            "third": rows[2] if len(rows) > 2 else None,
            "class_average": round(sum(totals) / len(totals), 2) if totals else 0,
            "subject_average": subject_avg,
            "highest": max(totals) if totals else 0,
            "lowest": min(totals) if totals else 0,
            "count": len(rows),
        }

    @router.get("/results/export.csv")
    async def export_csv(course: str, class_name: str, month: str, year: int, admin=Depends(get_current_admin)):
        doc = await db.test_results.find_one({"course": course, "class_name": class_name, "month": month, "year": year})
        if not doc:
            raise HTTPException(status_code=404, detail="No saved results for this selection.")
        subjects = doc["subjects"]
        rows = [["Rank", "Roll", "Reg ID", "Name"] + subjects + ["Total", "Max", "Percentage", "Grade"]]
        for r in sorted(doc["rows"], key=lambda r: r["rank"]):
            rows.append([r["rank"], r.get("roll_number") or "", r["reg_id"], r.get("full_name", "")]
                        + [r["marks"].get(s) if r["marks"].get(s) is not None else "AB" for s in subjects]
                        + [r["total"], r["max_total"], r["percentage"], r["grade"]])
        csv = "\r\n".join(",".join('"' + str(c).replace('"', '""') + '"' for c in r) for r in rows)
        return Response(content="﻿" + csv, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=results-{class_name}-{month}-{year}.csv"})

    return router
