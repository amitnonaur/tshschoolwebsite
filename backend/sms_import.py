"""Bulk import: CSV/XLSX student import with template, preview, validation, history."""
import csv
import io
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response

from sms_utils import ALL_CLASSES, COURSE_CLASSES, current_session, session_dates, generate_reg_id, audit

router = APIRouter(prefix="/api")

COLUMNS = ["full_name", "dob", "father_name", "mother_name", "gender", "mobile_primary", "address", "class_name", "admission_date", "mobile_alt", "previous_school", "roll_number", "annual_fee", "reg_id"]
REQUIRED = ["full_name", "dob", "father_name", "mother_name", "gender", "mobile_primary", "address", "class_name"]

TEMPLATE_ROWS = [
    COLUMNS,
    ["Aarav Kumar", "2018-05-12", "Rakesh Kumar", "Sunita Kumar", "Male", "9876501234", "Krishna Nagar, Arrah", "Class 1", "2026-04-01", "", "", "1", "18000", ""],
    ["Diya Kumari", "2019-02-20", "Mohan Singh", "Rekha Devi", "Female", "9812340001", "Zero Mile, Arrah", "LKG", "2026-04-01", "", "", "", "12000", ""],
]


def _course_for(cls: str) -> str | None:
    for course, classes in COURSE_CLASSES.items():
        if cls in classes:
            return course
    return None


def _validate_row(row: dict, idx: int, seen_reg_ids: set, db_reg_ids: set) -> list[str]:
    errors = []
    for col in REQUIRED:
        if not (row.get(col) or "").strip():
            errors.append(f"{col} is required")
    dob = (row.get("dob") or "").strip()
    if dob and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", dob):
        errors.append("dob must be YYYY-MM-DD")
    adm = (row.get("admission_date") or "").strip()
    if adm and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", adm):
        errors.append("admission_date must be YYYY-MM-DD")
    gender = (row.get("gender") or "").strip()
    if gender and gender not in ("Male", "Female", "Other"):
        errors.append("gender must be Male/Female/Other")
    for field in ("mobile_primary", "mobile_alt"):
        v = re.sub(r"\D", "", row.get(field) or "")
        if field == "mobile_primary" and not re.fullmatch(r"[6-9]\d{9}", v[-10:] if len(v) >= 10 else v):
            errors.append("mobile_primary must be a valid 10-digit Indian number")
    cls = (row.get("class_name") or "").strip()
    if cls and cls not in ALL_CLASSES:
        errors.append(f"class_name must be one of: {', '.join(ALL_CLASSES)}")
    fee = (row.get("annual_fee") or "").strip()
    if fee:
        try:
            if float(fee) < 0:
                errors.append("annual_fee cannot be negative")
        except ValueError:
            errors.append("annual_fee must be a number")
    roll = (row.get("roll_number") or "").strip()
    if roll and (not roll.isdigit() or int(roll) < 1):
        errors.append("roll_number must be a positive number")
    rid = (row.get("reg_id") or "").strip().upper()
    if rid:
        if rid in seen_reg_ids:
            errors.append(f"duplicate reg_id {rid} in file")
        if rid in db_reg_ids:
            errors.append(f"reg_id {rid} already exists in the database")
        seen_reg_ids.add(rid)
    return errors


async def _parse(db, content: bytes, filename: str) -> tuple[list[dict], list[str]]:
    """Returns (rows_with_meta, fatal_errors)"""
    text_rows = []
    if filename.lower().endswith(".xlsx"):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            ws = wb.active
            for r in ws.iter_rows(values_only=True):
                text_rows.append(["" if c is None else str(c).strip() for c in r])
        except Exception as e:
            return [], [f"Could not read Excel file: {e}"]
    else:
        try:
            text = content.decode("utf-8-sig")
            text_rows = [row for row in csv.reader(io.StringIO(text)) if any(c.strip() for c in row)]
        except Exception as e:
            return [], [f"Could not read CSV file: {e}"]
    if not text_rows:
        return [], ["The file is empty."]
    header = [h.strip().lower().replace(" ", "_") for h in text_rows[0]]
    missing = [c for c in REQUIRED if c not in header]
    if missing:
        return [], [f"Missing required columns: {', '.join(missing)}. Download the sample template."]
    idx_of = {c: header.index(c) for c in COLUMNS if c in header}
    raw = []
    for r in text_rows[1:]:
        row = {c: (r[idx_of[c]] if idx_of.get(c) is not None and idx_of[c] < len(r) else "") for c in COLUMNS}
        raw.append(row)
    existing = await db.students.find({}, {"reg_id": 1}).to_list(10000)
    db_reg_ids = {s["reg_id"] for s in existing}
    seen = set()
    rows = []
    for i, row in enumerate(raw, start=2):
        errors = _validate_row(row, i, seen, db_reg_ids)
        rows.append({"row": i, "data": row, "errors": errors})
    return rows, []


def import_router(db, get_current_admin):

    @router.get("/import/template.csv")
    async def template(admin=Depends(get_current_admin)):
        out = io.StringIO()
        w = csv.writer(out)
        for r in TEMPLATE_ROWS:
            w.writerow(r)
        return Response(content="﻿" + out.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=student-import-template.csv"})

    @router.post("/import/preview")
    async def preview(file: UploadFile = File(...), admin=Depends(get_current_admin)):
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File must be under 5 MB.")
        rows, fatal = await _parse(db, content, file.filename or "upload.csv")
        if fatal:
            raise HTTPException(status_code=400, detail=" ".join(fatal))
        valid = sum(1 for r in rows if not r["errors"])
        return {"filename": file.filename, "total": len(rows), "valid": valid, "invalid": len(rows) - valid, "rows": rows}

    @router.post("/import/commit")
    async def commit(file: UploadFile = File(...), admin=Depends(get_current_admin)):
        content = await file.read()
        rows, fatal = await _parse(db, content, file.filename or "upload.csv")
        if fatal:
            raise HTTPException(status_code=400, detail=" ".join(fatal))
        imported, skipped = 0, 0
        errors_out = []
        for r in rows:
            if r["errors"]:
                skipped += 1
                errors_out.append({"row": r["row"], "errors": r["errors"]})
                continue
            d = r["data"]
            cls = d["class_name"].strip()
            adm_date = d["admission_date"].strip() or datetime.now(timezone.utc).strftime("%Y-%m-%d")
            session = current_session(datetime.fromisoformat(adm_date + "T00:00:00+00:00"))
            start, end = session_dates(session)
            rid = d["reg_id"].strip().upper() or await generate_reg_id(db, session)
            mobile = re.sub(r"\D", "", d["mobile_primary"])[-10:]
            doc = {
                "reg_id": rid,
                "full_name": d["full_name"].strip(),
                "dob": d["dob"].strip(),
                "father_name": d["father_name"].strip(),
                "mother_name": d["mother_name"].strip(),
                "gender": d["gender"].strip(),
                "mobile_primary": mobile,
                "mobile_alt": (re.sub(r"\D", "", d.get("mobile_alt", ""))[-10:] or None) if d.get("mobile_alt") else None,
                "address": d["address"].strip(),
                "previous_school": d.get("previous_school", "").strip() or None,
                "course": _course_for(cls),
                "class_name": cls,
                "subjects": [],
                "admission_date": adm_date,
                "session": session,
                "session_start": start,
                "session_end": end,
                "roll_number": int(d["roll_number"]) if d.get("roll_number", "").strip() else None,
                "annual_fee": float(d["annual_fee"]) if d.get("annual_fee", "").strip() else 0,
                "admission_status": "Confirmed",
                "status": "Active",
                "photo": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": f"import:{admin['email']}",
                "edit_history": [],
            }
            try:
                await db.students.insert_one(doc)
                imported += 1
            except Exception:
                skipped += 1
                errors_out.append({"row": r["row"], "errors": ["duplicate or database error"]})
        await db.import_history.insert_one({
            "filename": file.filename, "total": len(rows), "imported": imported, "skipped": skipped,
            "by": admin["email"], "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await audit(db, admin, "import.commit", f"Imported {imported}/{len(rows)} students from {file.filename}")
        return {"success": True, "total": len(rows), "imported": imported, "skipped": skipped, "errors": errors_out}

    @router.get("/import/history")
    async def history(admin=Depends(get_current_admin)):
        docs = await db.import_history.find().sort("created_at", -1).limit(50).to_list(50)
        return [{"id": str(d["_id"]), "filename": d["filename"], "total": d["total"], "imported": d["imported"], "skipped": d["skipped"], "by": d["by"], "created_at": d["created_at"]} for d in docs]

    return router
