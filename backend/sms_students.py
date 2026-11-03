"""Students: admission, list, detail, photo upload, status, CSV export."""
import base64
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

from sms_utils import (
    ALL_CLASSES, COURSES, COURSE_CLASSES, DEFAULT_SUBJECTS,
    current_session, session_dates, generate_reg_id, audit, serialise,
)

router = APIRouter(prefix="/api")

STUDENT_STATUSES = ["Active", "Inactive", "Archived"]
ADMISSION_STATUSES = ["Pending", "Confirmed", "Cancelled"]
MAX_PHOTO_BYTES = 2 * 1024 * 1024


class StudentIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    admission_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    dob: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    father_name: str = Field(min_length=2, max_length=120)
    mother_name: str = Field(min_length=2, max_length=120)
    gender: str
    mobile_primary: str
    mobile_alt: Optional[str] = None
    address: str = Field(min_length=5, max_length=500)
    previous_school: Optional[str] = Field(default=None, max_length=200)
    course: str
    class_name: str
    subjects: List[str] = []
    session_start: str
    session_end: str
    roll_number: Optional[int] = None
    annual_fee: float = Field(ge=0, le=1000000)
    admission_status: str = "Confirmed"

    @field_validator("gender")
    @classmethod
    def check_gender(cls, v):
        if v not in ("Male", "Female", "Other"):
            raise ValueError("Invalid gender.")
        return v

    @field_validator("mobile_primary", "mobile_alt")
    @classmethod
    def check_mobile(cls, v):
        if v is None:
            return v
        digits = re.sub(r"\D", "", v)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            raise ValueError("Enter a valid 10-digit Indian mobile number.")
        return digits

    @field_validator("course")
    @classmethod
    def check_course(cls, v):
        if v not in COURSES:
            raise ValueError("Invalid course.")
        return v

    @field_validator("class_name")
    @classmethod
    def check_class(cls, v):
        if v not in ALL_CLASSES:
            raise ValueError("Invalid class.")
        return v

    @field_validator("admission_status")
    @classmethod
    def check_status(cls, v):
        if v not in ADMISSION_STATUSES:
            raise ValueError("Invalid admission status.")
        return v


def student_router(db, get_current_admin):

    @router.get("/students/meta")
    async def meta(admin=Depends(get_current_admin)):
        session = current_session()
        start, end = session_dates(session)
        settings = await db.settings.find_one({"_id": "school"}) or {}
        fee_defaults = settings.get("fee_defaults", {})
        return {
            "session": session,
            "session_start": start,
            "session_end": end,
            "courses": COURSES,
            "course_classes": COURSE_CLASSES,
            "all_classes": ALL_CLASSES,
            "default_subjects": DEFAULT_SUBJECTS,
            "fee_defaults": fee_defaults,
        }

    @router.post("/students")
    async def create_student(payload: StudentIn, admin=Depends(get_current_admin)):
        session = current_session(datetime.fromisoformat(payload.admission_date + "T00:00:00+00:00"))
        if payload.roll_number is not None:
            dup = await db.students.find_one({
                "class_name": payload.class_name, "session": session,
                "roll_number": payload.roll_number, "status": {"$ne": "Archived"},
            })
            if dup:
                raise HTTPException(status_code=409, detail=f"Roll number {payload.roll_number} is already taken in {payload.class_name} ({session}).")
        reg_id = await generate_reg_id(db, session)
        doc = payload.model_dump()
        doc.update({
            "reg_id": reg_id,
            "session": session,
            "status": "Active",
            "photo": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": admin["email"],
            "edit_history": [],
        })
        await db.students.insert_one(doc)
        await audit(db, admin, "student.admit", f"Admitted {doc['full_name']} ({reg_id}) to {doc['class_name']}", "student", reg_id)
        return {"success": True, "reg_id": reg_id, "session": session}

    @router.get("/students")
    async def list_students(
        q: str = "", course: str = "", class_name: str = "", session: str = "",
        status: str = "", page: int = 1, limit: int = 25,
        admin=Depends(get_current_admin),
    ):
        limit = min(max(limit, 1), 100)
        page = max(page, 1)
        query = {}
        if q:
            rx = {"$regex": re.escape(q), "$options": "i"}
            query["$or"] = [{"full_name": rx}, {"reg_id": rx}, {"father_name": rx}, {"mobile_primary": rx}]
        if course:
            query["course"] = course
        if class_name:
            query["class_name"] = class_name
        if session:
            query["session"] = session
        if status:
            query["status"] = status
        else:
            query["status"] = {"$ne": "Archived"}
        total = await db.students.count_documents(query)
        cursor = db.students.find(
            query,
            {"full_name": 1, "reg_id": 1, "course": 1, "class_name": 1, "status": 1, "photo": 1,
             "roll_number": 1, "session": 1, "mobile_primary": 1, "admission_date": 1},
        ).sort([("class_name", 1), ("roll_number", 1)]).skip((page - 1) * limit).limit(limit)
        docs = await cursor.to_list(limit)
        return {"total": total, "page": page, "limit": limit, "students": [serialise(d) for d in docs]}

    @router.get("/students/{reg_id}")
    async def get_student(reg_id: str, admin=Depends(get_current_admin)):
        doc = await db.students.find_one({"reg_id": reg_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Student not found")
        return serialise(doc)

    @router.patch("/students/{reg_id}")
    async def update_student(reg_id: str, payload: StudentIn, admin=Depends(get_current_admin)):
        doc = await db.students.find_one({"reg_id": reg_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Student not found")
        updates = payload.model_dump()
        changes = []
        for k, v in updates.items():
            if doc.get(k) != v:
                changes.append({"field": k, "from": doc.get(k), "to": v})
        if payload.roll_number is not None and payload.roll_number != doc.get("roll_number"):
            dup = await db.students.find_one({
                "reg_id": {"$ne": reg_id}, "class_name": payload.class_name,
                "session": doc["session"], "roll_number": payload.roll_number,
                "status": {"$ne": "Archived"},
            })
            if dup:
                raise HTTPException(status_code=409, detail=f"Roll number {payload.roll_number} is already taken.")
        updates["edit_history"] = doc.get("edit_history", []) + [{
            "by": admin["email"], "at": datetime.now(timezone.utc).isoformat(), "changes": changes,
        }] if changes else doc.get("edit_history", [])
        await db.students.update_one({"reg_id": reg_id}, {"$set": updates})
        await audit(db, admin, "student.edit", f"Edited {doc['full_name']} ({reg_id}): {len(changes)} field(s)", "student", reg_id)
        return {"success": True}

    @router.patch("/students/{reg_id}/status")
    async def set_status(reg_id: str, payload: dict, admin=Depends(get_current_admin)):
        status = payload.get("status")
        if status not in STUDENT_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        result = await db.students.update_one({"reg_id": reg_id}, {"$set": {"status": status}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        await audit(db, admin, "student.status", f"{reg_id} -> {status}", "student", reg_id)
        return {"success": True, "status": status}

    @router.post("/students/{reg_id}/photo")
    async def upload_photo(reg_id: str, file: UploadFile = File(...), admin=Depends(get_current_admin)):
        doc = await db.students.find_one({"reg_id": reg_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Student not found")
        content = await file.read()
        if len(content) > MAX_PHOTO_BYTES:
            raise HTTPException(status_code=400, detail="Photo must be under 2 MB.")
        ct = file.content_type or ""
        if ct not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail="Photo must be JPG, PNG or WebP.")
        b64 = "data:" + ct + ";base64," + base64.b64encode(content).decode()
        await db.students.update_one({"reg_id": reg_id}, {"$set": {"photo": b64}})
        return {"success": True, "photo": b64}

    @router.get("/students-export.csv")
    async def export_students(session: str = "", class_name: str = "", admin=Depends(get_current_admin)):
        query = {"status": {"$ne": "Archived"}}
        if session:
            query["session"] = session
        if class_name:
            query["class_name"] = class_name
        docs = await db.students.find(query).sort([("class_name", 1), ("roll_number", 1)]).to_list(2000)
        rows = [["Reg ID", "Name", "Course", "Class", "Roll", "Session", "Father", "Mother", "Mobile", "DOB", "Admission Date", "Annual Fee", "Status"]]
        for d in docs:
            rows.append([
                d.get("reg_id"), d.get("full_name"), d.get("course"), d.get("class_name"),
                d.get("roll_number") or "", d.get("session"), d.get("father_name"), d.get("mother_name"),
                d.get("mobile_primary"), d.get("dob"), d.get("admission_date"), d.get("annual_fee"), d.get("status"),
            ])
        csv = "\r\n".join(",".join('"' + str(c).replace('"', '""') + '"' for c in r) for r in rows)
        return Response(content="﻿" + csv, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=students.csv"})

    return router
