"""Videos (YouTube links per class) + Finance Tracker (investment & operational cost)."""
import re
import uuid
import bcrypt
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator

from sms_utils import ALL_CLASSES, current_session, audit, serialise

router = APIRouter(prefix="/api")

YT_RE = re.compile(r"(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{6,15})")


class VideoIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    class_name: str
    subject: str = Field(default="", max_length=80)
    youtube_url: str = Field(min_length=10, max_length=300)
    description: str = Field(default="", max_length=1000)

    @field_validator("class_name")
    @classmethod
    def check_class(cls, v):
        if v != "All" and v not in ALL_CLASSES:
            raise ValueError("Invalid class")
        return v

    @field_validator("youtube_url")
    @classmethod
    def check_youtube(cls, v):
        if not YT_RE.search(v.strip()):
            raise ValueError("Please paste a valid YouTube link (watch, share or shorts URL).")
        return v.strip()


class FinanceEntryIn(BaseModel):
    kind: str
    category: str = Field(min_length=2, max_length=80)
    amount: float = Field(gt=0, le=100000000)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    note: str = Field(default="", max_length=500)

    @field_validator("kind")
    @classmethod
    def check_kind(cls, v):
        if v not in ("investment", "operational"):
            raise ValueError("Type must be investment or operational")
        return v


def extras_router(db, get_current_admin, require_roles):

    # ---------- Videos ----------
    @router.post("/videos")
    async def add_video(payload: VideoIn, admin=Depends(require_roles("admin", "teacher"))):
        vid = YT_RE.search(payload.youtube_url).group(1)
        doc = payload.model_dump()
        doc.update({
            "video_id": uuid.uuid4().hex[:10],
            "youtube_id": vid,
            "created_by": admin["email"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.videos.insert_one(doc)
        await audit(db, admin, "videos.add", f"Added video '{doc['title']}' for {doc['class_name']}")
        return {"success": True, "video_id": doc["video_id"]}

    @router.get("/videos")
    async def list_videos(class_name: str = "", admin=Depends(get_current_admin)):
        q = {}
        if class_name:
            q["class_name"] = class_name
        docs = await db.videos.find(q).sort("created_at", -1).limit(300).to_list(300)
        return [serialise(d) for d in docs]

    @router.delete("/videos/{video_id}")
    async def delete_video(video_id: str, admin=Depends(require_roles("admin", "teacher"))):
        await db.videos.delete_one({"video_id": video_id})
        return {"success": True}

    # ---------- Finance Tracker ----------
    @router.post("/finance/entries")
    async def add_entry(payload: FinanceEntryIn, admin=Depends(require_roles("admin", "accountant"))):
        session = current_session(datetime.fromisoformat(payload.date + "T00:00:00+00:00"))
        doc = payload.model_dump()
        doc.update({
            "entry_id": uuid.uuid4().hex[:10],
            "session": session,
            "recorded_by": admin["email"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.finance_entries.insert_one(doc)
        await audit(db, admin, "finance.add", f"{payload.kind} ₹{payload.amount} ({payload.category})", "finance", doc["entry_id"])
        return {"success": True, "entry_id": doc["entry_id"]}

    @router.get("/finance/entries")
    async def list_entries(kind: str = "", session: str = "", admin=Depends(require_roles("admin", "accountant"))):
        q = {}
        if kind in ("investment", "operational"):
            q["kind"] = kind
        if session:
            q["session"] = session
        docs = await db.finance_entries.find(q).sort("date", -1).limit(1000).to_list(1000)
        return [serialise(d) for d in docs]

    @router.delete("/finance/entries/{entry_id}")
    async def delete_entry(entry_id: str, admin=Depends(require_roles("admin", "accountant"))):
        result = await db.finance_entries.delete_one({"entry_id": entry_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        await audit(db, admin, "finance.delete", f"Deleted finance entry {entry_id}", "finance", entry_id)
        return {"success": True}

    @router.get("/finance/summary")
    async def finance_summary(session: str = "", admin=Depends(require_roles("admin", "accountant"))):
        session = session or current_session()
        entries = await db.finance_entries.find({"session": session}).to_list(5000)
        investment = round(sum(e["amount"] for e in entries if e["kind"] == "investment"), 2)
        operational = round(sum(e["amount"] for e in entries if e["kind"] == "operational"), 2)
        by_cat = {}
        for e in entries:
            key = f'{e["kind"]}:{e["category"]}'
            by_cat[key] = round(by_cat.get(key, 0) + e["amount"], 2)
        fees = await db.fee_payments.find({"session": session}).to_list(20000)
        collected = round(sum(p["amount"] for p in fees), 2)
        return {
            "session": session,
            "investment": investment,
            "operational": operational,
            "fee_collection": collected,
            "net_after_operational": round(collected - operational, 2),
            "by_category": [{"kind": k.split(":")[0], "category": k.split(":")[1], "amount": v} for k, v in sorted(by_cat.items())],
        }

    @router.get("/finance/export.csv")
    async def finance_export(session: str = "", admin=Depends(require_roles("admin", "accountant"))):
        q = {}
        if session:
            q["session"] = session
        docs = await db.finance_entries.find(q).sort("date", -1).to_list(5000)
        rows = [["Date", "Type", "Category", "Amount", "Note", "Session", "Recorded By"]]
        for d in docs:
            rows.append([d["date"], d["kind"], d["category"], d["amount"], d.get("note", ""), d["session"], d.get("recorded_by", "")])
        csv = "\r\n".join(",".join('"' + str(c).replace('"', '""') + '"' for c in r) for r in rows)
        return Response(content="﻿" + csv, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=finance.csv"})

    # ---------- Staff users ----------
    @router.get("/admin/users")
    async def list_users(admin=Depends(require_roles("admin"))):
        docs = await db.users.find({}, {"password_hash": 0}).to_list(100)
        return [serialise(d) for d in docs]

    @router.post("/admin/users")
    async def create_user(payload: dict, admin=Depends(require_roles("admin"))):
        email = (payload.get("email") or "").strip().lower()
        name = (payload.get("name") or "").strip()
        password = payload.get("password") or ""
        role = payload.get("role") or ""
        if role not in ("admin", "accountant", "teacher"):
            raise HTTPException(status_code=400, detail="Role must be admin, accountant or teacher.")
        if not email or "@" not in email:
            raise HTTPException(status_code=400, detail="Valid email required.")
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
        if not name:
            raise HTTPException(status_code=400, detail="Name required.")
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=409, detail="A user with this email already exists.")
        await db.users.insert_one({
            "email": email,
            "password_hash": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
            "name": name,
            "role": role, "active": True, "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": admin["email"],
        })
        await audit(db, admin, "users.create", f"Created {role} account for {email}")
        return {"success": True}

    @router.patch("/admin/users/{user_id}/status")
    async def set_user_status(user_id: str, payload: dict, admin=Depends(require_roles("admin"))):
        from bson import ObjectId
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=404, detail="User not found")
        active = bool(payload.get("active"))
        target = await db.users.find_one({"_id": ObjectId(user_id)})
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if target["email"] == admin["email"]:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"active": active}})
        await audit(db, admin, "users.status", f"{target['email']} -> {'active' if active else 'inactive'}")
        return {"success": True, "active": active}

    return router
