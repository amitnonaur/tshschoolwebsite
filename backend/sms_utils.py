"""Shared helpers: academic sessions, registration IDs, roll numbers, audit log, settings."""
import re
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException

ALL_CLASSES = ["LKG", "UKG"] + [f"Class {i}" for i in range(1, 9)]
LIVE_CLASSES = ["LKG", "UKG"] + [f"Class {i}" for i in range(1, 9)]
COURSES = ["Pre-Primary", "Primary", "Middle"]
COURSE_CLASSES = {
    "Pre-Primary": ["LKG", "UKG"],
    "Primary": [f"Class {i}" for i in range(1, 6)],
    "Middle": [f"Class {i}" for i in range(6, 9)],
}
DEFAULT_SUBJECTS = ["Mathematics", "English", "Hindi", "EVS"]


def class_rank(cls: str) -> int:
    if cls == "LKG":
        return 0
    if cls == "UKG":
        return 1
    m = re.fullmatch(r"Class (\d+)", cls or "")
    return int(m.group(1)) + 1 if m else 99


def next_class(cls: str) -> str | None:
    ordered = sorted(ALL_CLASSES, key=class_rank)
    r = class_rank(cls)
    for c in ordered:
        if class_rank(c) == r + 1:
            return c
    return None


def current_session(now: datetime | None = None) -> str:
    """Academic session rolls over every 1 April. e.g. 2026-04-01..2027-03-31 -> '2728'."""
    now = now or datetime.now(timezone.utc)
    start_year = now.year if now.month >= 4 else now.year - 1
    return f"{str(start_year)[2:]}{str(start_year + 1)[2:]}"


def session_dates(session: str) -> tuple[str, str]:
    """'2728' -> ('2027-04-01', '2028-03-31')"""
    start = 2000 + int(session[:2])
    return f"{start}-04-01", f"{start + 1}-03-31"


def next_session(session: str) -> str:
    start = int(session[:2]) + 1
    return f"{start:02d}{start + 1:02d}"


async def generate_reg_id(db, session: str) -> str:
    """TSH + session + 4-digit sequence continuing forever across sessions.
    find_one_and_update is atomic, so no two calls can receive the same sequence."""
    doc = await db.counters.find_one_and_update(
        {"_id": "student_seq"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = doc["seq"]
    await db.student_sequences.insert_one(
        {"seq": seq, "session": session, "assigned_at": datetime.now(timezone.utc).isoformat()}
    )
    return f"TSH{session}{seq:04d}"


async def audit(db, admin: dict, action: str, detail: str, entity: str | None = None, entity_id: str | None = None):
    await db.admin_logs.insert_one({
        "admin_id": admin.get("id"),
        "admin_email": admin.get("email"),
        "action": action,
        "detail": detail,
        "entity": entity,
        "entity_id": entity_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def grade_for(pct: float) -> str:
    if pct >= 90: return "A+"
    if pct >= 80: return "A"
    if pct >= 70: return "B+"
    if pct >= 60: return "B"
    if pct >= 50: return "C"
    if pct >= 40: return "D"
    if pct >= 33: return "E"
    return "F"


def serialise(doc: dict) -> dict:
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
