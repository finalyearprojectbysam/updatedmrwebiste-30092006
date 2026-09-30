"""Marca Rise backend — AI assistant (MJ), certificate verification, and admin panel."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import io
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Annotated

import bcrypt
import jwt
import pandas as pd
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from marca_knowledge import build_system_prompt

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("marca")

# ---------------------------------------------------------------- DB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Canonical certificate fields
CERT_FIELDS = [
    "certificate_id", "student_name", "college_name", "department",
    "internship_role", "internship_duration", "start_date", "end_date",
    "project_name", "technologies", "certificate_status", "issue_date",
    "student_id", "internship_domain", "mentor", "grade", "remarks",
]
# Fields safe to expose to the public verification / chatbot
PUBLIC_FIELDS = [
    "certificate_id", "student_name", "college_name", "department",
    "internship_role", "internship_duration", "start_date", "end_date",
    "project_name", "technologies", "certificate_status", "issue_date",
    "internship_domain", "mentor", "grade",
]

# ---------------------------------------------------------------- Models
PyObjectId = Annotated[str, BeforeValidator(str)]


class AdminLogin(BaseModel):
    email: str
    password: str


class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    certificate_id: str
    student_name: str
    college_name: str = ""
    department: str = ""
    internship_role: str = ""
    internship_duration: str = ""
    start_date: str = ""
    end_date: str = ""
    project_name: str = ""
    technologies: str = ""
    certificate_status: str = "active"
    issue_date: str = ""
    student_id: str = ""
    internship_domain: str = ""
    mentor: str = ""
    grade: str = ""
    remarks: str = ""


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context_certificate: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = None


class ImportCommit(BaseModel):
    rows: List[Dict[str, Any]]
    duplicate_mode: str = "skip"  # skip | update


# ---------------------------------------------------------------- Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


security = HTTPBearer(auto_error=False)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access" or payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.admins.find_one({"email": payload["sub"]})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return {"email": admin["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------- Certificate helpers
CERT_ID_RE = re.compile(r"[A-Z0-9]+(?:-[A-Z0-9]+)+")


def extract_certificate_id(text: str) -> Optional[str]:
    """Detect a certificate-id-like token (e.g. MR26-FS-00128)."""
    upper = text.upper()
    candidates = CERT_ID_RE.findall(upper)
    for c in candidates:
        if any(ch.isdigit() for ch in c) and len(c) >= 6:
            return c.strip("-")
    return None


def public_view(doc: dict) -> dict:
    return {k: doc.get(k, "") for k in PUBLIC_FIELDS}


def clean_cell(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and pd.isna(value):
        return ""
    s = str(value).strip()
    if s.lower() in ("nan", "nat", "none"):
        return ""
    # Trim pandas datetime tails "2026-01-01 00:00:00"
    if s.endswith(" 00:00:00"):
        s = s[:-9]
    return s


HEADER_ALIASES = {
    "certificate_id": "certificate_id", "certificateid": "certificate_id", "cert_id": "certificate_id",
    "certificate": "certificate_id", "id": "certificate_id", "certificate_no": "certificate_id",
    "student_name": "student_name", "name": "student_name", "student": "student_name",
    "college_name": "college_name", "college": "college_name",
    "department": "department", "dept": "department",
    "internship_role": "internship_role", "role": "internship_role",
    "internship_duration": "internship_duration", "duration": "internship_duration",
    "start_date": "start_date", "start": "start_date",
    "end_date": "end_date", "end": "end_date",
    "project_name": "project_name", "project": "project_name",
    "technologies": "technologies", "technology": "technologies", "tech": "technologies", "tech_stack": "technologies",
    "certificate_status": "certificate_status", "status": "certificate_status",
    "issue_date": "issue_date", "issued": "issue_date", "issued_date": "issue_date", "date_of_issue": "issue_date",
    "student_id": "student_id",
    "internship_domain": "internship_domain", "domain": "internship_domain",
    "mentor": "mentor", "grade": "grade", "remarks": "remarks", "remark": "remarks",
}


def normalize_header(h: str) -> Optional[str]:
    key = re.sub(r"[^a-z0-9]+", "_", str(h).strip().lower()).strip("_")
    return HEADER_ALIASES.get(key)


def normalize_status(s: str) -> str:
    s = (s or "").strip().lower()
    if s in ("revoked", "revoke", "cancelled", "canceled", "invalid"):
        return "revoked"
    if s in ("inactive", "expired"):
        return "inactive"
    return "active"


# ---------------------------------------------------------------- App
app = FastAPI(title="Marca Rise API")
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"message": "Marca Rise API online"}


# ---------- Chat ----------
@api.post("/chat")
async def chat(req: ChatRequest):
    message = (req.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Empty message")

    cert_id = extract_certificate_id(message)
    verify_intent = "verify" in message.lower() or "certificate" in message.lower()

    # ---- Certificate verification path (DB is source of truth) ----
    if cert_id and (verify_intent or "-" in cert_id):
        doc = await db.certificates.find_one({"certificate_id": cert_id})
        if not doc:
            # try case-insensitive
            doc = await db.certificates.find_one(
                {"certificate_id": {"$regex": f"^{re.escape(cert_id)}$", "$options": "i"}}
            )
        if not doc:
            return {
                "type": "certificate",
                "status": "not_found",
                "mascot": "confused",
                "reply": "I couldn't find a certificate matching that ID in the Marca Rise verification database. Please double-check the ID and try again.",
                "certificate": None,
            }
        status = normalize_status(doc.get("certificate_status", "active"))
        cert = public_view(doc)
        cert["certificate_status"] = status.upper()
        if status == "revoked":
            return {
                "type": "certificate", "status": "revoked", "mascot": "warning",
                "reply": "This certificate is currently marked as revoked in the Marca Rise verification system.",
                "certificate": cert,
            }
        return {
            "type": "certificate", "status": "verified", "mascot": "success",
            "reply": f"Certificate verified successfully. This is a genuine Marca Rise certificate issued to {cert.get('student_name','the student')}.",
            "certificate": cert,
        }

    # ---- Normal AI assistant path ----
    if not EMERGENT_LLM_KEY:
        return {"type": "text", "mascot": "error", "certificate": None,
                "reply": "The AI assistant isn't configured right now. Please try again later."}
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        system_prompt = build_system_prompt(req.context_certificate)
        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=req.session_id or "marca-mj",
            system_message=system_prompt,
        ).with_model("openai", "gpt-5.4")

        # Give short recent history as context
        convo = ""
        if req.history:
            for turn in req.history[-6:]:
                role = turn.get("role", "user")
                convo += f"\n{role.upper()}: {turn.get('content','')}"
        text = message if not convo else f"Recent conversation:{convo}\n\nCurrent question: {message}"

        reply = await chat_client.send_message(UserMessage(text=text))
        reply_text = reply if isinstance(reply, str) else str(reply)
        return {"type": "text", "mascot": "explaining", "certificate": None, "reply": reply_text.strip()}
    except Exception as e:
        logger.exception("chat error")
        return {"type": "text", "mascot": "error", "certificate": None,
                "reply": "Sorry, I ran into a problem answering that. Please try again in a moment."}


# ---------- Public verification ----------
@api.get("/verify/{cert_id}")
async def verify_public(cert_id: str):
    doc = await db.certificates.find_one(
        {"certificate_id": {"$regex": f"^{re.escape(cert_id.upper())}$", "$options": "i"}}
    )
    if not doc:
        return {"status": "not_found", "certificate": None}
    status = normalize_status(doc.get("certificate_status", "active"))
    cert = public_view(doc)
    cert["certificate_status"] = status.upper()
    return {"status": "revoked" if status == "revoked" else "verified", "certificate": cert}


# ---------- Admin auth ----------
@api.post("/admin/login")
async def admin_login(body: AdminLogin):
    email = body.email.strip().lower()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(body.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(email)
    return {"access_token": token, "email": email}


@api.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return admin


# ---------- Admin stats ----------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    total = await db.certificates.count_documents({})
    active = await db.certificates.count_documents({"certificate_status": {"$regex": "^active$", "$options": "i"}})
    revoked = await db.certificates.count_documents({"certificate_status": {"$regex": "^revoked$", "$options": "i"}})
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    this_month = await db.certificates.count_documents({"created_at": {"$gte": month_start}})
    return {"total": total, "active": active, "revoked": revoked, "this_month": this_month}


# ---------- Admin certificate CRUD ----------
@api.get("/admin/certificates")
async def list_certificates(
    admin: dict = Depends(get_current_admin),
    search: str = "", status: str = "", page: int = 1, limit: int = 20,
):
    query: Dict[str, Any] = {}
    if search:
        rx = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [
            {"certificate_id": rx}, {"student_name": rx},
            {"college_name": rx}, {"internship_role": rx}, {"project_name": rx},
        ]
    if status:
        query["certificate_status"] = {"$regex": f"^{re.escape(status)}$", "$options": "i"}
    total = await db.certificates.count_documents(query)
    skip = max(0, (page - 1) * limit)
    cursor = db.certificates.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items, "total": total, "page": page, "limit": limit}


@api.get("/admin/certificates/export")
async def export_certificates(admin: dict = Depends(get_current_admin)):
    cursor = db.certificates.find({}, {"_id": 0})
    docs = await cursor.to_list(length=100000)
    df = pd.DataFrame(docs, columns=CERT_FIELDS) if docs else pd.DataFrame(columns=CERT_FIELDS)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Certificates")
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=marca_rise_certificates.xlsx"},
    )


@api.get("/admin/certificates/{cert_id}")
async def get_certificate(cert_id: str, admin: dict = Depends(get_current_admin)):
    doc = await db.certificates.find_one({"certificate_id": cert_id.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return doc


async def _upsert_certificate(data: dict) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    data["certificate_id"] = data["certificate_id"].strip().upper()
    data["certificate_status"] = normalize_status(data.get("certificate_status", "active"))
    existing = await db.certificates.find_one({"certificate_id": data["certificate_id"]})
    if existing:
        data["updated_at"] = now
        await db.certificates.update_one({"certificate_id": data["certificate_id"]}, {"$set": data})
        return {"action": "updated"}
    data["created_at"] = now
    data["updated_at"] = now
    await db.certificates.insert_one(data)
    return {"action": "created"}


@api.post("/admin/certificates")
async def create_certificate(cert: Certificate, admin: dict = Depends(get_current_admin)):
    data = cert.model_dump()
    return await _upsert_certificate(data)


@api.put("/admin/certificates/{cert_id}")
async def update_certificate(cert_id: str, cert: Certificate, admin: dict = Depends(get_current_admin)):
    data = cert.model_dump()
    data["certificate_id"] = cert_id.upper()
    await _upsert_certificate(data)
    return {"action": "saved"}


@api.patch("/admin/certificates/{cert_id}/status")
async def set_status(cert_id: str, body: Dict[str, str], admin: dict = Depends(get_current_admin)):
    status = normalize_status(body.get("status", "active"))
    res = await db.certificates.update_one(
        {"certificate_id": cert_id.upper()},
        {"$set": {"certificate_status": status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"certificate_id": cert_id.upper(), "certificate_status": status}


@api.delete("/admin/certificates/{cert_id}")
async def delete_certificate(cert_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.certificates.delete_one({"certificate_id": cert_id.upper()})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"deleted": cert_id.upper()}


# ---------- Excel import ----------
@api.post("/admin/certificates/import/preview")
async def import_preview(admin: dict = Depends(get_current_admin), file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Please upload an .xlsx or .xls file")
    content = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(content), dtype=str)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the spreadsheet. Ensure it is a valid Excel file.")

    # Map headers
    col_map: Dict[str, str] = {}
    for col in df.columns:
        canon = normalize_header(col)
        if canon:
            col_map[col] = canon
    mapped_fields = set(col_map.values())
    if "certificate_id" not in mapped_fields or "student_name" not in mapped_fields:
        raise HTTPException(
            status_code=400,
            detail="Missing required columns. The sheet must include at least 'Certificate ID' and 'Student Name'.",
        )

    rows: List[dict] = []
    errors: List[dict] = []
    seen_ids = set()
    for idx, raw in df.iterrows():
        record: Dict[str, Any] = {f: "" for f in CERT_FIELDS}
        for col, canon in col_map.items():
            record[canon] = clean_cell(raw.get(col))
        rownum = int(idx) + 2  # +2 for header + 1-index
        cid = record.get("certificate_id", "").strip().upper()
        record["certificate_id"] = cid
        if not cid:
            errors.append({"row": rownum, "message": "Missing Certificate ID"})
            continue
        if not record.get("student_name"):
            errors.append({"row": rownum, "message": f"Missing Student Name for {cid}"})
            continue
        if cid in seen_ids:
            errors.append({"row": rownum, "message": f"Duplicate Certificate ID within file: {cid}"})
            continue
        seen_ids.add(cid)
        record["certificate_status"] = normalize_status(record.get("certificate_status", "active"))
        rows.append(record)

    existing_ids = []
    if rows:
        ids = [r["certificate_id"] for r in rows]
        cursor = db.certificates.find({"certificate_id": {"$in": ids}}, {"_id": 0, "certificate_id": 1})
        existing_ids = [d["certificate_id"] async for d in cursor]

    return {
        "total": len(rows),
        "rows": rows,
        "errors": errors,
        "existing_ids": existing_ids,
        "existing_count": len(existing_ids),
    }


@api.post("/admin/certificates/import/commit")
async def import_commit(body: ImportCommit, admin: dict = Depends(get_current_admin)):
    inserted = updated = skipped = 0
    now = datetime.now(timezone.utc).isoformat()
    for raw in body.rows:
        cid = str(raw.get("certificate_id", "")).strip().upper()
        if not cid:
            continue
        record = {f: str(raw.get(f, "") or "") for f in CERT_FIELDS}
        record["certificate_id"] = cid
        record["certificate_status"] = normalize_status(record.get("certificate_status", "active"))
        existing = await db.certificates.find_one({"certificate_id": cid})
        if existing:
            if body.duplicate_mode == "update":
                record["updated_at"] = now
                await db.certificates.update_one({"certificate_id": cid}, {"$set": record})
                updated += 1
            else:
                skipped += 1
        else:
            record["created_at"] = now
            record["updated_at"] = now
            await db.certificates.insert_one(record)
            inserted += 1
    return {"inserted": inserted, "updated": updated, "skipped": skipped}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- Startup
@app.on_event("startup")
async def startup():
    await db.certificates.create_index("certificate_id", unique=True)
    await db.admins.create_index("email", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@marcarise.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.admins.find_one({"email": admin_email})
    if not existing:
        await db.admins.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.admins.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password for %s", admin_email)

    # write test credentials
    try:
        mem = Path("/app/memory")
        mem.mkdir(exist_ok=True)
        (mem / "test_credentials.md").write_text(
            f"# Test Credentials\n\n## Admin Panel (/admin)\n- URL: /admin\n- Email: {admin_email}\n- Password: {admin_password}\n\n"
            "## Endpoints\n- POST /api/admin/login\n- GET /api/admin/me\n- GET /api/admin/stats\n- GET /api/admin/certificates\n"
            "- POST /api/admin/certificates/import/preview\n- POST /api/admin/certificates/import/commit\n- POST /api/chat\n- GET /api/verify/{cert_id}\n"
        )
    except Exception:
        pass


@app.on_event("shutdown")
async def shutdown():
    client.close()
