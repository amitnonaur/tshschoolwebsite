"""Online exams: admin exam management + student exam interface (Reg ID + DOB login)."""
import random
import re
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import jwt
import os

from sms_utils import ALL_CLASSES, COURSES, audit, serialise

router = APIRouter(prefix="/api")

EXAM_STATUSES = ["draft", "scheduled", "published", "completed", "cancelled"]
QUESTION_TYPES = ["mcq", "truefalse"]
DIFFICULTIES = ["Easy", "Medium", "Hard"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_dt(s: str) -> datetime:
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        raise ValueError(f"Invalid datetime: {s}")


def effective_status(exam: dict) -> str:
    st = exam["status"]
    if st in ("draft", "cancelled"):
        return st
    now = _now()
    end = _parse_dt(exam["end_at"])
    if st == "completed" or now > end:
        return "completed"
    if st == "published" and _parse_dt(exam["start_at"]) <= now <= end:
        return "live"
    return st


class QuestionIn(BaseModel):
    text: str = Field(min_length=3, max_length=2000)
    type: str = "mcq"
    options: List[str] = []
    correct: List[int] = []
    chapter: Optional[str] = Field(default=None, max_length=120)
    difficulty: Optional[str] = None

    @field_validator("type")
    @classmethod
    def check_type(cls, v):
        if v not in QUESTION_TYPES:
            raise ValueError("Question type must be mcq or truefalse")
        return v

    @field_validator("difficulty")
    @classmethod
    def check_diff(cls, v):
        if v is not None and v not in DIFFICULTIES:
            raise ValueError("Invalid difficulty")
        return v


def _validate_question(q: QuestionIn) -> list[str]:
    errors = []
    opts = [o.strip() for o in q.options]
    if q.type == "mcq":
        if len(opts) != 4 or any(not o for o in opts):
            errors.append("MCQ needs exactly 4 non-empty options.")
    else:
        opts = ["True", "False"]
    if not q.correct or any(c < 0 or c >= len(opts) for c in q.correct):
        errors.append("Select at least one valid correct answer.")
    return errors


class ExamIn(BaseModel):
    name: str = Field(min_length=3, max_length=200)
    course: str
    class_name: str
    subject: str = Field(min_length=2, max_length=80)
    start_at: str
    end_at: str
    duration_minutes: int = Field(ge=5, le=300)
    max_attempts: int = Field(default=1, ge=1, le=5)
    instructions: str = Field(default="", max_length=3000)
    negative_marking: bool = True
    marks_correct: float = Field(default=2, gt=0, le=100)
    marks_wrong: float = Field(default=-0.5, le=0, ge=-100)
    shuffle_questions: bool = True
    shuffle_options: bool = True

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


# ---------------- Student auth (Reg ID + DOB) ----------------

def _student_token(reg_id: str) -> str:
    payload = {"sub": reg_id, "type": "student_exam", "exp": _now() + timedelta(hours=4)}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


async def get_student_session(request: Request) -> dict:
    token = request.cookies.get("student_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Please log in with your Registration ID and date of birth.")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "student_exam":
            raise HTTPException(status_code=401, detail="Invalid session")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    return {"reg_id": payload["sub"]}


def exams_router(db, get_current_admin):

    # ---------- Admin: question bank ----------
    @router.get("/question-bank")
    async def bank_list(class_name: str = "", subject: str = "", admin=Depends(get_current_admin)):
        q = {}
        if class_name:
            q["class_name"] = class_name
        if subject:
            q["subject"] = subject
        docs = await db.question_bank.find(q).sort("created_at", -1).limit(500).to_list(500)
        return [serialise(d) for d in docs]

    @router.delete("/question-bank/{qid}")
    async def bank_delete(qid: str, admin=Depends(get_current_admin)):
        await db.question_bank.delete_one({"qid": qid})
        return {"success": True}

    # ---------- Admin: exams ----------
    @router.post("/exams")
    async def create_exam(payload: ExamIn, admin=Depends(get_current_admin)):
        start, end = _parse_dt(payload.start_at), _parse_dt(payload.end_at)
        if end <= start:
            raise HTTPException(status_code=400, detail="End time must be after start time.")
        doc = payload.model_dump()
        doc.update({
            "exam_id": "EX" + uuid.uuid4().hex[:10].upper(),
            "questions": [],
            "status": "draft",
            "results_published": False,
            "created_by": admin["email"],
            "created_at": _now().isoformat(),
            "activity": [{"action": "created", "by": admin["email"], "at": _now().isoformat()}],
        })
        await db.exams.insert_one(doc)
        await audit(db, admin, "exam.create", f"Created exam '{doc['name']}' for {doc['class_name']}", "exam", doc["exam_id"])
        return {"success": True, "exam_id": doc["exam_id"]}

    @router.get("/exams")
    async def list_exams(admin=Depends(get_current_admin)):
        docs = await db.exams.find({}, {"questions": 0}).sort("created_at", -1).limit(200).to_list(200)
        out = []
        for d in docs:
            d = serialise(d)
            d["effective_status"] = effective_status(d)
            d["question_count"] = await db.exams.find_one({"exam_id": d["exam_id"]}, {"questions": 1})
            d["question_count"] = len(d["question_count"].get("questions", []))
            out.append(d)
        return out

    @router.get("/exams/{exam_id}")
    async def get_exam(exam_id: str, admin=Depends(get_current_admin)):
        doc = await db.exams.find_one({"exam_id": exam_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Exam not found")
        doc = serialise(doc)
        doc["effective_status"] = effective_status(doc)
        return doc

    @router.post("/exams/{exam_id}/questions")
    async def add_question(exam_id: str, payload: QuestionIn, admin=Depends(get_current_admin)):
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        if effective_status(exam) not in ("draft", "scheduled"):
            raise HTTPException(status_code=400, detail="Questions can only be edited while the exam is a draft/scheduled.")
        errors = _validate_question(payload)
        if errors:
            raise HTTPException(status_code=400, detail=" ".join(errors))
        opts = [o.strip() for o in payload.options] if payload.type == "mcq" else ["True", "False"]
        q = {
            "qid": uuid.uuid4().hex[:8],
            "text": payload.text.strip(),
            "type": payload.type,
            "options": opts,
            "correct": sorted(set(payload.correct)),
        }
        await db.exams.update_one({"exam_id": exam_id}, {"$push": {"questions": q}})
        if payload.chapter or payload.difficulty:
            await db.question_bank.update_one(
                {"text": q["text"], "class_name": exam["class_name"], "subject": exam["subject"]},
                {"$set": {
                    "text": q["text"], "type": q["type"], "options": opts, "correct": q["correct"],
                    "course": exam["course"], "class_name": exam["class_name"], "subject": exam["subject"],
                    "chapter": payload.chapter, "difficulty": payload.difficulty, "created_at": _now().isoformat(),
                    "qid": q["qid"],
                }},
                upsert=True,
            )
        return {"success": True, "question": q}

    @router.post("/exams/{exam_id}/questions/import")
    async def import_question(exam_id: str, payload: dict, admin=Depends(get_current_admin)):
        exam = await db.exams.find_one({"exam_id": exam_id})
        bank_q = await db.question_bank.find_one({"qid": payload.get("qid", "")})
        if not exam or not bank_q:
            raise HTTPException(status_code=404, detail="Exam or bank question not found")
        if any(q["text"] == bank_q["text"] for q in exam.get("questions", [])):
            raise HTTPException(status_code=409, detail="Question already added to this exam.")
        q = {"qid": uuid.uuid4().hex[:8], "text": bank_q["text"], "type": bank_q["type"], "options": bank_q["options"], "correct": bank_q["correct"]}
        await db.exams.update_one({"exam_id": exam_id}, {"$push": {"questions": q}})
        return {"success": True}

    @router.delete("/exams/{exam_id}/questions/{qid}")
    async def delete_question(exam_id: str, qid: str, admin=Depends(get_current_admin)):
        await db.exams.update_one({"exam_id": exam_id}, {"$pull": {"questions": {"qid": qid}}})
        return {"success": True}

    @router.patch("/exams/{exam_id}/status")
    async def set_exam_status(exam_id: str, payload: dict, admin=Depends(get_current_admin)):
        target = payload.get("status")
        if target not in EXAM_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        if target in ("scheduled", "published"):
            qs = exam.get("questions", [])
            if not qs:
                raise HTTPException(status_code=400, detail="Add at least one question before scheduling/publishing.")
            for q in qs:
                if not q.get("correct"):
                    raise HTTPException(status_code=400, detail="Every question needs a correct answer.")
        entry = {"action": f"status -> {target}", "by": admin["email"], "at": _now().isoformat()}
        await db.exams.update_one({"exam_id": exam_id}, {"$set": {"status": target}, "$push": {"activity": entry}})
        await audit(db, admin, "exam.status", f"Exam '{exam['name']}' -> {target}", "exam", exam_id)
        return {"success": True, "status": target}

    @router.patch("/exams/{exam_id}/extend")
    async def extend_exam(exam_id: str, payload: dict, admin=Depends(get_current_admin)):
        minutes = int(payload.get("minutes", 0))
        if minutes < 1 or minutes > 180:
            raise HTTPException(status_code=400, detail="Extension must be 1–180 minutes.")
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        new_end = (_parse_dt(exam["end_at"]) + timedelta(minutes=minutes)).isoformat()
        await db.exams.update_one({"exam_id": exam_id}, {"$set": {"end_at": new_end}, "$push": {"activity": {"action": f"extended +{minutes}m", "by": admin["email"], "at": _now().isoformat()}}})
        await audit(db, admin, "exam.extend", f"Exam '{exam['name']}' extended by {minutes} minutes", "exam", exam_id)
        return {"success": True, "end_at": new_end}

    @router.get("/exams/{exam_id}/monitor")
    async def monitor(exam_id: str, admin=Depends(get_current_admin)):
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        students = await db.students.find(
            {"class_name": exam["class_name"], "status": "Active"},
            {"full_name": 1, "reg_id": 1, "roll_number": 1},
        ).sort("roll_number", 1).to_list(500)
        attempts = await db.exam_attempts.find({"exam_id": exam_id}).to_list(2000)
        by_student = {}
        for a in attempts:
            by_student.setdefault(a["reg_id"], []).append(a)
        participants = []
        for s in students:
            att = by_student.get(s["reg_id"], [])
            latest = att[-1] if att else None
            participants.append({
                "reg_id": s["reg_id"], "full_name": s["full_name"], "roll_number": s.get("roll_number"),
                "attempts": len(att),
                "status": ("submitted" if latest and latest.get("submitted_at") else ("in_progress" if latest else "not_started")),
                "score": latest.get("score") if latest else None,
                "max_score": latest.get("max_score") if latest else None,
                "submitted_at": latest.get("submitted_at") if latest else None,
            })
        return {
            "exam": serialise({k: v for k, v in exam.items() if k != "questions"}),
            "effective_status": effective_status(exam),
            "results_published": exam.get("results_published", False),
            "total_students": len(students),
            "started": sum(1 for p in participants if p["status"] != "not_started"),
            "submitted": sum(1 for p in participants if p["status"] == "submitted"),
            "participants": participants,
        }

    @router.post("/exams/{exam_id}/publish-results")
    async def publish_results(exam_id: str, admin=Depends(get_current_admin)):
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        await db.exams.update_one({"exam_id": exam_id}, {"$set": {"results_published": True}, "$push": {"activity": {"action": "results published", "by": admin["email"], "at": _now().isoformat()}}})
        await audit(db, admin, "exam.publish_results", f"Results published for '{exam['name']}'", "exam", exam_id)
        return {"success": True}

    # ---------- Student interface ----------
    @router.post("/exam-login")
    async def exam_login(payload: dict, request: Request):
        reg_id = (payload.get("reg_id") or "").strip().upper()
        dob = (payload.get("dob") or "").strip()
        if not reg_id or not dob:
            raise HTTPException(status_code=400, detail="Enter your Registration ID and date of birth.")
        student = await db.students.find_one({"reg_id": reg_id, "status": "Active"})
        if not student or student.get("dob") != dob:
            raise HTTPException(status_code=401, detail="Registration ID or date of birth is incorrect.")
        return {"token": _student_token(reg_id), "full_name": student["full_name"], "class_name": student["class_name"], "reg_id": reg_id}

    @router.get("/student/exams")
    async def student_exams(sess=Depends(get_student_session)):
        student = await db.students.find_one({"reg_id": sess["reg_id"]})
        now = _now()
        exams = await db.exams.find(
            {"class_name": student["class_name"], "status": {"$in": ["scheduled", "published"]}},
            {"questions": 0},
        ).to_list(100)
        out = []
        for e in exams:
            eff = effective_status(e)
            if eff not in ("scheduled", "published", "live"):
                continue
            attempts = await db.exam_attempts.count_documents({"exam_id": e["exam_id"], "reg_id": sess["reg_id"], "submitted_at": {"$ne": None}})
            out.append({
                "exam_id": e["exam_id"], "name": e["name"], "subject": e["subject"],
                "start_at": e["start_at"], "end_at": e["end_at"], "duration_minutes": e["duration_minutes"],
                "instructions": e.get("instructions", ""), "effective_status": eff,
                "max_attempts": e.get("max_attempts", 1), "attempts_used": attempts,
                "results_published": e.get("results_published", False),
                "question_count": None,
            })
        return out

    @router.post("/student/exams/{exam_id}/start")
    async def start_exam(exam_id: str, sess=Depends(get_student_session)):
        reg_id = sess["reg_id"]
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        student = await db.students.find_one({"reg_id": reg_id})
        if student["class_name"] != exam["class_name"] or student["status"] != "Active":
            raise HTTPException(status_code=403, detail="You are not eligible for this exam.")
        if effective_status(exam) != "live":
            raise HTTPException(status_code=400, detail="This exam is not live right now.")
        used = await db.exam_attempts.count_documents({"exam_id": exam_id, "reg_id": reg_id})
        if used >= exam.get("max_attempts", 1):
            raise HTTPException(status_code=409, detail="You have used all your attempts for this exam.")
        open_attempt = await db.exam_attempts.find_one({"exam_id": exam_id, "reg_id": reg_id, "submitted_at": None})
        questions = list(exam["questions"])
        if open_attempt:
            attempt = open_attempt
            order = attempt["question_order"]
            questions = sorted(questions, key=lambda q: order.index(q["qid"]))
        else:
            if exam.get("shuffle_questions", True):
                random.shuffle(questions)
            started = _now()
            deadline = min(started + timedelta(minutes=exam["duration_minutes"]), _parse_dt(exam["end_at"]))
            attempt = {
                "attempt_id": uuid.uuid4().hex[:12],
                "exam_id": exam_id,
                "reg_id": reg_id,
                "started_at": started.isoformat(),
                "deadline": deadline.isoformat(),
                "submitted_at": None,
                "question_order": [q["qid"] for q in questions],
                "answers": {},
                "suspicious": [],
            }
            await db.exam_attempts.insert_one(attempt)
        safe_questions = []
        for q in questions:
            opts = list(enumerate(q["options"]))
            if exam.get("shuffle_options", True):
                random.shuffle(opts)
            safe_questions.append({
                "qid": q["qid"], "text": q["text"], "type": q["type"],
                "options": [{"index": i, "text": t} for i, t in opts],
            })
        return {
            "attempt_id": attempt["attempt_id"],
            "deadline": attempt["deadline"],
            "server_now": _now().isoformat(),
            "duration_minutes": exam["duration_minutes"],
            "marks_correct": exam.get("marks_correct", 2),
            "marks_wrong": exam.get("marks_wrong", -0.5) if exam.get("negative_marking", True) else 0,
            "negative_marking": exam.get("negative_marking", True),
            "questions": safe_questions,
        }

    @router.post("/student/exams/{exam_id}/submit")
    async def submit_exam(exam_id: str, payload: dict, sess=Depends(get_student_session)):
        reg_id = sess["reg_id"]
        exam = await db.exams.find_one({"exam_id": exam_id})
        attempt = await db.exam_attempts.find_one({"exam_id": exam_id, "reg_id": reg_id, "submitted_at": None})
        if not exam or not attempt:
            raise HTTPException(status_code=404, detail="No active attempt found.")
        now = _now()
        deadline = _parse_dt(attempt["deadline"])
        auto = now > deadline + timedelta(seconds=60)
        answers = payload.get("answers", {})
        score = 0.0
        max_score = 0.0
        per_q = {}
        for q in exam["questions"]:
            max_score += exam.get("marks_correct", 2)
            chosen = answers.get(q["qid"])
            if chosen is None:
                per_q[q["qid"]] = {"chosen": None, "correct": False, "marks": 0}
                continue
            chosen_set = set(chosen if isinstance(chosen, list) else [chosen])
            correct_set = set(q["correct"])
            if chosen_set == correct_set:
                marks = exam.get("marks_correct", 2)
            else:
                marks = exam.get("marks_wrong", -0.5) if exam.get("negative_marking", True) else 0
            score += marks
            per_q[q["qid"]] = {"chosen": sorted(chosen_set), "correct": chosen_set == correct_set, "marks": marks}
        score = max(score, 0)
        await db.exam_attempts.update_one(
            {"attempt_id": attempt["attempt_id"]},
            {"$set": {
                "answers": answers, "per_question": per_q, "score": round(score, 2), "max_score": max_score,
                "submitted_at": now.isoformat(), "auto_submitted": auto,
            }},
        )
        return {"success": True, "auto_submitted": auto, "results_published": exam.get("results_published", False), "score": round(score, 2) if exam.get("results_published") else None}

    @router.get("/student/exams/{exam_id}/result")
    async def student_result(exam_id: str, sess=Depends(get_student_session)):
        exam = await db.exams.find_one({"exam_id": exam_id})
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        if not exam.get("results_published"):
            raise HTTPException(status_code=403, detail="Results are not published yet.")
        attempt = await db.exam_attempts.find_one({"exam_id": exam_id, "reg_id": sess["reg_id"], "submitted_at": {"$ne": None}}, sort=[("submitted_at", -1)])
        if not attempt:
            raise HTTPException(status_code=404, detail="No submitted attempt found.")
        return {
            "exam_name": exam["name"], "subject": exam["subject"],
            "score": attempt.get("score"), "max_score": attempt.get("max_score"),
            "submitted_at": attempt.get("submitted_at"),
        }

    return router
