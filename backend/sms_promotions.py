"""Batch promotion with roll re-sequencing, history preservation."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List

from sms_utils import ALL_CLASSES, current_session, next_session, class_rank, session_dates, audit

router = APIRouter(prefix="/api")

DECISIONS = ["Promote", "Hold Back", "Transfer Out", "Mark Inactive"]


class PromotionItem(BaseModel):
    reg_id: str
    decision: str
    new_roll: int | None = None

    @field_validator("decision")
    @classmethod
    def check_decision(cls, v):
        if v not in DECISIONS:
            raise ValueError("Invalid decision")
        return v


class PromotionRun(BaseModel):
    from_class: str
    to_class: str
    from_session: str
    to_session: str
    items: List[PromotionItem]

    @field_validator("from_class", "to_class")
    @classmethod
    def check_class(cls, v):
        if v not in ALL_CLASSES:
            raise ValueError("Invalid class")
        return v

    @field_validator("from_session", "to_session")
    @classmethod
    def check_session(cls, v):
        if not (len(v) == 4 and v.isdigit()):
            raise ValueError("Invalid session format")
        return v


def promotion_router(db, get_current_admin):

    @router.get("/promotions/fetch")
    async def fetch(class_name: str, session: str, admin=Depends(get_current_admin)):
        docs = await db.students.find(
            {"class_name": class_name, "session": session, "status": "Active"},
            {"full_name": 1, "reg_id": 1, "roll_number": 1, "course": 1, "class_name": 1},
        ).sort("roll_number", 1).to_list(500)
        return [{"reg_id": d["reg_id"], "full_name": d["full_name"], "roll_number": d.get("roll_number"), "course": d["course"], "class_name": d["class_name"]} for d in docs]

    @router.post("/promotions/run")
    async def run(payload: PromotionRun, admin=Depends(get_current_admin)):
        promotees = [i for i in payload.items if i.decision == "Promote"]
        # duplicate roll check within target
        new_rolls = [i.new_roll for i in promotees if i.new_roll is not None]
        if len(new_rolls) != len(set(new_rolls)):
            raise HTTPException(status_code=409, detail="Duplicate new roll numbers in your selection.")
        # auto-assign missing rolls sequentially after the highest manual one
        taken = set(new_rolls)
        next_roll = (max(taken) if taken else 0) + 1
        assignments = {}
        for i in promotees:
            if i.new_roll is not None:
                assignments[i.reg_id] = i.new_roll
            else:
                while next_roll in taken:
                    next_roll += 1
                assignments[i.reg_id] = next_roll
                taken.add(next_roll)
        # conflict with existing students in target class/session
        for reg_id, roll in assignments.items():
            conflict = await db.students.find_one({
                "reg_id": {"$ne": reg_id}, "class_name": payload.to_class,
                "session": payload.to_session, "roll_number": roll, "status": {"$ne": "Archived"},
            })
            if conflict:
                raise HTTPException(status_code=409, detail=f"Roll {roll} in {payload.to_class} ({payload.to_session}) is already used by {conflict['full_name']}.")

        results = {"promoted": 0, "held": 0, "transferred": 0, "inactive": 0}
        # Validate all students exist before changing anything
        students = {}
        for item in payload.items:
            stu = await db.students.find_one({"reg_id": item.reg_id})
            if not stu:
                raise HTTPException(status_code=404, detail=f"Student {item.reg_id} not found")
            students[item.reg_id] = stu
        for item in payload.items:
            stu = students[item.reg_id]
            hist = {
                "reg_id": item.reg_id,
                "from_class": stu["class_name"], "to_class": None,
                "from_roll": stu.get("roll_number"), "to_roll": None,
                "from_session": payload.from_session, "to_session": None,
                "decision": item.decision,
                "promoted_at": datetime.now(timezone.utc).isoformat(),
                "by": admin["email"],
            }
            if item.decision == "Promote":
                new_roll = assignments[item.reg_id]
                hist.update({"to_class": payload.to_class, "to_roll": new_roll, "to_session": payload.to_session})
                new_start, new_end = session_dates(payload.to_session)
                await db.students.update_one(
                    {"reg_id": item.reg_id},
                    {"$set": {"class_name": payload.to_class, "session": payload.to_session, "roll_number": new_roll, "session_start": new_start, "session_end": new_end}},
                )
                results["promoted"] += 1
            elif item.decision == "Hold Back":
                hist["to_class"] = stu["class_name"]
                results["held"] += 1
            elif item.decision == "Transfer Out":
                await db.students.update_one({"reg_id": item.reg_id}, {"$set": {"status": "Inactive", "exit_reason": "Transferred out", "exit_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}})
                results["transferred"] += 1
            elif item.decision == "Mark Inactive":
                await db.students.update_one({"reg_id": item.reg_id}, {"$set": {"status": "Inactive"}})
                results["inactive"] += 1
            await db.promotions.insert_one(hist)

        await audit(db, admin, "promotion.run", f"{payload.from_class} -> {payload.to_class} ({payload.from_session} -> {payload.to_session}): {results}")
        return {"success": True, **results}

    @router.get("/promotions/history")
    async def history(admin=Depends(get_current_admin)):
        docs = await db.promotions.find().sort("promoted_at", -1).limit(500).to_list(500)
        out = []
        for d in docs:
            d = dict(d)
            d["id"] = str(d.pop("_id"))
            stu = await db.students.find_one({"reg_id": d["reg_id"]}, {"full_name": 1})
            d["full_name"] = stu["full_name"] if stu else d["reg_id"]
            out.append(d)
        return out

    return router
