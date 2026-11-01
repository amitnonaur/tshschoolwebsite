from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import re
import time
import uuid
import ipaddress
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

VALID_CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]
ENQUIRY_TYPES = ["Admission", "Fees", "Academics", "Visit", "General"]
ENQUIRY_STATUSES = ["new", "contacted", "closed"]

logger = logging.getLogger(__name__)

# ---------------- Email (Emergent managed Resend) ----------------

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ["OWNER_EMAIL"]

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            code = e.response.json().get("code", "")
        except ValueError:
            code = ""
        if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning(f"Email paused: {code} ({e.response.status_code})")
            raise HTTPException(status_code=503, detail="Email is temporarily unavailable")
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def _row(label: str, value: str | None) -> str:
    if not value:
        return ""
    return (
        f'<tr><td style="padding:8px 12px;font-weight:bold;color:#123D62;vertical-align:top;'
        f'white-space:nowrap">{escape(label)}</td>'
        f'<td style="padding:8px 12px;color:#1E293B">{escape(str(value))}</td></tr>'
    )


async def _notify_owner(subject: str, rows: str, intro: str) -> None:
    """Fire-and-forget: email failures must never break form submissions."""
    try:
        html = (
            '<table role="presentation" width="100%"><tr><td style="padding:24px;'
            'font-family:Arial,sans-serif;font-size:14px">'
            f'<h2 style="margin:0 0 8px;color:#123D62">{escape(EMAIL_FROM_NAME)}</h2>'
            f'<p style="color:#475569">{escape(intro)}</p>'
            f'<table role="presentation" style="border:1px solid #E2E8F0;border-radius:8px;'
            f'border-collapse:collapse;margin-top:12px">{rows}</table>'
            f'<p style="font-size:12px;color:#94A3B8;margin-top:16px">Sent by '
            f'{escape(EMAIL_FROM_NAME)} website. We never ask for passwords or card details by email.</p>'
            '</td></tr></table>'
        )
        email_id = await send_email(to=OWNER_EMAIL, subject=subject, html=html)
        logger.info(f"Owner notification sent: {email_id}")
    except Exception as e:
        logger.error(f"Owner notification email failed (form data is safely stored): {e}")


# ---------------- Rate limiting & helpers ----------------

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


# ---------------- Public form models ----------------

class EnquiryIn(BaseModel):
    parent_name: str = Field(min_length=2, max_length=120)
    child_name: Optional[str] = Field(default=None, max_length=120)
    class_of_interest: str
    phone: str
    email: Optional[EmailStr] = None
    preferred_contact: str = "phone"
    message: Optional[str] = Field(default=None, max_length=2000)
    consent: bool
    website: Optional[str] = None

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
    website: Optional[str] = None

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


# ---------------- Auth (admin) ----------------

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


LOCKOUT_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@api_router.post("/auth/login")
async def login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    record = await db.login_attempts.find_one({"identifier": identifier})
    if record and record.get("locked_until") and record["locked_until"] > datetime.now(timezone.utc):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again in 15 minutes.")
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or not verify_password(payload.password, user["password_hash"]):
        attempts = (record or {}).get("attempts", 0) + 1
        update = {"identifier": identifier, "attempts": attempts}
        if attempts >= LOCKOUT_ATTEMPTS:
            update["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
            update["attempts"] = 0
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="none",
        max_age=12 * 3600, path="/",
    )
    return {"email": email, "name": user.get("name", "Admin"), "role": "admin"}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", samesite="none", secure=True)
    return {"success": True}


@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


# ---------------- Admin dashboard endpoints ----------------

def _serialise(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = doc.pop("enquiry_id", None) or str(doc.pop("_id"))
    doc.pop("_id", None)
    return doc


@api_router.get("/admin/enquiries")
async def list_enquiries(admin=Depends(get_current_admin)):
    docs = await db.enquiries.find().sort("created_at", -1).limit(500).to_list(500)
    return [_serialise(d) for d in docs]


@api_router.get("/admin/contact-messages")
async def list_contact_messages(admin=Depends(get_current_admin)):
    docs = await db.contact_messages.find().sort("created_at", -1).limit(500).to_list(500)
    return [_serialise(d) for d in docs]


class StatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def check_status(cls, v):
        if v not in ENQUIRY_STATUSES:
            raise ValueError("Invalid status.")
        return v


async def _update_status(collection, item_id: str, status: str):
    result = await collection.update_one({"enquiry_id": item_id}, {"$set": {"status": status}})
    if result.matched_count == 0 and ObjectId.is_valid(item_id):
        result = await collection.update_one({"_id": ObjectId(item_id)}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"success": True, "status": status}


@api_router.patch("/admin/enquiries/{item_id}/status")
async def update_enquiry_status(item_id: str, payload: StatusUpdate, admin=Depends(get_current_admin)):
    return await _update_status(db.enquiries, item_id, payload.status)


@api_router.patch("/admin/contact-messages/{item_id}/status")
async def update_message_status(item_id: str, payload: StatusUpdate, admin=Depends(get_current_admin)):
    return await _update_status(db.contact_messages, item_id, payload.status)


# ---------------- Public endpoints ----------------

@api_router.get("/")
async def root():
    return {"message": "The Study Home School API"}


@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryIn, request: Request):
    if payload.website:
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
    doc["enquiry_id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    doc["source"] = "admission_enquiry_form"
    await db.enquiries.insert_one(doc)
    rows = (
        _row("Parent / guardian", doc["parent_name"])
        + _row("Child", doc.get("child_name"))
        + _row("Class of interest", doc["class_of_interest"])
        + _row("Mobile", doc["phone"])
        + _row("Email", doc.get("email"))
        + _row("Preferred contact", "WhatsApp" if doc["preferred_contact"] == "whatsapp" else "Phone call")
        + _row("Message", doc.get("message"))
        + _row("Received", doc["created_at"][:16].replace("T", " ") + " UTC")
    )
    await _notify_owner(
        subject=f"New Admission Enquiry — {doc['class_of_interest']} ({doc['parent_name']})",
        rows=rows,
        intro="A new admission enquiry has been submitted on the school website.",
    )
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
    doc["enquiry_id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    doc["source"] = "contact_form"
    await db.contact_messages.insert_one(doc)
    rows = (
        _row("Name", doc["name"])
        + _row("Mobile", doc["phone"])
        + _row("Enquiry type", doc["enquiry_type"])
        + _row("Message", doc["message"])
        + _row("Received", doc["created_at"][:16].replace("T", " ") + " UTC")
    )
    await _notify_owner(
        subject=f"New Contact Message — {doc['enquiry_type']} ({doc['name']})",
        rows=rows,
        intro="A new message has been submitted through the school website contact form.",
    )
    return {"success": True, "message": "Thank you! Your message has been received. We will get back to you soon."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    admin_email = os.environ.get("ADMIN_EMAIL", "")
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email.lower()})
        if existing is None:
            await db.users.insert_one({
                "email": admin_email.lower(),
                "password_hash": hash_password(admin_password),
                "name": "School Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Admin account seeded")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
