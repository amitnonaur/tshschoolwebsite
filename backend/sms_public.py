"""Public (auth-gated by Reg ID + DOB) student result portal + public videos."""
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
import jwt

from sms_utils import serialise

router = APIRouter(prefix="/api")


def _student_token(reg_id: str) -> str:
    payload = {"sub": reg_id, "type": "student_exam", "exp": datetime.now(timezone.utc) + timedelta(hours=4)}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


async def get_student(request: Request) -> dict:
    token = request.cookies.get("student_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Please log in first.")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "student_exam":
            raise HTTPException(status_code=401, detail="Invalid session")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    return {"reg_id": payload["sub"]}


def public_router(db, get_current_admin):

    @router.get("/student/results")
    async def student_results(sess=Depends(get_student)):
        student = await db.students.find_one({"reg_id": sess["reg_id"]})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        results = await db.test_results.find({"rows.reg_id": sess["reg_id"], "published": True}).sort("year", -1).to_list(100)
        out = []
        for r in results:
            row = next((x for x in r["rows"] if x["reg_id"] == sess["reg_id"]), None)
            if not row:
                continue
            total_students = len(r["rows"])
            out.append({
                "course": r["course"], "class_name": r["class_name"], "month": r["month"], "year": r["year"],
                "subjects": r["subjects"], "max_marks": r["max_marks"],
                "marks": row["marks"], "total": row["total"], "max_total": row["max_total"],
                "percentage": row["percentage"], "grade": row["grade"], "rank": row["rank"],
                "absent_subjects": row.get("absent_subjects", []),
                "class_strength": total_students,
                "class_average": round(sum(x["total"] for x in r["rows"]) / total_students, 2) if total_students else 0,
            })
        # online exam results (published only)
        attempts = await db.exam_attempts.find({"reg_id": sess["reg_id"], "submitted_at": {"$ne": None}}).sort("submitted_at", -1).to_list(100)
        exam_results = []
        for a in attempts:
            exam = await db.exams.find_one({"exam_id": a["exam_id"]})
            if not exam or not exam.get("results_published"):
                continue
            exam_results.append({
                "exam_name": exam["name"], "subject": exam["subject"], "class_name": exam["class_name"],
                "score": a.get("score"), "max_score": a.get("max_score"), "submitted_at": a.get("submitted_at"),
            })
        return {
            "full_name": student["full_name"],
            "reg_id": student["reg_id"],
            "class_name": student["class_name"],
            "monthly_results": out,
            "exam_results": exam_results,
        }

    # ---------- Public video gallery ----------
    @router.get("/public/videos")
    async def public_videos(class_name: str = ""):
        q = {}
        if class_name:
            q["class_name"] = {"$in": [class_name, "All"]}
        docs = await db.videos.find(q).sort("created_at", -1).limit(200).to_list(200)
        return [{
            "video_id": d["video_id"], "title": d["title"], "class_name": d["class_name"],
            "subject": d.get("subject", ""), "youtube_id": d["youtube_id"],
            "description": d.get("description", ""),
        } for d in docs]

    # ---------- Fee receipts ----------
    @router.get("/fees/receipts/{payment_id}")
    async def get_receipt(payment_id: str, admin=Depends(get_current_admin)):
        from bson import ObjectId
        pay = None
        if ObjectId.is_valid(payment_id):
            pay = await db.fee_payments.find_one({"_id": ObjectId(payment_id)})
        if not pay:
            raise HTTPException(status_code=404, detail="Payment not found")
        student = await db.students.find_one({"reg_id": pay["reg_id"]})
        return {
            "payment": serialise(pay),
            "student": {
                "full_name": student["full_name"] if student else pay["reg_id"],
                "reg_id": pay["reg_id"],
                "class_name": student.get("class_name") if student else "",
                "father_name": student.get("father_name") if student else "",
            },
        }

    return router
