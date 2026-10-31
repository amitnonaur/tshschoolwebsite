from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import time
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

VALID_CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]
ENQUIRY_TYPES = ["Admission", "Fees", "Academics", "Visit", "General"]

# Simple in-memory rate limiting (per IP)
_rate_log = defaultdict(list)
RATE_LIMIT = 5
RATE_WINDOW = 60


def _rate_limited(ip: str) -> bool:
    now = time.time()
    _rate_log[ip] = [t for t in _rate_log[ip] if now - t < RATE_WINDOW]
    if len(_rate_log[ip]) >= RATE_LIMIT:
        return True
    _rate_log[ip].append(now)
    return False


def _normalise_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if not re.fullmatch(r"[6-9]\d{9}", digits):
        raise ValueError("Please enter a valid 10-digit Indian mobile number.")
    return digits


class EnquiryIn(BaseModel):
    parent_name: str = Field(min_length=2, max_length=120)
    child_name: Optional[str] = Field(default=None, max_length=120)
    class_of_interest: str
    phone: str
    email: Optional[EmailStr] = None
    preferred_contact: str = "phone"
    message: Optional[str] = Field(default=None, max_length=2000)
    consent: bool
    website: Optional[str] = None  # honeypot

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v):
        return _normalise_phone(v)

    @field_validator("class_of_interest")
    @classmethod
    def check_class(cls, v):
        if v not in VALID_CLASSES:
            raise ValueError("Please choose a class between Class 1 and Class 5.")
        return v

    @field_validator("preferred_contact")
    @classmethod
    def check_contact_pref(cls, v):
        if v not in ("phone", "whatsapp"):
            raise ValueError("Preferred contact method must be phone or WhatsApp.")
        return v

    @field_validator("consent")
    @classmethod
    def check_consent(cls, v):
        if v is not True:
            raise ValueError("Please accept the privacy policy to submit the enquiry.")
        return v


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str
    enquiry_type: str = "General"
    message: str = Field(min_length=5, max_length=2000)
    website: Optional[str] = None  # honeypot

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v):
        return _normalise_phone(v)

    @field_validator("enquiry_type")
    @classmethod
    def check_type(cls, v):
        if v not in ENQUIRY_TYPES:
            raise ValueError("Invalid enquiry type.")
        return v


@api_router.get("/")
async def root():
    return {"message": "The Study Home School API"}


@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryIn, request: Request):
    if payload.website:  # honeypot filled -> likely spam; pretend ok, store nothing
        return JSONResponse({"success": True, "message": "Thank you for your enquiry."})
    ip = request.client.host if request.client else "unknown"
    if _rate_limited(ip):
        return JSONResponse(
            status_code=429,
            content={"success": False, "message": "Too many submissions. Please wait a minute and try again."},
        )
    recent = await db.enquiries.find_one(
        {
            "phone": payload.phone,
            "class_of_interest": payload.class_of_interest,
            "created_at": {"$gte": datetime.fromtimestamp(time.time() - 120, tz=timezone.utc).isoformat()},
        }
    )
    if recent:
        return JSONResponse(
            status_code=409,
            content={"success": False, "message": "We have already received this enquiry. We will contact you soon."},
        )
    doc = payload.model_dump(mode="json")
    doc.pop("website", None)
    doc["email"] = str(doc["email"]) if doc.get("email") else None
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    doc["source"] = "admission_enquiry_form"
    await db.enquiries.insert_one(doc)
    return {
        "success": True,
        "message": "Thank you! Your enquiry has been received. The school will contact you using your preferred method.",
    }


@api_router.post("/contact")
async def create_contact(payload: ContactIn, request: Request):
    if payload.website:
        return JSONResponse({"success": True, "message": "Thank you for your message."})
    ip = request.client.host if request.client else "unknown"
    if _rate_limited(ip):
        return JSONResponse(
            status_code=429,
            content={"success": False, "message": "Too many submissions. Please wait a minute and try again."},
        )
    doc = payload.model_dump(mode="json")
    doc.pop("website", None)
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    doc["source"] = "contact_form"
    await db.contact_messages.insert_one(doc)
    return {"success": True, "message": "Thank you! Your message has been received. We will get back to you soon."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
