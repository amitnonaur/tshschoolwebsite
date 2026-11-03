"""Materials (file sharing by class/subject) + Announcements."""
import base64
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId

from sms_utils import ALL_CLASSES, audit, serialise

router = APIRouter(prefix="/api")
MAX_FILE_BYTES = 5 * 1024 * 1024


class AnnouncementIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    body: str = Field(min_length=3, max_length=3000)
    audience: str = "All"
    published: bool = True

    @field_validator("audience")
    @classmethod
    def check_audience(cls, v):
        if v != "All" and v not in ALL_CLASSES:
            raise ValueError("Invalid audience")
        return v


def content_router(db, get_current_admin):

    # ---------- Materials ----------
    @router.post("/materials")
    async def upload_material(
        title: str = Form(...), class_name: str = Form(...), subject: str = Form(""),
        description: str = Form(""), file: UploadFile = File(...),
        admin=Depends(get_current_admin),
    ):
        if class_name not in ALL_CLASSES and class_name != "All":
            raise HTTPException(status_code=400, detail="Invalid class")
        content = await file.read()
        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(status_code=400, detail="File must be under 5 MB.")
        doc = {
            "title": title.strip()[:200],
            "class_name": class_name,
            "subject": subject.strip()[:80],
            "description": description.strip()[:1000],
            "filename": file.filename or "file",
            "content_type": file.content_type or "application/octet-stream",
            "size": len(content),
            "data_b64": base64.b64encode(content).decode(),
            "created_by": admin["email"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.materials.insert_one(doc)
        await audit(db, admin, "materials.upload", f"Uploaded material '{doc['title']}' for {class_name}")
        return {"success": True, "id": str(result.inserted_id)}

    @router.get("/materials")
    async def list_materials(class_name: str = "", admin=Depends(get_current_admin)):
        q = {}
        if class_name:
            q["class_name"] = class_name
        docs = await db.materials.find(q, {"data_b64": 0}).sort("created_at", -1).limit(300).to_list(300)
        return [serialise(d) for d in docs]

    @router.get("/materials/{mid}/download")
    async def download_material(mid: str, admin=Depends(get_current_admin)):
        if not ObjectId.is_valid(mid):
            raise HTTPException(status_code=404, detail="Material not found")
        doc = await db.materials.find_one({"_id": ObjectId(mid)})
        if not doc:
            raise HTTPException(status_code=404, detail="Material not found")
        content = base64.b64decode(doc["data_b64"])
        return Response(
            content=content,
            media_type=doc["content_type"],
            headers={"Content-Disposition": f'attachment; filename="{doc["filename"]}"'},
        )

    @router.delete("/materials/{mid}")
    async def delete_material(mid: str, admin=Depends(get_current_admin)):
        if not ObjectId.is_valid(mid):
            raise HTTPException(status_code=404, detail="Material not found")
        await db.materials.delete_one({"_id": ObjectId(mid)})
        await audit(db, admin, "materials.delete", f"Deleted material {mid}")
        return {"success": True}

    # ---------- Announcements ----------
    @router.post("/announcements")
    async def create_announcement(payload: AnnouncementIn, admin=Depends(get_current_admin)):
        doc = payload.model_dump()
        doc.update({"created_by": admin["email"], "created_at": datetime.now(timezone.utc).isoformat()})
        result = await db.announcements.insert_one(doc)
        await audit(db, admin, "announcements.create", f"Announcement '{doc['title']}' for {doc['audience']}")
        return {"success": True, "id": str(result.inserted_id)}

    @router.get("/announcements")
    async def list_announcements(admin=Depends(get_current_admin)):
        docs = await db.announcements.find().sort("created_at", -1).limit(200).to_list(200)
        return [serialise(d) for d in docs]

    @router.delete("/announcements/{aid}")
    async def delete_announcement(aid: str, admin=Depends(get_current_admin)):
        if not ObjectId.is_valid(aid):
            raise HTTPException(status_code=404, detail="Announcement not found")
        await db.announcements.delete_one({"_id": ObjectId(aid)})
        return {"success": True}

    # ---------- Photo Gallery ----------
    @router.post("/gallery")
    async def upload_photo(
        title: str = Form(...), caption: str = Form(""), category: str = Form("General"),
        file: UploadFile = File(...), admin=Depends(get_current_admin),
    ):
        if category not in ("General", "Classrooms", "Activities", "Sports", "Events", "Building"):
            raise HTTPException(status_code=400, detail="Invalid category")
        content = await file.read()
        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(status_code=400, detail="Photo must be under 5 MB.")
        ct = file.content_type or ""
        if ct not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail="Photo must be JPG, PNG or WebP.")
        doc = {
            "title": title.strip()[:200],
            "caption": caption.strip()[:500],
            "category": category,
            "content_type": ct,
            "data_b64": base64.b64encode(content).decode(),
            "size": len(content),
            "created_by": admin["email"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.gallery.insert_one(doc)
        await audit(db, admin, "gallery.upload", f"Uploaded photo '{doc['title']}' ({category})")
        return {"success": True, "id": str(result.inserted_id)}

    @router.get("/gallery")
    async def list_gallery(category: str = "", admin=Depends(get_current_admin)):
        q = {}
        if category:
            q["category"] = category
        docs = await db.gallery.find(q).sort("created_at", -1).limit(200).to_list(200)
        return [serialise(d) for d in docs]

    @router.get("/public/gallery")
    async def public_gallery(category: str = ""):
        q = {}
        if category:
            q["category"] = category
        docs = await db.gallery.find(q).sort("created_at", -1).limit(200).to_list(200)
        return [{
            "id": str(d["_id"]), "title": d["title"], "caption": d.get("caption", ""),
            "category": d.get("category", "General"), "content_type": d["content_type"],
            "data_b64": d["data_b64"], "created_at": d["created_at"],
        } for d in docs]

    @router.delete("/gallery/{gid}")
    async def delete_photo(gid: str, admin=Depends(get_current_admin)):
        if not ObjectId.is_valid(gid):
            raise HTTPException(status_code=404, detail="Photo not found")
        await db.gallery.delete_one({"_id": ObjectId(gid)})
        await audit(db, admin, "gallery.delete", f"Deleted photo {gid}")
        return {"success": True}

    return router
