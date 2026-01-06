from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import JWTError, jwt
import asyncio
import httpx
import base64
import io
import resend
from emergentintegrations.llm.chat import LlmChat, UserMessage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from questions_data import EXPANDED_QUESTIONS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Xendit Config
XENDIT_API_KEY = os.environ.get('XENDIT_API_KEY', '')
XENDIT_WEBHOOK_TOKEN = os.environ.get('XENDIT_WEBHOOK_TOKEN', '')

# Resend Config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@relasi4warna.com')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Relasi4Warna API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["auth"])
quiz_router = APIRouter(prefix="/quiz", tags=["quiz"])
payment_router = APIRouter(prefix="/payment", tags=["payment"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])
report_router = APIRouter(prefix="/report", tags=["report"])
share_router = APIRouter(prefix="/share", tags=["share"])
couples_router = APIRouter(prefix="/couples", tags=["couples"])
email_router = APIRouter(prefix="/email", tags=["email"])

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    language: str = "id"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    language: str
    is_admin: bool = False
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class QuizAttemptCreate(BaseModel):
    series: str  # family, business, friendship, couples
    language: str = "id"

class QuizAnswer(BaseModel):
    question_id: str
    selected_option: str  # archetype: driver, spark, anchor, analyst
    answer_value: Optional[int] = None  # for likert scale

class QuizSubmit(BaseModel):
    attempt_id: str
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    result_id: str
    user_id: str
    series: str
    primary_archetype: str
    secondary_archetype: str
    scores: Dict[str, float]
    balance_index: float
    stress_flag: bool
    created_at: datetime

class PaymentCreate(BaseModel):
    result_id: str
    product_type: str  # single_report, family_pack, team_pack, couples_pack, subscription
    currency: str = "IDR"

class QuestionCreate(BaseModel):
    series: str
    question_id_text: str
    question_en_text: str
    question_type: str = "forced_choice"
    options: List[Dict[str, Any]]
    scoring_map: Dict[str, float]
    stress_marker_flag: bool = False
    active: bool = True
    order: int = 0

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"user_id": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@auth_router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "language": data.language,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, data.email)
    user_response = UserResponse(
        user_id=user_id,
        email=data.email,
        name=data.name,
        language=data.language,
        is_admin=False,
        created_at=datetime.fromisoformat(user_doc["created_at"])
    )
    return TokenResponse(access_token=token, user=user_response)

@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["email"])
    user_response = UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        language=user.get("language", "id"),
        is_admin=user.get("is_admin", False),
        created_at=datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@auth_router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        language=user.get("language", "id"),
        is_admin=user.get("is_admin", False),
        created_at=datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    )

@auth_router.get("/session")
async def get_session(request: Request):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=401, detail="No session ID")
    
    # Fetch session data from Emergent Auth
    emergent_auth_url = os.environ.get('EMERGENT_AUTH_URL', 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data')
    async with httpx.AsyncClient() as client:
        response = await client.get(
            emergent_auth_url,
            headers={"X-Session-ID": session_id}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session_data = response.json()
        email = session_data.get("email")
        name = session_data.get("name", "")
        
        # Find or create user
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if not user:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "password_hash": "",
                "language": "id",
                "is_admin": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user)
        
        # Create session token
        session_token = f"session_{uuid.uuid4().hex}"
        await db.user_sessions.insert_one({
            "user_id": user["user_id"],
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "user_id": user["user_id"],
            "email": email,
            "name": name,
            "session_token": session_token
        }

# ==================== PASSWORD RESET ====================

# Rate limiting configuration
FORGOT_PASSWORD_RATE_LIMIT = 3  # max requests
FORGOT_PASSWORD_RATE_WINDOW = 3600  # 1 hour in seconds

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

async def check_rate_limit(email: str) -> tuple[bool, int, int]:
    """
    Check if email has exceeded rate limit for password reset requests.
    Returns: (is_allowed, remaining_attempts, seconds_until_reset)
    """
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=FORGOT_PASSWORD_RATE_WINDOW)
    
    # Count recent requests for this email
    recent_requests = await db.password_reset_attempts.count_documents({
        "email": email.lower(),
        "timestamp": {"$gte": window_start.isoformat()}
    })
    
    if recent_requests >= FORGOT_PASSWORD_RATE_LIMIT:
        # Find the oldest request in the window to calculate reset time
        oldest = await db.password_reset_attempts.find_one(
            {"email": email.lower(), "timestamp": {"$gte": window_start.isoformat()}},
            sort=[("timestamp", 1)]
        )
        if oldest:
            oldest_time = datetime.fromisoformat(oldest["timestamp"].replace("Z", "+00:00"))
            seconds_until_reset = int((oldest_time + timedelta(seconds=FORGOT_PASSWORD_RATE_WINDOW) - now).total_seconds())
            return False, 0, max(0, seconds_until_reset)
        return False, 0, FORGOT_PASSWORD_RATE_WINDOW
    
    return True, FORGOT_PASSWORD_RATE_LIMIT - recent_requests - 1, 0

async def record_reset_attempt(email: str):
    """Record a password reset attempt for rate limiting"""
    await db.password_reset_attempts.insert_one({
        "email": email.lower(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Clean up old attempts (older than 24 hours)
    cleanup_time = datetime.now(timezone.utc) - timedelta(hours=24)
    await db.password_reset_attempts.delete_many({
        "timestamp": {"$lt": cleanup_time.isoformat()}
    })

@auth_router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Request password reset - sends email with reset link (rate limited: 3/hour)"""
    email = data.email.lower().strip()
    
    # Check rate limit first
    is_allowed, remaining, seconds_until_reset = await check_rate_limit(email)
    
    if not is_allowed:
        minutes = seconds_until_reset // 60
        raise HTTPException(
            status_code=429,
            detail={
                "message": f"Terlalu banyak permintaan. Coba lagi dalam {minutes} menit." if minutes > 0 else "Terlalu banyak permintaan. Coba lagi nanti.",
                "message_en": f"Too many requests. Try again in {minutes} minutes." if minutes > 0 else "Too many requests. Try again later.",
                "retry_after": seconds_until_reset
            }
        )
    
    # Record this attempt
    await record_reset_attempt(email)
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    # Always return success to prevent email enumeration
    if not user:
        return {
            "message": "If the email exists, a reset link has been sent",
            "remaining_attempts": remaining
        }
    
    # Check if user registered with Google (no password)
    if user.get("google_id") and not user.get("hashed_password"):
        return {
            "message": "This account uses Google login. Please use Google to sign in.",
            "remaining_attempts": remaining
        }
    
    # Generate reset token
    reset_token = f"reset_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.delete_many({"email": email})  # Remove old tokens
    await db.password_resets.insert_one({
        "email": email,
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "used": False
    })
    
    # Send reset email
    app_url = os.environ.get('APP_URL', 'https://relasi4warna.com')
    reset_link = f"{app_url}/reset-password?token={reset_token}"
    
    resend_api_key = os.environ.get('RESEND_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL', 'noreply@relasi4warna.com')
    
    if resend_api_key:
        try:
            import resend
            resend.api_key = resend_api_key
            
            html_content = f"""
            <div style="font-family: 'Merriweather', Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #FDFCF8; padding: 40px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4A3B32; margin: 0;">Relasi4Warna</h1>
                    <p style="color: #7A6E62; font-size: 14px;">Human Relationship Intelligence</p>
                </div>
                
                <h2 style="color: #4A3B32; font-size: 20px;">Reset Password</h2>
                
                <p style="color: #7A6E62; line-height: 1.6;">
                    Anda menerima email ini karena ada permintaan untuk mereset password akun Relasi4Warna Anda.
                </p>
                
                <p style="color: #7A6E62; line-height: 1.6;">
                    Klik tombol di bawah untuk membuat password baru:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #4A3B32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #7A6E62; font-size: 14px; line-height: 1.6;">
                    Link ini akan kadaluarsa dalam <strong>1 jam</strong>.
                </p>
                
                <p style="color: #7A6E62; font-size: 14px; line-height: 1.6;">
                    Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
                </p>
                
                <hr style="border: none; border-top: 1px solid #E6E2D8; margin: 30px 0;">
                
                <p style="color: #7A6E62; font-size: 12px; text-align: center;">
                    © {datetime.now().year} Relasi4Warna. All rights reserved.
                </p>
            </div>
            """
            
            resend.Emails.send({
                "from": f"Relasi4Warna <{sender_email}>",
                "to": [data.email],
                "subject": "Reset Password - Relasi4Warna",
                "html": html_content
            })
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            # Still return success to prevent email enumeration
    else:
        logger.warning(f"RESEND_API_KEY not set. Reset link for {email}: {reset_link}")
    
    return {
        "message": "If the email exists, a reset link has been sent",
        "remaining_attempts": remaining
    }

@auth_router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using token from email"""
    # Find the reset token
    reset_record = await db.password_resets.find_one(
        {"token": data.token, "used": False},
        {"_id": 0}
    )
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update user's password
    hashed_password = hash_password(data.new_password)
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password has been reset successfully"}

@auth_router.get("/verify-reset-token")
async def verify_reset_token(token: str):
    """Verify if reset token is valid"""
    reset_record = await db.password_resets.find_one(
        {"token": token, "used": False},
        {"_id": 0}
    )
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    return {"valid": True, "email": reset_record["email"]}

# ==================== QUIZ ROUTES ====================

@quiz_router.get("/series")
async def get_series():
    """Get all quiz series"""
    series_list = [
        {
            "id": "family",
            "name_id": "Keluarga",
            "name_en": "Family",
            "description_id": "Pahami dinamika komunikasi dalam keluarga Anda",
            "description_en": "Understand communication dynamics in your family",
            "icon": "home",
            "color": "#5D8A66"
        },
        {
            "id": "business",
            "name_id": "Bisnis",
            "name_en": "Business",
            "description_id": "Tingkatkan komunikasi tim dan mitra kerja",
            "description_en": "Improve team and business partner communication",
            "icon": "briefcase",
            "color": "#5B8FA8"
        },
        {
            "id": "friendship",
            "name_id": "Persahabatan",
            "name_en": "Friendship",
            "description_id": "Perkuat ikatan dengan sahabat Anda",
            "description_en": "Strengthen bonds with your friends",
            "icon": "users",
            "color": "#D99E30"
        },
        {
            "id": "couples",
            "name_id": "Pasangan",
            "name_en": "Couples",
            "description_id": "Bangun komunikasi yang lebih intim dengan pasangan",
            "description_en": "Build more intimate communication with your partner",
            "icon": "heart",
            "color": "#C05640"
        }
    ]
    return {"series": series_list}

@quiz_router.get("/questions/{series}")
async def get_questions(series: str, language: str = "id"):
    """Get questions for a specific series"""
    questions = await db.questions.find(
        {"series": series, "active": True},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    if not questions:
        # Return seed questions if none exist
        questions = await seed_questions_for_series(series)
    
    # Format questions based on language
    formatted = []
    for q in questions:
        formatted.append({
            "question_id": q.get("question_id", str(uuid.uuid4())),
            "text": q.get(f"question_{language}_text", q.get("question_id_text", "")),
            "type": q.get("question_type", "forced_choice"),
            "options": q.get("options", []),
            "order": q.get("order", 0)
        })
    
    return {"questions": formatted, "total": len(formatted)}

@quiz_router.post("/start")
async def start_quiz(data: QuizAttemptCreate, user=Depends(get_current_user)):
    """Start a new quiz attempt"""
    attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
    attempt = {
        "attempt_id": attempt_id,
        "user_id": user["user_id"],
        "series": data.series,
        "language": data.language,
        "status": "in_progress",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "answers": []
    }
    await db.quiz_attempts.insert_one(attempt)
    return {"attempt_id": attempt_id, "series": data.series}

@quiz_router.post("/submit")
async def submit_quiz(data: QuizSubmit, user=Depends(get_current_user)):
    """Submit quiz answers and calculate results"""
    attempt = await db.quiz_attempts.find_one(
        {"attempt_id": data.attempt_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    
    # Calculate scores
    scores = {"driver": 0, "spark": 0, "anchor": 0, "analyst": 0}
    stress_markers = 0
    
    for answer in data.answers:
        archetype = answer.selected_option.lower()
        if archetype in scores:
            scores[archetype] += 1
        
        # Check stress markers
        question = await db.questions.find_one({"question_id": answer.question_id}, {"_id": 0})
        if question and question.get("stress_marker_flag") and archetype == "driver":
            stress_markers += 1
    
    # Determine primary and secondary archetypes
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_scores[0][0]
    secondary = sorted_scores[1][0]
    
    # Calculate balance index
    max_score = max(scores.values())
    min_score = min(scores.values())
    total_questions = len(data.answers) or 1
    balance_index = round((max_score - min_score) / total_questions, 2)
    
    # Stress flag
    stress_flag = stress_markers >= 3
    
    # Create result
    result_id = f"result_{uuid.uuid4().hex[:12]}"
    result = {
        "result_id": result_id,
        "user_id": user["user_id"],
        "attempt_id": data.attempt_id,
        "series": attempt["series"],
        "primary_archetype": primary,
        "secondary_archetype": secondary,
        "scores": scores,
        "balance_index": balance_index,
        "stress_flag": stress_flag,
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.results.insert_one(result)
    
    # Update attempt
    await db.quiz_attempts.update_one(
        {"attempt_id": data.attempt_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat(), "answers": [a.dict() for a in data.answers]}}
    )
    
    return {
        "result_id": result_id,
        "primary_archetype": primary,
        "secondary_archetype": secondary,
        "scores": scores,
        "balance_index": balance_index,
        "stress_flag": stress_flag
    }

@quiz_router.get("/result/{result_id}")
async def get_result(result_id: str, user=Depends(get_current_user)):
    """Get quiz result"""
    result = await db.results.find_one(
        {"result_id": result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@quiz_router.get("/history")
async def get_history(user=Depends(get_current_user)):
    """Get user's quiz history"""
    results = await db.results.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"results": results}

# ==================== ARCHETYPE DATA ====================

ARCHETYPES = {
    "driver": {
        "name_id": "Penggerak",
        "name_en": "Driver",
        "color": "#C05640",
        "bg_color": "#FDF3F1",
        "summary_id": "Anda adalah sosok yang tegas dan berorientasi pada hasil. Anda memiliki kemampuan alami untuk mengambil keputusan cepat dan memimpin orang lain menuju tujuan. Ketegasan Anda membantu tim bergerak maju, namun penting untuk tetap mendengarkan perspektif orang lain.",
        "summary_en": "You are a decisive and results-oriented individual. You have a natural ability to make quick decisions and lead others toward goals. Your assertiveness helps teams move forward, but it's important to still listen to others' perspectives.",
        "strengths_id": ["Tegas dalam mengambil keputusan", "Fokus pada hasil", "Memotivasi orang lain", "Efisien dalam bekerja", "Berani menghadapi tantangan"],
        "strengths_en": ["Decisive in making decisions", "Results-focused", "Motivates others", "Efficient in work", "Brave in facing challenges"],
        "blindspots_id": ["Cenderung mendominasi percakapan", "Kurang sabar dengan proses", "Bisa terkesan tidak sensitif", "Sulit mendelegasikan", "Mengabaikan detail kecil"],
        "blindspots_en": ["Tends to dominate conversations", "Less patient with processes", "Can seem insensitive", "Difficulty delegating", "Overlooks small details"],
        "under_stress_id": ["Menjadi lebih mengontrol", "Lebih cepat marah", "Mengambil alih tanpa konsultasi"],
        "under_stress_en": ["Becomes more controlling", "Gets angry faster", "Takes over without consulting"],
        "communication_tips_id": ["Langsung ke inti masalah", "Berikan fakta dan data", "Hormati waktu mereka", "Tawarkan solusi, bukan masalah", "Biarkan mereka memimpin jika memungkinkan"],
        "communication_tips_en": ["Get straight to the point", "Provide facts and data", "Respect their time", "Offer solutions, not problems", "Let them lead when possible"]
    },
    "spark": {
        "name_id": "Percikan",
        "name_en": "Spark",
        "color": "#D99E30",
        "bg_color": "#FFF9EB",
        "summary_id": "Anda adalah energi positif dalam setiap interaksi. Kemampuan Anda untuk terhubung dengan orang lain dan menciptakan suasana yang menyenangkan membuat Anda menjadi pusat perhatian alami. Kreativitas dan antusiasme Anda menginspirasi orang di sekitar Anda.",
        "summary_en": "You are positive energy in every interaction. Your ability to connect with others and create a pleasant atmosphere makes you a natural center of attention. Your creativity and enthusiasm inspire those around you.",
        "strengths_id": ["Komunikator yang baik", "Kreatif dan inovatif", "Membangun hubungan dengan mudah", "Antusias dan optimis", "Fleksibel dengan perubahan"],
        "strengths_en": ["Good communicator", "Creative and innovative", "Builds relationships easily", "Enthusiastic and optimistic", "Flexible with change"],
        "blindspots_id": ["Kurang fokus pada detail", "Bisa terlalu impulsif", "Kesulitan menyelesaikan tugas", "Terlalu banyak bicara", "Menghindari konflik"],
        "blindspots_en": ["Lacks focus on details", "Can be too impulsive", "Difficulty completing tasks", "Talks too much", "Avoids conflict"],
        "under_stress_id": ["Menjadi lebih dramatis", "Mencari perhatian berlebihan", "Sulit berkonsentrasi"],
        "under_stress_en": ["Becomes more dramatic", "Seeks excessive attention", "Has difficulty concentrating"],
        "communication_tips_id": ["Buat suasana yang hangat", "Dengarkan cerita mereka", "Berikan apresiasi", "Libatkan dalam brainstorming", "Jangan terlalu kaku"],
        "communication_tips_en": ["Create a warm atmosphere", "Listen to their stories", "Give appreciation", "Involve in brainstorming", "Don't be too rigid"]
    },
    "anchor": {
        "name_id": "Jangkar",
        "name_en": "Anchor",
        "color": "#5D8A66",
        "bg_color": "#F1F7F3",
        "summary_id": "Anda adalah pilar ketenangan dan stabilitas. Dalam situasi yang kacau, Anda menjadi tempat berlindung yang dapat diandalkan. Kesabaran dan kesetiaan Anda membuat hubungan Anda bertahan lama dan bermakna.",
        "summary_en": "You are a pillar of calm and stability. In chaotic situations, you become a reliable haven. Your patience and loyalty make your relationships lasting and meaningful.",
        "strengths_id": ["Sabar dan tenang", "Pendengar yang baik", "Dapat diandalkan", "Setia dan konsisten", "Menciptakan harmoni"],
        "strengths_en": ["Patient and calm", "Good listener", "Dependable", "Loyal and consistent", "Creates harmony"],
        "blindspots_id": ["Sulit mengatakan tidak", "Menghindari perubahan", "Memendam perasaan", "Lambat dalam mengambil keputusan", "Terlalu mengalah"],
        "blindspots_en": ["Difficulty saying no", "Avoids change", "Holds feelings inside", "Slow in making decisions", "Too yielding"],
        "under_stress_id": ["Menarik diri", "Menjadi pasif-agresif", "Menolak berbicara tentang masalah"],
        "under_stress_en": ["Withdraws", "Becomes passive-aggressive", "Refuses to talk about problems"],
        "communication_tips_id": ["Berikan waktu untuk berpikir", "Jangan menekan untuk keputusan cepat", "Tunjukkan apresiasi", "Buat lingkungan yang aman", "Konsisten dalam perilaku"],
        "communication_tips_en": ["Give time to think", "Don't pressure for quick decisions", "Show appreciation", "Create a safe environment", "Be consistent in behavior"]
    },
    "analyst": {
        "name_id": "Analis",
        "name_en": "Analyst",
        "color": "#5B8FA8",
        "bg_color": "#F0F7FA",
        "summary_id": "Anda adalah pemikir yang sistematis dan teliti. Kemampuan Anda untuk menganalisis situasi secara mendalam membantu mengambil keputusan yang tepat. Standar tinggi Anda memastikan kualitas dalam setiap pekerjaan.",
        "summary_en": "You are a systematic and thorough thinker. Your ability to analyze situations deeply helps make the right decisions. Your high standards ensure quality in every work.",
        "strengths_id": ["Analitis dan teliti", "Standar kualitas tinggi", "Pemecah masalah yang baik", "Terorganisir", "Berpikir logis"],
        "strengths_en": ["Analytical and thorough", "High quality standards", "Good problem solver", "Organized", "Logical thinking"],
        "blindspots_id": ["Terlalu kritis", "Perfeksionis berlebihan", "Sulit menerima kritik", "Kurang spontan", "Menganalisis berlebihan"],
        "blindspots_en": ["Too critical", "Excessive perfectionism", "Difficulty accepting criticism", "Lacks spontaneity", "Over-analyzes"],
        "under_stress_id": ["Menjadi lebih kritis", "Menarik diri untuk menganalisis", "Menolak kompromi"],
        "under_stress_en": ["Becomes more critical", "Withdraws to analyze", "Refuses compromise"],
        "communication_tips_id": ["Berikan data dan fakta", "Hormati kebutuhan akan detail", "Berikan waktu persiapan", "Hindari tekanan emosional", "Hargai ketelitian mereka"],
        "communication_tips_en": ["Provide data and facts", "Respect the need for detail", "Give preparation time", "Avoid emotional pressure", "Appreciate their thoroughness"]
    }
}

@quiz_router.get("/archetypes")
async def get_archetypes():
    """Get archetype information"""
    return {"archetypes": ARCHETYPES}

@quiz_router.get("/archetype/{archetype}")
async def get_archetype(archetype: str, language: str = "id"):
    """Get specific archetype details"""
    archetype_data = ARCHETYPES.get(archetype.lower())
    if not archetype_data:
        raise HTTPException(status_code=404, detail="Archetype not found")
    return archetype_data

# ==================== PAYMENT ROUTES ====================

PRODUCTS = {
    "single_report": {"price_idr": 99000, "price_usd": 6.99, "name_id": "Laporan Lengkap", "name_en": "Full Report"},
    "family_pack": {"price_idr": 349000, "price_usd": 24.99, "name_id": "Paket Keluarga (6 orang)", "name_en": "Family Pack (6 people)"},
    "team_pack": {"price_idr": 499000, "price_usd": 34.99, "name_id": "Paket Tim (10 orang)", "name_en": "Team Pack (10 people)"},
    "couples_pack": {"price_idr": 149000, "price_usd": 9.99, "name_id": "Paket Pasangan", "name_en": "Couples Pack"},
    "subscription": {"price_idr": 199000, "price_usd": 14.99, "name_id": "Langganan Bulanan", "name_en": "Monthly Subscription"}
}

@payment_router.get("/products")
async def get_products():
    """Get available products"""
    return {"products": PRODUCTS}

@payment_router.post("/create")
async def create_payment(data: PaymentCreate, user=Depends(get_current_user)):
    """Create a payment session"""
    product = PRODUCTS.get(data.product_type)
    if not product:
        raise HTTPException(status_code=400, detail="Invalid product type")
    
    amount = product["price_idr"] if data.currency == "IDR" else product["price_usd"]
    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    
    # Create payment record
    payment = {
        "payment_id": payment_id,
        "user_id": user["user_id"],
        "result_id": data.result_id,
        "product_type": data.product_type,
        "amount": amount,
        "currency": data.currency,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payments.insert_one(payment)
    
    # For demo, return mock payment URL
    # In production, integrate with Xendit API
    return {
        "payment_id": payment_id,
        "payment_url": f"/checkout/{payment_id}",
        "amount": amount,
        "currency": data.currency
    }

@payment_router.post("/webhook")
async def payment_webhook(request: Request):
    """Handle Xendit webhook"""
    # Verify webhook token
    callback_token = request.headers.get("x-callback-token")
    if callback_token != XENDIT_WEBHOOK_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid webhook token")
    
    body = await request.json()
    payment_id = body.get("external_id")
    status = body.get("status")
    
    if status == "PAID":
        # Update payment status
        await db.payments.update_one(
            {"payment_id": payment_id},
            {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update result to paid
        payment = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0})
        if payment:
            await db.results.update_one(
                {"result_id": payment["result_id"]},
                {"$set": {"is_paid": True}}
            )
    
    return {"status": "received"}

@payment_router.post("/simulate-payment/{payment_id}")
async def simulate_payment(payment_id: str, user=Depends(get_current_user)):
    """Simulate successful payment for demo"""
    payment = await db.payments.find_one({"payment_id": payment_id, "user_id": user["user_id"]}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment status
    await db.payments.update_one(
        {"payment_id": payment_id},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update result to paid
    await db.results.update_one(
        {"result_id": payment["result_id"]},
        {"$set": {"is_paid": True}}
    )
    
    return {"status": "success", "message": "Payment simulated successfully"}

# ==================== REPORT ROUTES ====================

@report_router.post("/generate/{result_id}")
async def generate_report(result_id: str, language: str = "id", user=Depends(get_current_user)):
    """Generate AI-powered premium relationship intelligence report"""
    result = await db.results.find_one(
        {"result_id": result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    if not result.get("is_paid", False):
        raise HTTPException(status_code=402, detail="Payment required for detailed report")
    
    # Check if report already exists
    existing_report = await db.reports.find_one(
        {"result_id": result_id, "language": language},
        {"_id": 0}
    )
    if existing_report:
        return existing_report
    
    # Generate report using AI
    primary = result["primary_archetype"]
    secondary = result["secondary_archetype"]
    series = result["series"]
    scores = result["scores"]
    balance_index = result.get("balance_index", 0)
    stress_flag = result.get("stress_flag", False)
    
    # Drive names mapping
    drive_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    series_names = {
        "family": {"id": "Keluarga", "en": "Family"},
        "couples": {"id": "Pasangan Hidup", "en": "Life Partner / Couples"},
        "business": {"id": "Bisnis & Profesional", "en": "Business & Professional"},
        "friendship": {"id": "Persahabatan & Sosial", "en": "Friendship & Social"}
    }
    
    primary_name = drive_names.get(primary, {}).get("en", primary.title())
    secondary_name = drive_names.get(secondary, {}).get("en", secondary.title())
    series_name = series_names.get(series, {}).get("en", series.title())
    
    # Comprehensive system prompt for Relationship Intelligence
    system_prompt = """You are an advanced Human Relationship Intelligence system,
combining expertise from:
- Relationship coaching
- Conflict resolution
- Behavioral pattern analysis
- Communication strategy
- Emotional regulation
- Adult relational maturity development

Your mission is NOT to label people,
but to help humans understand themselves,
regulate their emotions,
and build healthy, sustainable relationships
in an era of increasing individualism and digital isolation.

====================================================
ABSOLUTE ETHICAL, LEGAL & IP CONSTRAINTS (MANDATORY)
====================================================
1. All content MUST be 100% original and proprietary.
2. Do NOT reference any books, authors, DISC, MBTI, or third-party frameworks.
3. Do NOT provide medical, psychological, or clinical diagnoses.
4. Position this system strictly as:
   - self-reflection
   - communication awareness
   - relational maturity development
5. Do NOT promise outcomes or "fix people".
6. Language must be compassionate, respectful, and non-judgmental.
7. The system must empower personal responsibility, not blame others.
8. All outputs must be globally monetizable and safe for public distribution.

====================================================
CORE PRODUCT POSITIONING
====================================================
Product Type:
- Premium Relationship Intelligence Assessment & Guidance Platform

Core Philosophy:
"People are not broken.
They are often unheard, unregulated, and misunderstood."

Internal Proprietary Framework:
- 4 Human Communication Drives
  (use these names consistently, no external references):
  A) Driver – acts through direction and decisiveness
  B) Spark – acts through expression and connection
  C) Anchor – acts through stability and harmony
  D) Analyst – acts through structure and accuracy"""

    # User prompt with structured input
    user_prompt = f"""
====================================================
INPUT DATA
====================================================
{{
  "language": "{language}",
  "series": "{series_name}",
  "primary_drive": "{primary_name}",
  "secondary_drive": "{secondary_name}",
  "scores": {{
    "Driver": {scores.get("driver", 0)},
    "Spark": {scores.get("spark", 0)},
    "Anchor": {scores.get("anchor", 0)},
    "Analyst": {scores.get("analyst", 0)}
  }},
  "stress_flag": {str(stress_flag).lower()},
  "balance_index": {balance_index}
}}

====================================================
LANGUAGE REQUIREMENT
====================================================
Output language: {"Indonesian (Bahasa Indonesia)" if language == "id" else "English"}
Write the ENTIRE report in {"Indonesian" if language == "id" else "English"}.

====================================================
CORE TASK — PREMIUM DEEP RELATIONSHIP REPORT
====================================================
Generate a DEEP, PERSONALIZED, TRANSFORMATIVE report
that genuinely helps the user navigate human relationships.

The report MUST include ALL sections below,
with concrete, practical, and emotionally intelligent guidance.
Format in Markdown with clear headings (##).

----------------------------------------------------
SECTION 1 — PERSONAL RELATIONAL DNA
----------------------------------------------------
Explain how the user's primary ({primary_name}) and secondary ({secondary_name}) drives shape:
- how they speak
- how they listen
- how they decide
- how they react under pressure

Write in a way that feels like:
"Someone finally understands me."

----------------------------------------------------
SECTION 2 — INNER CONFLICT MAP
----------------------------------------------------
Identify:
- the core inner tension they carry
- what they deeply need but rarely express
- what they fear losing in relationships
- how this creates repeated conflict patterns

Avoid blaming language.
Focus on awareness and responsibility.

----------------------------------------------------
SECTION 3 — EMOTIONAL TRIGGERS & ESCALATION PATTERN
----------------------------------------------------
Describe clearly:
- what typically triggers them
- how their emotions escalate step by step
- early warning signs before conflict explodes
- how their reaction unintentionally affects others

----------------------------------------------------
SECTION 4 — SELF-REGULATION & EMOTIONAL STABILITY GUIDE
----------------------------------------------------
Provide a PERSONALIZED regulation guide:
- what to do immediately when emotions rise
- what to avoid saying or doing
- grounding actions aligned with their drive
- how to pause without suppressing feelings

This section must feel practical and usable in real life.

----------------------------------------------------
SECTION 5 — INTERACTION STRATEGY WITH DIFFERENT DRIVES
----------------------------------------------------
For EACH of the other three drives, provide:
- how to communicate safely
- what tone works best
- phrases to USE (real scripts)
- phrases to AVOID
- how to set boundaries without damaging the relationship

This section is CRITICAL for real-world value.

----------------------------------------------------
SECTION 6 — CONFLICT RECOVERY & REPAIR SYSTEM
----------------------------------------------------
Guide the user through:
- how to take responsibility without self-blame
- how to apologize effectively in their style
- how to repair trust after emotional damage
- how to prevent the same conflict from repeating

----------------------------------------------------
SECTION 7 — PERSONAL GROWTH PATH (3 LEVELS)
----------------------------------------------------
Define a clear growth journey:
Level 1: Awareness (recognizing patterns)
Level 2: Regulation (choosing healthier responses)
Level 3: Relational Maturity (building safe connection)

Include realistic expectations and encouragement.

----------------------------------------------------
SECTION 8 — 14-DAY RELATIONSHIP PRACTICE PLAN
----------------------------------------------------
Create a gentle but structured plan:
- daily micro-actions
- reflection prompts
- communication experiments
- boundary-setting exercises

----------------------------------------------------
SECTION 9 — CLOSING REFLECTION
----------------------------------------------------
End with a humane, grounding message such as:
"Healthy relationships are not about perfect people,
but about regulated hearts and honest communication."

====================================================
STYLE REQUIREMENTS
====================================================
- Warm, pastoral, grounded tone
- Clear headings with ## for main sections
- Real examples and scenarios specific to {series_name} context
- Script-based guidance (not theory)
- No shaming, no labeling
- Focus on the {series_name} relationship context throughout

Now generate the complete PREMIUM RELATIONSHIP INTELLIGENCE REPORT.
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"report_{result_id}",
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        report_content = await chat.send_message(UserMessage(text=user_prompt))
        
        # Save report
        report_id = f"report_{uuid.uuid4().hex[:12]}"
        report = {
            "report_id": report_id,
            "result_id": result_id,
            "user_id": user["user_id"],
            "language": language,
            "content": report_content,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.reports.insert_one(report)
        
        # Return without MongoDB _id
        report.pop("_id", None)
        return report
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

# ==================== ADMIN ROUTES ====================

@admin_router.get("/stats")
async def get_admin_stats(user=Depends(get_admin_user)):
    """Get admin dashboard stats"""
    total_users = await db.users.count_documents({})
    total_attempts = await db.quiz_attempts.count_documents({})
    total_completed = await db.quiz_attempts.count_documents({"status": "completed"})
    total_paid = await db.results.count_documents({"is_paid": True})
    
    # Archetype distribution
    pipeline = [
        {"$match": {"primary_archetype": {"$exists": True}}},
        {"$group": {"_id": "$primary_archetype", "count": {"$sum": 1}}}
    ]
    archetype_dist = await db.results.aggregate(pipeline).to_list(10)
    
    return {
        "total_users": total_users,
        "total_attempts": total_attempts,
        "completion_rate": round((total_completed / total_attempts * 100) if total_attempts > 0 else 0, 1),
        "conversion_rate": round((total_paid / total_completed * 100) if total_completed > 0 else 0, 1),
        "archetype_distribution": {item["_id"]: item["count"] for item in archetype_dist}
    }

@admin_router.get("/questions")
async def get_admin_questions(series: str = None, user=Depends(get_admin_user)):
    """Get questions for admin"""
    query = {} if not series else {"series": series}
    questions = await db.questions.find(query, {"_id": 0}).to_list(500)
    return {"questions": questions}

@admin_router.post("/questions")
async def create_question(data: QuestionCreate, user=Depends(get_admin_user)):
    """Create a new question"""
    question_id = f"q_{uuid.uuid4().hex[:12]}"
    question = {
        "question_id": question_id,
        **data.dict(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.questions.insert_one(question)
    return {"question_id": question_id, "message": "Question created"}

@admin_router.put("/questions/{question_id}")
async def update_question(question_id: str, data: QuestionCreate, user=Depends(get_admin_user)):
    """Update a question"""
    result = await db.questions.update_one(
        {"question_id": question_id},
        {"$set": data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question updated"}

@admin_router.delete("/questions/{question_id}")
async def delete_question(question_id: str, user=Depends(get_admin_user)):
    """Delete a question"""
    result = await db.questions.delete_one({"question_id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted"}

# ==================== SHARE ROUTES ====================

@share_router.get("/card/{result_id}")
async def generate_share_card(result_id: str, language: str = "id"):
    """Generate shareable image card for social media"""
    result = await db.results.find_one({"result_id": result_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    primary = result["primary_archetype"]
    secondary = result["secondary_archetype"]
    
    # Generate SVG share card
    archetype_colors = {
        "driver": "#C05640",
        "spark": "#D99E30", 
        "anchor": "#5D8A66",
        "analyst": "#5B8FA8"
    }
    archetype_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    primary_color = archetype_colors.get(primary, "#4A3B32")
    primary_name = archetype_names.get(primary, {}).get(language, primary.title())
    secondary_name = archetype_names.get(secondary, {}).get(language, secondary.title())
    
    title = "Tipe Komunikasi Saya" if language == "id" else "My Communication Type"
    secondary_label = "dengan kecenderungan" if language == "id" else "with tendency"
    cta = "Temukan tipe Anda di relasi4warna.com" if language == "id" else "Find your type at 4colorrelating.com"
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 315" width="600" height="315">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FDFCF8"/>
                <stop offset="100%" style="stop-color:#F2EFE9"/>
            </linearGradient>
        </defs>
        <rect width="600" height="315" fill="url(#bg)"/>
        <rect x="0" y="0" width="600" height="8" fill="{primary_color}"/>
        <circle cx="80" cy="157" r="50" fill="{primary_color}" opacity="0.15"/>
        <circle cx="80" cy="157" r="30" fill="{primary_color}"/>
        <text x="300" y="60" text-anchor="middle" font-family="serif" font-size="18" fill="#7A6E62">{title}</text>
        <text x="300" y="140" text-anchor="middle" font-family="serif" font-weight="bold" font-size="48" fill="{primary_color}">{primary_name}</text>
        <text x="300" y="180" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#7A6E62">{secondary_label} {secondary_name}</text>
        <rect x="150" y="220" width="300" height="1" fill="#E6E2D8"/>
        <text x="300" y="260" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#7A6E62">{cta}</text>
        <rect x="20" y="287" width="60" height="18" rx="4" fill="#4A3B32"/>
        <text x="50" y="300" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#FDFCF8">R4</text>
    </svg>'''
    
    return Response(content=svg_content, media_type="image/svg+xml")

@share_router.get("/data/{result_id}")
async def get_share_data(result_id: str, language: str = "id"):
    """Get share data for social sharing"""
    result = await db.results.find_one({"result_id": result_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    primary = result["primary_archetype"]
    archetype_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    primary_name = archetype_names.get(primary, {}).get(language, primary.title())
    
    if language == "id":
        title = f"Saya adalah {primary_name}! 🎯"
        description = "Temukan gaya komunikasi Anda dengan Relasi4Warna - platform asesmen komunikasi hubungan"
    else:
        title = f"I am a {primary_name}! 🎯"
        description = "Discover your communication style with 4Color Relating - relationship communication assessment platform"
    
    return {
        "title": title,
        "description": description,
        "image_url": f"/api/share/card/{result_id}?language={language}",
        "share_url": f"/result/{result_id}",
        "hashtags": ["Relasi4Warna", "KomunikasiHubungan", "TestKepribadian"] if language == "id" else ["4ColorRelating", "CommunicationStyle", "PersonalityTest"]
    }

# ==================== EMAIL ROUTES ====================

class EmailReportRequest(BaseModel):
    result_id: str
    recipient_email: EmailStr
    language: str = "id"

@email_router.post("/send-report")
async def send_report_email(data: EmailReportRequest, user=Depends(get_current_user)):
    """Send report via email"""
    result = await db.results.find_one(
        {"result_id": data.result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    if not result.get("is_paid", False):
        raise HTTPException(status_code=402, detail="Payment required to send report")
    
    primary = result["primary_archetype"]
    archetype_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    primary_name = archetype_names.get(primary, {}).get(data.language, primary.title())
    
    # Create email content
    if data.language == "id":
        subject = f"Laporan Relasi4Warna Anda - {primary_name}"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background-color: #4A3B32; color: white; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">Relasi4Warna</h1>
                <p style="margin: 5px 0 0 0;">Laporan Asesmen Komunikasi Anda</p>
            </div>
            <div style="padding: 30px; background-color: #FDFCF8; border: 1px solid #E6E2D8;">
                <h2 style="color: #4A3B32; margin-top: 0;">Halo {user.get('name', 'Pengguna')}!</h2>
                <p style="color: #7A6E62;">Terima kasih telah menggunakan Relasi4Warna. Berikut adalah ringkasan hasil tes Anda:</p>
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4A3B32;">
                    <p style="margin: 0; color: #7A6E62;">Arketipe Primer Anda:</p>
                    <h3 style="margin: 5px 0; color: #4A3B32; font-size: 24px;">{primary_name}</h3>
                </div>
                <p style="color: #7A6E62;">Untuk mengunduh laporan lengkap Anda dalam format PDF, silakan kunjungi dashboard Anda:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{os.environ.get('APP_URL', 'https://relasi4warna.com')}/result/{data.result_id}" 
                       style="background-color: #4A3B32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                        Lihat Laporan Lengkap
                    </a>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #7A6E62; font-size: 12px;">
                <p>© 2024 Relasi4Warna. Hak Cipta Dilindungi.</p>
                <p style="font-style: italic;">Disclaimer: Tes ini bersifat edukatif dan bukan alat diagnosis psikologis.</p>
            </div>
        </div>
        """
    else:
        subject = f"Your 4Color Relating Report - {primary_name}"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background-color: #4A3B32; color: white; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">4Color Relating</h1>
                <p style="margin: 5px 0 0 0;">Your Communication Assessment Report</p>
            </div>
            <div style="padding: 30px; background-color: #FDFCF8; border: 1px solid #E6E2D8;">
                <h2 style="color: #4A3B32; margin-top: 0;">Hello {user.get('name', 'User')}!</h2>
                <p style="color: #7A6E62;">Thank you for using 4Color Relating. Here's a summary of your test results:</p>
                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4A3B32;">
                    <p style="margin: 0; color: #7A6E62;">Your Primary Archetype:</p>
                    <h3 style="margin: 5px 0; color: #4A3B32; font-size: 24px;">{primary_name}</h3>
                </div>
                <p style="color: #7A6E62;">To download your complete report in PDF format, please visit your dashboard:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{os.environ.get('APP_URL', 'https://relasi4warna.com')}/result/{data.result_id}" 
                       style="background-color: #4A3B32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                        View Full Report
                    </a>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #7A6E62; font-size: 12px;">
                <p>© 2024 4Color Relating. All Rights Reserved.</p>
                <p style="font-style: italic;">Disclaimer: This test is educational and not a psychological diagnostic tool.</p>
            </div>
        </div>
        """
    
    if not RESEND_API_KEY:
        # Return mock success if no API key
        return {"status": "success", "message": f"Email would be sent to {data.recipient_email} (Resend API key not configured)"}
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [data.recipient_email],
            "subject": subject,
            "html": html_content
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        
        # Log email sent
        await db.email_logs.insert_one({
            "email_id": email.get("id"),
            "user_id": user["user_id"],
            "result_id": data.result_id,
            "recipient": data.recipient_email,
            "type": "report",
            "sent_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"status": "success", "message": f"Email sent to {data.recipient_email}", "email_id": email.get("id")}
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# ==================== COUPLES COMPARISON ROUTES ====================

class CouplesPackCreate(BaseModel):
    pack_name: str = "My Couples Pack"

class CouplesInvite(BaseModel):
    pack_id: str
    partner_email: EmailStr

@couples_router.post("/create-pack")
async def create_couples_pack(data: CouplesPackCreate, user=Depends(get_current_user)):
    """Create a couples comparison pack"""
    pack_id = f"couple_{uuid.uuid4().hex[:12]}"
    pack = {
        "pack_id": pack_id,
        "pack_name": data.pack_name,
        "creator_id": user["user_id"],
        "creator_name": user.get("name", ""),
        "partner_id": None,
        "partner_name": None,
        "creator_result_id": None,
        "partner_result_id": None,
        "status": "pending_partner",  # pending_partner, pending_tests, complete
        "comparison_report": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.couples_packs.insert_one(pack)
    return {"pack_id": pack_id, "status": "created", "invite_code": pack_id}

@couples_router.post("/invite")
async def invite_partner(data: CouplesInvite, user=Depends(get_current_user)):
    """Send invitation to partner"""
    pack = await db.couples_packs.find_one(
        {"pack_id": data.pack_id, "creator_id": user["user_id"]},
        {"_id": 0}
    )
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Send invitation email
    app_url = os.environ.get('APP_URL', 'https://relasi4warna.com')
    invite_link = f"{app_url}/couples/join/{data.pack_id}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background-color: #C05640; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">💕 Undangan Relasi4Warna</h1>
        </div>
        <div style="padding: 30px; background-color: #FDFCF8; border: 1px solid #E6E2D8;">
            <h2 style="color: #4A3B32;">Halo!</h2>
            <p style="color: #7A6E62;">{user.get('name', 'Seseorang')} mengundang Anda untuk mengambil tes komunikasi pasangan bersama di Relasi4Warna.</p>
            <p style="color: #7A6E62;">Dengan tes ini, Anda berdua akan mendapatkan:</p>
            <ul style="color: #7A6E62;">
                <li>Pemahaman gaya komunikasi masing-masing</li>
                <li>Laporan kompatibilitas hubungan</li>
                <li>Skrip komunikasi praktis untuk pasangan</li>
                <li>Rencana aksi mingguan bersama</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{invite_link}" 
                   style="background-color: #C05640; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                    Terima Undangan
                </a>
            </div>
        </div>
    </div>
    """
    
    if RESEND_API_KEY:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [data.partner_email],
                "subject": f"{user.get('name', 'Pasangan Anda')} mengundang Anda ke Relasi4Warna",
                "html": html_content
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send invite email: {e}")
    
    return {"status": "invited", "message": f"Invitation sent to {data.partner_email}"}

@couples_router.post("/join/{pack_id}")
async def join_couples_pack(pack_id: str, user=Depends(get_current_user)):
    """Join a couples pack as partner"""
    pack = await db.couples_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if pack["partner_id"]:
        raise HTTPException(status_code=400, detail="Pack already has a partner")
    
    if pack["creator_id"] == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot join your own pack")
    
    await db.couples_packs.update_one(
        {"pack_id": pack_id},
        {"$set": {
            "partner_id": user["user_id"],
            "partner_name": user.get("name", ""),
            "status": "pending_tests"
        }}
    )
    
    return {"status": "joined", "pack_id": pack_id}

@couples_router.post("/link-result/{pack_id}")
async def link_result_to_pack(pack_id: str, result_id: str, user=Depends(get_current_user)):
    """Link a quiz result to a couples pack"""
    pack = await db.couples_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    result = await db.results.find_one(
        {"result_id": result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Determine if user is creator or partner
    update_field = None
    if pack["creator_id"] == user["user_id"]:
        update_field = "creator_result_id"
    elif pack["partner_id"] == user["user_id"]:
        update_field = "partner_result_id"
    else:
        raise HTTPException(status_code=403, detail="Not a member of this pack")
    
    await db.couples_packs.update_one(
        {"pack_id": pack_id},
        {"$set": {update_field: result_id}}
    )
    
    # Check if both results are now linked
    updated_pack = await db.couples_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if updated_pack["creator_result_id"] and updated_pack["partner_result_id"]:
        await db.couples_packs.update_one(
            {"pack_id": pack_id},
            {"$set": {"status": "complete"}}
        )
    
    return {"status": "linked", "result_id": result_id}

@couples_router.get("/pack/{pack_id}")
async def get_couples_pack(pack_id: str, user=Depends(get_current_user)):
    """Get couples pack details"""
    pack = await db.couples_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if pack["creator_id"] != user["user_id"] and pack["partner_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not a member of this pack")
    
    return pack

@couples_router.get("/my-packs")
async def get_my_packs(user=Depends(get_current_user)):
    """Get all couples packs for user"""
    packs = await db.couples_packs.find(
        {"$or": [{"creator_id": user["user_id"]}, {"partner_id": user["user_id"]}]},
        {"_id": 0}
    ).to_list(50)
    return {"packs": packs}

@couples_router.post("/generate-comparison/{pack_id}")
async def generate_couples_comparison(pack_id: str, language: str = "id", user=Depends(get_current_user)):
    """Generate AI-powered couples compatibility comparison report"""
    pack = await db.couples_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if pack["status"] != "complete":
        raise HTTPException(status_code=400, detail="Both partners must complete the test first")
    
    # Get both results
    creator_result = await db.results.find_one({"result_id": pack["creator_result_id"]}, {"_id": 0})
    partner_result = await db.results.find_one({"result_id": pack["partner_result_id"]}, {"_id": 0})
    
    if not creator_result or not partner_result:
        raise HTTPException(status_code=404, detail="Results not found")
    
    # Check if comparison already exists
    if pack.get("comparison_report"):
        return {"comparison": pack["comparison_report"], "cached": True}
    
    # Drive names mapping
    drive_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    creator_primary = drive_names.get(creator_result['primary_archetype'], {}).get("en", creator_result['primary_archetype'].title())
    creator_secondary = drive_names.get(creator_result['secondary_archetype'], {}).get("en", creator_result['secondary_archetype'].title())
    partner_primary = drive_names.get(partner_result['primary_archetype'], {}).get("en", partner_result['primary_archetype'].title())
    partner_secondary = drive_names.get(partner_result['secondary_archetype'], {}).get("en", partner_result['secondary_archetype'].title())
    
    # Comprehensive system prompt for Couples Relationship Intelligence
    system_prompt = """You are an advanced Human Relationship Intelligence system for couples,
combining expertise from:
- Relationship coaching for intimate partnerships
- Conflict resolution between partners
- Attachment and connection patterns
- Communication strategy for couples
- Emotional regulation in relationships
- Building lasting romantic partnerships

Your mission is NOT to label people or predict relationship success,
but to help couples understand each other,
regulate their emotions together,
and build healthy, sustainable partnerships.

====================================================
ABSOLUTE ETHICAL, LEGAL & IP CONSTRAINTS (MANDATORY)
====================================================
1. All content MUST be 100% original and proprietary.
2. Do NOT reference any books, authors, DISC, MBTI, attachment theory labels, or third-party frameworks.
3. Do NOT provide medical, psychological, or clinical diagnoses.
4. Position this system strictly as:
   - mutual understanding
   - communication awareness
   - relationship growth guidance
5. Do NOT promise outcomes or "fix relationships".
6. Language must be compassionate, respectful, and non-judgmental.
7. The system must empower both partners' personal responsibility.
8. Never take sides or blame one partner.

====================================================
CORE FRAMEWORK
====================================================
4 Human Communication Drives:
A) Driver – acts through direction and decisiveness
B) Spark – acts through expression and connection
C) Anchor – acts through stability and harmony
D) Analyst – acts through structure and accuracy

Core Philosophy:
"Love is not finding the perfect person,
but learning to communicate perfectly with an imperfect person."
"""

    # User prompt for couples comparison
    user_prompt = f"""
====================================================
COUPLES INPUT DATA
====================================================
{{
  "language": "{language}",
  "partner1": {{
    "name": "{pack.get('creator_name', 'Partner 1')}",
    "primary_drive": "{creator_primary}",
    "secondary_drive": "{creator_secondary}",
    "scores": {creator_result['scores']},
    "stress_flag": {str(creator_result.get('stress_flag', False)).lower()}
  }},
  "partner2": {{
    "name": "{pack.get('partner_name', 'Partner 2')}",
    "primary_drive": "{partner_primary}",
    "secondary_drive": "{partner_secondary}",
    "scores": {partner_result['scores']},
    "stress_flag": {str(partner_result.get('stress_flag', False)).lower()}
  }}
}}

====================================================
LANGUAGE REQUIREMENT
====================================================
Output language: {"Indonesian (Bahasa Indonesia)" if language == "id" else "English"}
Write the ENTIRE report in {"Indonesian" if language == "id" else "English"}.

====================================================
COUPLES COMPATIBILITY REPORT STRUCTURE
====================================================
Generate a DEEP, PERSONALIZED couples compatibility report.
Format in Markdown with clear headings (##).

----------------------------------------------------
## 1. Relationship DNA Overview
----------------------------------------------------
- How these two communication drives interact
- The unique dynamic created by this combination
- Overall compatibility perspective (not a score, but a narrative)
- What makes this pairing special

----------------------------------------------------
## 2. Communication Dance
----------------------------------------------------
Describe the natural communication pattern between these partners:
- How {pack.get('creator_name', 'Partner 1')} ({creator_primary}) typically communicates
- How {pack.get('partner_name', 'Partner 2')} ({partner_primary}) typically responds
- Where communication flows naturally
- Where communication may get stuck

----------------------------------------------------
## 3. Relationship Strengths (5+)
----------------------------------------------------
List at least 5 unique strengths this couple has based on their drive combination:
- What they can build together
- How they complement each other
- What others may admire about them

----------------------------------------------------
## 4. Growth Edges & Friction Points
----------------------------------------------------
Honestly but compassionately identify:
- 5 potential areas of conflict
- Why each friction point happens (not who's fault)
- Early warning signs of each
- Immediate de-escalation strategies

----------------------------------------------------
## 5. Emotional Trigger Map for Both
----------------------------------------------------
For EACH partner, describe:
- What triggers them emotionally
- How they show stress
- What they need but don't ask for
- How the other partner can recognize and respond

----------------------------------------------------
## 6. Communication Scripts (6 Scenarios)
----------------------------------------------------
Provide 6 practical dialogue scripts:

**Scenario 1: Expressing Needs**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:
- Avoid saying:

**Scenario 2: During Conflict**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:
- Avoid saying:

**Scenario 3: Repair After Argument**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:
- Avoid saying:

**Scenario 4: Appreciation**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:

**Scenario 5: Setting Boundaries**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:
- Avoid saying:

**Scenario 6: Decision Making Together**
- Situation:
- {pack.get('creator_name', 'Partner 1')} says:
- {pack.get('partner_name', 'Partner 2')} responds:

----------------------------------------------------
## 7. Conflict Recovery Protocol
----------------------------------------------------
A step-by-step guide for this specific couple:
- How to pause without withdrawing
- How to repair without over-apologizing
- How to rebuild trust after hurt
- What each partner specifically needs to feel safe again

----------------------------------------------------
## 8. Weekly Connection Rituals (5)
----------------------------------------------------
5 specific rituals designed for this drive combination:
- Communication rituals
- Appreciation rituals
- Quality time rituals
- Conflict prevention rituals
- Growth rituals

----------------------------------------------------
## 9. 7-Day Couples Practice Plan
----------------------------------------------------
Daily micro-actions for the couple to do TOGETHER:
- Day 1:
- Day 2:
- Day 3:
- Day 4:
- Day 5:
- Day 6:
- Day 7:

----------------------------------------------------
## 10. Closing Message
----------------------------------------------------
End with a warm, grounding message about their journey together.
Focus on growth, patience, and the beauty of learning to love better.

====================================================
STYLE REQUIREMENTS
====================================================
- Warm, pastoral, grounded tone
- Address both partners equally
- Real examples specific to their drives
- Script-based guidance (not theory)
- No shaming, no labeling, no taking sides
- Focus on mutual growth and understanding

Now generate the complete COUPLES COMPATIBILITY REPORT.
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"couples_{pack_id}",
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        comparison_content = await chat.send_message(UserMessage(text=user_prompt))
        
        # Save comparison
        await db.couples_packs.update_one(
            {"pack_id": pack_id},
            {"$set": {
                "comparison_report": comparison_content,
                "comparison_language": language,
                "comparison_generated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"comparison": comparison_content, "cached": False}
    except Exception as e:
        logger.error(f"Error generating couples comparison: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate comparison report")

# ==================== PDF GENERATION ====================

import re

def markdown_to_paragraphs(markdown_text: str, styles: dict) -> list:
    """Convert markdown text to ReportLab paragraphs"""
    elements = []
    lines = markdown_text.split('\n')
    current_paragraph = []
    in_list = False
    
    for line in lines:
        line = line.rstrip()
        
        # Skip empty lines
        if not line:
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            elements.append(Spacer(1, 6))
            in_list = False
            continue
        
        # Main title (# )
        if line.startswith('# '):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            title = line[2:].strip()
            # Remove ** markers
            title = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', title)
            title = re.sub(r'\*(.*?)\*', r'<i>\1</i>', title)
            elements.append(Paragraph(title, styles['ReportTitle']))
            elements.append(Spacer(1, 12))
            continue
        
        # Section heading (## )
        if line.startswith('## '):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            heading = line[3:].strip()
            heading = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', heading)
            heading = re.sub(r'\*(.*?)\*', r'<i>\1</i>', heading)
            elements.append(Spacer(1, 16))
            elements.append(Paragraph(heading, styles['ReportHeading1']))
            elements.append(Spacer(1, 8))
            continue
        
        # Sub-heading (### )
        if line.startswith('### '):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            subheading = line[4:].strip()
            subheading = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', subheading)
            subheading = re.sub(r'\*(.*?)\*', r'<i>\1</i>', subheading)
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(subheading, styles['ReportHeading2']))
            elements.append(Spacer(1, 6))
            continue
        
        # Horizontal rule (---)
        if line.startswith('---'):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            elements.append(Spacer(1, 12))
            continue
        
        # Bullet points (- or * or numbered)
        if line.startswith('- ') or line.startswith('* ') or re.match(r'^\d+\.\s', line):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            
            # Get bullet text
            if line.startswith('- ') or line.startswith('* '):
                bullet_text = line[2:].strip()
            else:
                bullet_text = re.sub(r'^\d+\.\s', '', line).strip()
            
            # Process bold/italic
            bullet_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', bullet_text)
            bullet_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', bullet_text)
            
            elements.append(Paragraph(f"• {bullet_text}", styles['ReportBullet']))
            in_list = True
            continue
        
        # Indented bullet (  - )
        if line.startswith('  - ') or line.startswith('  * '):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            bullet_text = line[4:].strip()
            bullet_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', bullet_text)
            bullet_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', bullet_text)
            elements.append(Paragraph(f"  ◦ {bullet_text}", styles['ReportSubBullet']))
            continue
        
        # Bold text line
        if line.startswith('**') and line.endswith('**'):
            if current_paragraph:
                text = ' '.join(current_paragraph)
                elements.append(Paragraph(text, styles['ReportBody']))
                current_paragraph = []
            bold_text = line[2:-2]
            elements.append(Paragraph(f"<b>{bold_text}</b>", styles['ReportBoldBody']))
            continue
        
        # Regular text - accumulate
        processed_line = line
        processed_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', processed_line)
        processed_line = re.sub(r'\*(.*?)\*', r'<i>\1</i>', processed_line)
        current_paragraph.append(processed_line)
    
    # Flush remaining paragraph
    if current_paragraph:
        text = ' '.join(current_paragraph)
        elements.append(Paragraph(text, styles['ReportBody']))
    
    return elements

def generate_pdf_report(result: dict, archetype_data: dict, language: str = "id", ai_report: str = None, is_preview: bool = False) -> io.BytesIO:
    """Generate enhanced PDF report with AI content and watermark for preview"""
    buffer = io.BytesIO()
    
    # Custom page template for watermark
    from reportlab.platypus import PageTemplate, BaseDocTemplate, Frame
    from reportlab.lib.units import inch
    
    class WatermarkedDoc(BaseDocTemplate):
        def __init__(self, filename, is_preview=False, language="id", **kwargs):
            BaseDocTemplate.__init__(self, filename, **kwargs)
            self.is_preview = is_preview
            self.language = language
            
            # Define frame for content
            frame = Frame(
                2*cm, 2*cm, 
                A4[0] - 4*cm, A4[1] - 4.5*cm,
                id='normal'
            )
            template = PageTemplate(id='watermarked', frames=[frame], onPage=self.add_watermark)
            self.addPageTemplates([template])
        
        def add_watermark(self, canvas, doc):
            if self.is_preview:
                canvas.saveState()
                canvas.setFont('Helvetica-Bold', 60)
                canvas.setFillColor(colors.HexColor('#E6E2D8'))
                canvas.setFillAlpha(0.3)
                
                # Diagonal watermark text
                watermark_text = "PREVIEW" if self.language == "en" else "PRATINJAU"
                canvas.translate(A4[0]/2, A4[1]/2)
                canvas.rotate(45)
                canvas.drawCentredString(0, 0, watermark_text)
                
                canvas.restoreState()
                
                # Add preview notice at bottom
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                canvas.setFillColor(colors.HexColor('#C05640'))
                notice = "Ini adalah versi pratinjau. Beli laporan lengkap untuk akses penuh." if self.language == "id" else "This is a preview version. Purchase full report for complete access."
                canvas.drawCentredString(A4[0]/2, 1.2*cm, notice)
                canvas.restoreState()
            else:
                # Paid version - subtle branding
                canvas.saveState()
                canvas.setFont('Helvetica', 8)
                canvas.setFillColor(colors.HexColor('#7A6E62'))
                brand = "Relasi4Warna Premium Report" if self.language == "id" else "4Color Relating Premium Report"
                canvas.drawCentredString(A4[0]/2, 1*cm, brand)
                canvas.restoreState()
    
    doc = WatermarkedDoc(
        buffer,
        is_preview=is_preview,
        language=language,
        pagesize=A4, 
        rightMargin=2*cm, 
        leftMargin=2*cm, 
        topMargin=2.5*cm, 
        bottomMargin=2*cm
    )
    
    # Define colors
    primary_color = colors.HexColor('#4A3B32')
    accent_color = colors.HexColor('#C05640')
    text_color = colors.HexColor('#4A3B32')
    muted_color = colors.HexColor('#7A6E62')
    
    archetype_colors = {
        "driver": colors.HexColor("#C05640"),
        "spark": colors.HexColor("#D99E30"),
        "anchor": colors.HexColor("#5D8A66"),
        "analyst": colors.HexColor("#5B8FA8")
    }
    
    styles = getSampleStyleSheet()
    
    # Custom styles - use unique names to avoid conflicts
    styles.add(ParagraphStyle(
        name='ReportTitle', 
        fontSize=22, 
        spaceAfter=6, 
        textColor=primary_color, 
        alignment=1,
        fontName='Helvetica-Bold',
        leading=28
    ))
    styles.add(ParagraphStyle(
        name='ReportSubtitle', 
        fontSize=12, 
        spaceAfter=20, 
        textColor=muted_color, 
        alignment=1,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        name='ReportHeading1', 
        fontSize=14, 
        spaceAfter=8, 
        spaceBefore=16,
        textColor=primary_color,
        fontName='Helvetica-Bold',
        leading=18
    ))
    styles.add(ParagraphStyle(
        name='ReportHeading2', 
        fontSize=12, 
        spaceAfter=6, 
        spaceBefore=12,
        textColor=accent_color,
        fontName='Helvetica-Bold',
        leading=16
    ))
    styles.add(ParagraphStyle(
        name='ReportBody', 
        fontSize=10, 
        spaceAfter=6, 
        textColor=text_color, 
        leading=15,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        name='ReportBoldBody', 
        fontSize=10, 
        spaceAfter=6, 
        textColor=text_color, 
        leading=15,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        name='ReportBullet', 
        fontSize=10, 
        leftIndent=15, 
        spaceAfter=4, 
        textColor=text_color,
        leading=14,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        name='ReportSubBullet', 
        fontSize=10, 
        leftIndent=30, 
        spaceAfter=4, 
        textColor=muted_color,
        leading=14,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        name='Script', 
        fontSize=10, 
        leftIndent=20, 
        spaceAfter=4, 
        textColor=text_color,
        leading=14,
        fontName='Helvetica-Oblique',
        backColor=colors.HexColor('#F5F3EF')
    ))
    styles.add(ParagraphStyle(
        name='Footer', 
        fontSize=8, 
        textColor=muted_color, 
        alignment=1,
        fontName='Helvetica'
    ))
    
    story = []
    
    primary = result["primary_archetype"]
    secondary = result["secondary_archetype"]
    series = result.get("series", "general")
    primary_data = archetype_data.get(primary, {})
    
    series_names = {
        "family": {"id": "Keluarga", "en": "Family"},
        "couples": {"id": "Pasangan Hidup", "en": "Couples"},
        "business": {"id": "Bisnis & Profesional", "en": "Business"},
        "friendship": {"id": "Persahabatan", "en": "Friendship"}
    }
    
    drive_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    # ===== COVER PAGE =====
    story.append(Spacer(1, 60))
    
    # Main title
    if language == "id":
        story.append(Paragraph("LAPORAN PREMIUM", styles['ReportTitle']))
        story.append(Paragraph("Analisis Komunikasi Hubungan", styles['ReportSubtitle']))
    else:
        story.append(Paragraph("PREMIUM REPORT", styles['ReportTitle']))
        story.append(Paragraph("Relationship Communication Analysis", styles['ReportSubtitle']))
    
    story.append(Spacer(1, 30))
    
    # Series & Archetype info box
    primary_name = drive_names.get(primary, {}).get(language, primary.title())
    secondary_name = drive_names.get(secondary, {}).get(language, secondary.title())
    series_name = series_names.get(series, {}).get(language, series.title())
    
    info_data = [
        [("Seri" if language == "id" else "Series"), series_name],
        [("Arketipe Primer" if language == "id" else "Primary Archetype"), primary_name],
        [("Arketipe Sekunder" if language == "id" else "Secondary Archetype"), secondary_name],
    ]
    
    info_table = Table(info_data, colWidths=[150, 200])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F3EF')),
        ('TEXTCOLOR', (0, 0), (-1, -1), text_color),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 30))
    
    # Score Distribution Table
    scores_title = "Distribusi Skor" if language == "id" else "Score Distribution"
    story.append(Paragraph(scores_title, styles['ReportHeading1']))
    story.append(Spacer(1, 10))
    
    score_header = [["Arketipe" if language == "id" else "Archetype", "Skor" if language == "id" else "Score", "%"]]
    total_score = sum(result["scores"].values())
    score_rows = []
    for arch, score in sorted(result["scores"].items(), key=lambda x: x[1], reverse=True):
        arch_name = drive_names.get(arch, {}).get(language, arch.title())
        percentage = round((score / total_score * 100) if total_score > 0 else 0)
        score_rows.append([arch_name, str(score), f"{percentage}%"])
    
    score_data = score_header + score_rows
    score_table = Table(score_data, colWidths=[180, 80, 80])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E6E2D8')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAF8')]),
    ]))
    story.append(score_table)
    
    # ===== AI GENERATED CONTENT =====
    if ai_report:
        story.append(Spacer(1, 30))
        
        # Parse and render AI report markdown
        ai_elements = markdown_to_paragraphs(ai_report, styles)
        story.extend(ai_elements)
    else:
        # Fallback: Basic report content
        story.append(Spacer(1, 20))
        
        # Primary Archetype Description
        primary_title = f"Tentang {primary_name}" if language == "id" else f"About {primary_name}"
        story.append(Paragraph(primary_title, styles['ReportHeading1']))
        summary = primary_data.get(f"summary_{language}", "")
        story.append(Paragraph(summary, styles['ReportBody']))
        
        story.append(Spacer(1, 15))
        
        # Strengths
        strengths_title = "Kekuatan Anda" if language == "id" else "Your Strengths"
        story.append(Paragraph(strengths_title, styles['ReportHeading1']))
        strengths = primary_data.get(f"strengths_{language}", [])
        for s in strengths:
            story.append(Paragraph(f"• {s}", styles['ReportBullet']))
        
        story.append(Spacer(1, 15))
        
        # Blind Spots
        blindspots_title = "Area Pengembangan" if language == "id" else "Growth Areas"
        story.append(Paragraph(blindspots_title, styles['ReportHeading1']))
        blindspots = primary_data.get(f"blindspots_{language}", [])
        for b in blindspots:
            story.append(Paragraph(f"• {b}", styles['ReportBullet']))
        
        story.append(Spacer(1, 15))
        
        # Communication Tips
        tips_title = "Tips Komunikasi" if language == "id" else "Communication Tips"
        story.append(Paragraph(tips_title, styles['ReportHeading1']))
        tips = primary_data.get(f"communication_tips_{language}", [])
        for t in tips:
            story.append(Paragraph(f"• {t}", styles['ReportBullet']))
    
    # ===== FOOTER & DISCLAIMER =====
    story.append(Spacer(1, 30))
    
    # Disclaimer
    if language == "id":
        disclaimer = """<i>Disclaimer: Laporan ini bersifat edukatif untuk refleksi diri dan pengembangan kesadaran komunikasi. 
        Ini bukan alat diagnosis psikologis dan tidak dimaksudkan untuk menggantikan konsultasi profesional. 
        Semua konten adalah proprietary dan orisinal dari Relasi4Warna.</i>"""
    else:
        disclaimer = """<i>Disclaimer: This report is educational for self-reflection and communication awareness development.
        It is not a psychological diagnostic tool and is not intended to replace professional consultation.
        All content is proprietary and original from 4Color Relating.</i>"""
    
    story.append(Paragraph(disclaimer, styles['Footer']))
    
    story.append(Spacer(1, 15))
    
    # Copyright
    year = datetime.now().year
    if language == "id":
        footer = f"© {year} Relasi4Warna. Hak Cipta Dilindungi. Dilarang memperbanyak tanpa izin."
    else:
        footer = f"© {year} 4Color Relating. All Rights Reserved. Reproduction prohibited without permission."
    story.append(Paragraph(footer, styles['Footer']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

@report_router.get("/pdf/{result_id}")
async def download_pdf_report(result_id: str, language: str = "id", user=Depends(get_current_user)):
    """Download enhanced PDF report with AI content"""
    result = await db.results.find_one(
        {"result_id": result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    is_paid = result.get("is_paid", False)
    
    # Get archetype data
    archetypes_response = ARCHETYPES
    
    # Try to get AI-generated report if available (only for paid users)
    ai_report = None
    if is_paid:
        saved_report = await db.reports.find_one(
            {"result_id": result_id, "language": language},
            {"_id": 0}
        )
        if saved_report:
            ai_report = saved_report.get("content")
    
    # Generate PDF with watermark for preview (unpaid) or clean for paid
    pdf_buffer = generate_pdf_report(
        result, 
        archetypes_response, 
        language, 
        ai_report,
        is_preview=not is_paid
    )
    
    if is_paid:
        filename = f"relasi4warna_premium_report_{result_id}.pdf" if language == "id" else f"4colorrelating_premium_report_{result_id}.pdf"
    else:
        filename = f"relasi4warna_preview_{result_id}.pdf" if language == "id" else f"4colorrelating_preview_{result_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@report_router.get("/preview-pdf/{result_id}")
async def download_preview_pdf(result_id: str, language: str = "id", user=Depends(get_current_user)):
    """Download preview PDF with watermark (free for all users)"""
    result = await db.results.find_one(
        {"result_id": result_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Get archetype data
    archetypes_response = ARCHETYPES
    
    # Generate preview PDF with watermark (no AI content)
    pdf_buffer = generate_pdf_report(
        result, 
        archetypes_response, 
        language, 
        ai_report=None,
        is_preview=True
    )
    
    filename = f"relasi4warna_preview_{result_id}.pdf" if language == "id" else f"4colorrelating_preview_{result_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ==================== ADMIN CMS ROUTES ====================

class PricingUpdate(BaseModel):
    product_id: str
    price_idr: int
    price_usd: float
    name_id: str
    name_en: str
    active: bool = True

class CouponCreate(BaseModel):
    code: str
    discount_percent: int
    max_uses: int = 100
    expires_at: Optional[str] = None

@admin_router.get("/pricing")
async def get_pricing(user=Depends(get_admin_user)):
    """Get all pricing products"""
    pricing = await db.pricing.find({}, {"_id": 0}).to_list(50)
    if not pricing:
        # Return default pricing
        return {"pricing": list(PRODUCTS.values())}
    return {"pricing": pricing}

@admin_router.put("/pricing/{product_id}")
async def update_pricing(product_id: str, data: PricingUpdate, user=Depends(get_admin_user)):
    """Update product pricing"""
    pricing_doc = {
        "product_id": product_id,
        **data.dict(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["user_id"]
    }
    await db.pricing.update_one(
        {"product_id": product_id},
        {"$set": pricing_doc},
        upsert=True
    )
    return {"message": "Pricing updated"}

@admin_router.get("/coupons")
async def get_coupons(user=Depends(get_admin_user)):
    """Get all coupons"""
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(100)
    return {"coupons": coupons}

@admin_router.post("/coupons")
async def create_coupon(data: CouponCreate, user=Depends(get_admin_user)):
    """Create a new coupon"""
    existing = await db.coupons.find_one({"code": data.code}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon = {
        "coupon_id": f"coupon_{uuid.uuid4().hex[:8]}",
        **data.dict(),
        "uses": 0,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    await db.coupons.insert_one(coupon)
    return {"coupon_id": coupon["coupon_id"], "message": "Coupon created"}

@admin_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, user=Depends(get_admin_user)):
    """Delete a coupon"""
    result = await db.coupons.delete_one({"coupon_id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

@admin_router.get("/users")
async def get_users(skip: int = 0, limit: int = 50, user=Depends(get_admin_user)):
    """Get all users (admin only)"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

@admin_router.get("/results")
async def get_all_results(skip: int = 0, limit: int = 50, user=Depends(get_admin_user)):
    """Get all quiz results (admin only)"""
    results = await db.results.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.results.count_documents({})
    return {"results": results, "total": total}

# ==================== SEED DATA ====================

# Communication Challenge Router
challenge_router = APIRouter(prefix="/challenge", tags=["challenge"])

class StartChallengeRequest(BaseModel):
    archetype: str
    language: str = "id"

CHALLENGE_BADGES = {
    "communicator_novice": {"name_id": "Komunikator Pemula", "name_en": "Novice Communicator", "icon": "🌱", "requirement": "complete_1_day"},
    "steady_speaker": {"name_id": "Pembicara Mantap", "name_en": "Steady Speaker", "icon": "💬", "requirement": "complete_3_days"},
    "relationship_builder": {"name_id": "Pembangun Hubungan", "name_en": "Relationship Builder", "icon": "🤝", "requirement": "complete_5_days"},
    "communication_master": {"name_id": "Master Komunikasi", "name_en": "Communication Master", "icon": "🏆", "requirement": "complete_7_days"}
}

PREMIUM_CONTENT = {
    "exclusive_tips": {"name_id": "Tips Eksklusif", "name_en": "Exclusive Tips", "unlock_at": 3},
    "workbook_pdf": {"name_id": "Workbook PDF", "name_en": "Workbook PDF", "unlock_at": 5},
    "master_guide": {"name_id": "Panduan Master", "name_en": "Master Guide", "unlock_at": 7}
}

@challenge_router.post("/start")
async def start_challenge(data: StartChallengeRequest, user=Depends(get_current_user)):
    """Start a 7-day communication challenge"""
    if data.archetype.lower() not in ARCHETYPES:
        raise HTTPException(status_code=400, detail="Invalid archetype")
    
    # Check if user already has an active challenge
    existing = await db.challenges.find_one({
        "user_id": user["user_id"],
        "status": "active"
    }, {"_id": 0})
    
    if existing:
        return {"status": "already_active", "challenge": existing}
    
    # Generate 7 days of challenges using AI
    archetype = data.archetype.lower()
    archetype_data = ARCHETYPES.get(archetype, {})
    archetype_name = archetype_data.get(f"name_{data.language}", archetype.title())
    
    prompt = f"""
    Buat 7 tantangan komunikasi harian untuk seseorang dengan arketipe "{archetype_name}".
    Bahasa: {"Indonesia" if data.language == "id" else "English"}
    
    Setiap tantangan harus:
    - Praktis dan bisa dilakukan dalam sehari
    - Spesifik untuk arketipe ini
    - Meningkat kesulitannya dari hari 1 ke hari 7
    
    Format output JSON array:
    [
      {{
        "day": 1,
        "title": "Judul singkat tantangan",
        "description": "Deskripsi detail 2-3 kalimat",
        "task": "Tugas spesifik yang harus dilakukan",
        "tip": "Tips untuk menyelesaikan tantangan",
        "reflection_question": "Pertanyaan refleksi di akhir hari"
      }},
      ...
    ]
    
    Pastikan tantangan relevan dengan karakteristik arketipe {archetype_name}:
    - Kekuatan: {', '.join(archetype_data.get(f'strengths_{data.language}', [])[:3])}
    - Area pengembangan: {', '.join(archetype_data.get(f'blindspots_{data.language}', [])[:2])}
    
    Output HANYA JSON array, tanpa markdown atau teks lain.
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"challenge_{user['user_id']}_{uuid.uuid4().hex[:8]}",
            system_message="Anda adalah coach komunikasi yang kreatif. Output HANYA valid JSON."
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON from response
        import json
        # Clean response - remove markdown code blocks if present
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        clean_response = clean_response.strip()
        
        challenges_data = json.loads(clean_response)
        
        # Create challenge document
        challenge_id = f"chal_{uuid.uuid4().hex[:12]}"
        challenge = {
            "challenge_id": challenge_id,
            "user_id": user["user_id"],
            "archetype": archetype,
            "language": data.language,
            "status": "active",
            "current_day": 1,
            "days": challenges_data,
            "completed_days": [],
            "badges_earned": [],
            "content_unlocked": [],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.challenges.insert_one(challenge)
        challenge.pop("_id", None)
        
        return {"status": "started", "challenge": challenge}
        
    except Exception as e:
        logger.error(f"Error creating challenge: {e}")
        raise HTTPException(status_code=500, detail="Failed to create challenge")

@challenge_router.get("/active")
async def get_active_challenge(user=Depends(get_current_user)):
    """Get user's active challenge"""
    challenge = await db.challenges.find_one({
        "user_id": user["user_id"],
        "status": "active"
    }, {"_id": 0})
    
    if not challenge:
        return {"has_active": False, "challenge": None}
    
    return {"has_active": True, "challenge": challenge}

@challenge_router.post("/complete-day/{challenge_id}")
async def complete_challenge_day(
    challenge_id: str, 
    day: int, 
    reflection: str = "",
    user=Depends(get_current_user)
):
    """Mark a challenge day as completed"""
    challenge = await db.challenges.find_one({
        "challenge_id": challenge_id,
        "user_id": user["user_id"]
    }, {"_id": 0})
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    if challenge["status"] != "active":
        raise HTTPException(status_code=400, detail="Challenge is not active")
    
    if day in challenge["completed_days"]:
        return {"status": "already_completed", "day": day}
    
    if day != challenge["current_day"]:
        raise HTTPException(status_code=400, detail=f"Must complete day {challenge['current_day']} first")
    
    # Add to completed days
    completed_days = challenge["completed_days"] + [day]
    new_current_day = day + 1 if day < 7 else 7
    
    # Check for badges
    badges_earned = challenge["badges_earned"].copy()
    new_badges = []
    
    if len(completed_days) >= 1 and "communicator_novice" not in badges_earned:
        badges_earned.append("communicator_novice")
        new_badges.append("communicator_novice")
    if len(completed_days) >= 3 and "steady_speaker" not in badges_earned:
        badges_earned.append("steady_speaker")
        new_badges.append("steady_speaker")
    if len(completed_days) >= 5 and "relationship_builder" not in badges_earned:
        badges_earned.append("relationship_builder")
        new_badges.append("relationship_builder")
    if len(completed_days) >= 7 and "communication_master" not in badges_earned:
        badges_earned.append("communication_master")
        new_badges.append("communication_master")
    
    # Check for content unlocks
    content_unlocked = challenge["content_unlocked"].copy()
    new_content = []
    
    for content_id, content_info in PREMIUM_CONTENT.items():
        if len(completed_days) >= content_info["unlock_at"] and content_id not in content_unlocked:
            content_unlocked.append(content_id)
            new_content.append(content_id)
    
    # Check if challenge is complete
    status = "completed" if len(completed_days) >= 7 else "active"
    
    # Update challenge
    update_data = {
        "completed_days": completed_days,
        "current_day": new_current_day,
        "badges_earned": badges_earned,
        "content_unlocked": content_unlocked,
        "status": status
    }
    
    if status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    # Save reflection
    if reflection:
        reflections = challenge.get("reflections", {})
        reflections[str(day)] = {
            "text": reflection,
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }
        update_data["reflections"] = reflections
    
    await db.challenges.update_one(
        {"challenge_id": challenge_id},
        {"$set": update_data}
    )
    
    return {
        "status": "completed",
        "day": day,
        "new_badges": [CHALLENGE_BADGES[b] for b in new_badges],
        "new_content": [{"id": c, **PREMIUM_CONTENT[c]} for c in new_content],
        "challenge_complete": status == "completed",
        "next_day": new_current_day if status == "active" else None
    }

@challenge_router.get("/history")
async def get_challenge_history(user=Depends(get_current_user)):
    """Get user's challenge history"""
    challenges = await db.challenges.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    return {"challenges": challenges}

@challenge_router.get("/badges")
async def get_user_badges(user=Depends(get_current_user)):
    """Get all badges earned by user"""
    challenges = await db.challenges.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "badges_earned": 1}
    ).to_list(100)
    
    all_badges = set()
    for c in challenges:
        all_badges.update(c.get("badges_earned", []))
    
    badges = [{"id": b, **CHALLENGE_BADGES[b]} for b in all_badges if b in CHALLENGE_BADGES]
    
    return {"badges": badges, "total": len(badges)}

@challenge_router.get("/unlocked-content")
async def get_unlocked_content(user=Depends(get_current_user)):
    """Get all premium content unlocked by user"""
    challenges = await db.challenges.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "content_unlocked": 1}
    ).to_list(100)
    
    all_content = set()
    for c in challenges:
        all_content.update(c.get("content_unlocked", []))
    
    content = [{"id": c, **PREMIUM_CONTENT[c]} for c in all_content if c in PREMIUM_CONTENT]
    
    return {"content": content, "total": len(content)}

@challenge_router.get("/premium-content/{content_id}")
async def get_premium_content_detail(content_id: str, language: str = "id", user=Depends(get_current_user)):
    """Get premium content if user has unlocked it"""
    # Check if user has unlocked this content
    challenge = await db.challenges.find_one({
        "user_id": user["user_id"],
        "content_unlocked": content_id
    }, {"_id": 0})
    
    if not challenge:
        raise HTTPException(status_code=403, detail="Content not unlocked yet")
    
    archetype = challenge.get("archetype", "driver")
    archetype_data = ARCHETYPES.get(archetype, {})
    archetype_name = archetype_data.get(f"name_{language}", archetype.title())
    
    # Generate content based on type
    if content_id == "exclusive_tips":
        prompt = f"""
        Buat 10 tips komunikasi eksklusif untuk arketipe {archetype_name}.
        Bahasa: {"Indonesia" if language == "id" else "English"}
        
        Tips harus:
        - Lebih mendalam dari tips biasa
        - Actionable dan spesifik
        - Berbasis riset atau best practice
        
        Format:
        ## Tips Eksklusif untuk {archetype_name}
        
        1. **[Judul Tips]**
        [Deskripsi 2-3 kalimat]
        
        ... (sampai 10 tips)
        """
    elif content_id == "workbook_pdf":
        prompt = f"""
        Buat konten workbook komunikasi 7 hari untuk arketipe {archetype_name}.
        Bahasa: {"Indonesia" if language == "id" else "English"}
        
        Struktur:
        ## Workbook Komunikasi 7 Hari - {archetype_name}
        
        ### Hari 1: [Tema]
        **Tujuan:** [1 kalimat]
        **Aktivitas:** [2-3 langkah]
        **Ruang Refleksi:** [pertanyaan untuk dijawab]
        
        ... (sampai Hari 7)
        
        ### Catatan & Insight Saya
        [Ruang kosong untuk catatan]
        """
    else:  # master_guide
        prompt = f"""
        Buat panduan master komunikasi komprehensif untuk arketipe {archetype_name}.
        Bahasa: {"Indonesia" if language == "id" else "English"}
        
        Struktur:
        ## Panduan Master Komunikasi - {archetype_name}
        
        ### Bab 1: Memahami Diri Sendiri
        - Karakteristik utama
        - Kekuatan unik
        - Area pengembangan
        
        ### Bab 2: Komunikasi dengan Setiap Arketipe
        - Dengan Driver
        - Dengan Spark
        - Dengan Anchor
        - Dengan Analyst
        
        ### Bab 3: Skrip Komunikasi
        - 5 skrip untuk situasi umum
        
        ### Bab 4: Strategi Jangka Panjang
        - Rencana pengembangan 30 hari
        """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"content_{user['user_id']}_{content_id}",
            system_message="Anda adalah coach komunikasi profesional."
        ).with_model("openai", "gpt-5.2")
        
        content = await chat.send_message(UserMessage(text=prompt))
        
        return {
            "content_id": content_id,
            "content_info": PREMIUM_CONTENT[content_id],
            "content": content,
            "archetype": archetype
        }
        
    except Exception as e:
        logger.error(f"Error generating premium content: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate content")

# Team/Family Pack Router
team_router = APIRouter(prefix="/team", tags=["team"])

class CreateTeamPackRequest(BaseModel):
    pack_name: str
    pack_type: str  # "family" or "team"
    max_members: int = 6

class InviteTeamMemberRequest(BaseModel):
    pack_id: str
    member_email: EmailStr
    member_name: Optional[str] = None

@team_router.post("/create-pack")
async def create_team_pack(data: CreateTeamPackRequest, user=Depends(get_current_user)):
    """Create a family or team pack"""
    if data.pack_type not in ["family", "team"]:
        raise HTTPException(status_code=400, detail="Pack type must be 'family' or 'team'")
    
    max_allowed = 6 if data.pack_type == "family" else 10
    if data.max_members > max_allowed:
        data.max_members = max_allowed
    
    pack_id = f"pack_{uuid.uuid4().hex[:12]}"
    pack = {
        "pack_id": pack_id,
        "pack_name": data.pack_name,
        "pack_type": data.pack_type,
        "owner_id": user["user_id"],
        "owner_name": user.get("name", "Owner"),
        "owner_email": user["email"],
        "max_members": data.max_members,
        "members": [{
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name", "Owner"),
            "role": "owner",
            "result_id": None,
            "joined_at": datetime.now(timezone.utc).isoformat()
        }],
        "status": "active",
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.team_packs.insert_one(pack)
    pack.pop("_id", None)
    return pack

@team_router.post("/invite")
async def invite_team_member(data: InviteTeamMemberRequest, user=Depends(get_current_user)):
    """Invite a member to team/family pack"""
    pack = await db.team_packs.find_one({"pack_id": data.pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if pack["owner_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only owner can invite members")
    
    if len(pack["members"]) >= pack["max_members"]:
        raise HTTPException(status_code=400, detail=f"Pack is full (max {pack['max_members']} members)")
    
    # Check if already a member
    if any(m["email"] == data.member_email for m in pack["members"]):
        raise HTTPException(status_code=400, detail="Already a member of this pack")
    
    # Create invite
    invite_id = f"inv_{uuid.uuid4().hex[:8]}"
    invite = {
        "invite_id": invite_id,
        "pack_id": data.pack_id,
        "email": data.member_email,
        "name": data.member_name,
        "invited_by": user["user_id"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.team_invites.insert_one(invite)
    
    # Send invite email if Resend is configured
    if RESEND_API_KEY:
        pack_type_name = "Keluarga" if pack["pack_type"] == "family" else "Tim"
        subject = f"Undangan bergabung ke Paket {pack_type_name} - {pack['pack_name']}"
        app_url = os.environ.get('APP_URL', 'https://relasi4warna.com')
        html_content = f"""
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
            <h2>Anda diundang!</h2>
            <p>{user.get('name', 'Seseorang')} mengundang Anda untuk bergabung dengan paket {pack_type_name.lower()} "{pack['pack_name']}" di Relasi4Warna.</p>
            <p>Klik tombol di bawah untuk bergabung:</p>
            <a href="{app_url}/team/join/{invite_id}" style="background-color: #4A3B32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Bergabung Sekarang</a>
        </div>
        """
        try:
            params = {"from": SENDER_EMAIL, "to": [data.member_email], "subject": subject, "html": html_content}
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send invite email: {e}")
    
    return {"status": "invited", "invite_id": invite_id}

@team_router.post("/join/{invite_id}")
async def join_team_pack(invite_id: str, user=Depends(get_current_user)):
    """Join a team/family pack via invite"""
    invite = await db.team_invites.find_one({"invite_id": invite_id}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    if invite["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invite already used or expired")
    
    pack = await db.team_packs.find_one({"pack_id": invite["pack_id"]}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if len(pack["members"]) >= pack["max_members"]:
        raise HTTPException(status_code=400, detail="Pack is full")
    
    # Add member
    new_member = {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name", invite.get("name", "Member")),
        "role": "member",
        "result_id": None,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.team_packs.update_one(
        {"pack_id": invite["pack_id"]},
        {"$push": {"members": new_member}}
    )
    
    await db.team_invites.update_one(
        {"invite_id": invite_id},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"status": "joined", "pack_id": invite["pack_id"]}

@team_router.post("/join-link/{pack_id}")
async def join_team_via_link(pack_id: str, user=Depends(get_current_user)):
    """Join a team/family pack via direct link"""
    pack = await db.team_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if len(pack["members"]) >= pack["max_members"]:
        raise HTTPException(status_code=400, detail="Pack is full")
    
    if any(m["user_id"] == user["user_id"] for m in pack["members"]):
        return {"status": "already_member", "pack_id": pack_id}
    
    new_member = {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name", "Member"),
        "role": "member",
        "result_id": None,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.team_packs.update_one(
        {"pack_id": pack_id},
        {"$push": {"members": new_member}}
    )
    
    return {"status": "joined", "pack_id": pack_id}

@team_router.post("/link-result/{pack_id}")
async def link_result_to_team(pack_id: str, result_id: str, user=Depends(get_current_user)):
    """Link a quiz result to team pack"""
    pack = await db.team_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Check if user is member
    member_idx = next((i for i, m in enumerate(pack["members"]) if m["user_id"] == user["user_id"]), None)
    if member_idx is None:
        raise HTTPException(status_code=403, detail="Not a member of this pack")
    
    # Verify result exists
    result = await db.results.find_one({"result_id": result_id, "user_id": user["user_id"]}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Update member's result_id
    await db.team_packs.update_one(
        {"pack_id": pack_id, f"members.{member_idx}.user_id": user["user_id"]},
        {"$set": {f"members.{member_idx}.result_id": result_id}}
    )
    
    return {"status": "linked", "result_id": result_id}

@team_router.get("/pack/{pack_id}")
async def get_team_pack(pack_id: str, user=Depends(get_current_user)):
    """Get team pack details with all member results"""
    pack = await db.team_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Check if user is member
    if not any(m["user_id"] == user["user_id"] for m in pack["members"]):
        raise HTTPException(status_code=403, detail="Not a member of this pack")
    
    # Get all member results
    member_results = []
    for member in pack["members"]:
        result = None
        if member.get("result_id"):
            result = await db.results.find_one({"result_id": member["result_id"]}, {"_id": 0})
        member_results.append({
            **member,
            "result": result
        })
    
    pack["members_with_results"] = member_results
    
    # Calculate team heatmap data
    archetype_counts = {"driver": 0, "spark": 0, "anchor": 0, "analyst": 0}
    for mr in member_results:
        if mr.get("result"):
            primary = mr["result"].get("primary_archetype")
            if primary in archetype_counts:
                archetype_counts[primary] += 1
    
    pack["heatmap"] = archetype_counts
    pack["completion_rate"] = sum(1 for mr in member_results if mr.get("result")) / len(member_results) * 100
    
    return pack

@team_router.get("/my-packs")
async def get_my_team_packs(user=Depends(get_current_user)):
    """Get all team/family packs for user"""
    packs = await db.team_packs.find(
        {"members.user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(50)
    return {"packs": packs}

@team_router.post("/generate-analysis/{pack_id}")
async def generate_team_analysis(pack_id: str, language: str = "id", user=Depends(get_current_user)):
    """Generate AI-powered team dynamics analysis"""
    pack = await db.team_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Verify user is member
    if not any(m["user_id"] == user["user_id"] for m in pack["members"]):
        raise HTTPException(status_code=403, detail="Not a member of this pack")
    
    # Get all results
    members_data = []
    for member in pack["members"]:
        if member.get("result_id"):
            result = await db.results.find_one({"result_id": member["result_id"]}, {"_id": 0})
            if result:
                members_data.append({
                    "name": member["name"],
                    "primary": result["primary_archetype"],
                    "secondary": result["secondary_archetype"],
                    "scores": result["scores"]
                })
    
    if len(members_data) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 members with results")
    
    # Check for cached analysis
    if pack.get("team_analysis") and pack.get("analysis_member_count") == len(members_data):
        return {"analysis": pack["team_analysis"], "cached": True}
    
    pack_type_label = "keluarga" if pack["pack_type"] == "family" else "tim"
    members_summary = "\n".join([f"- {m['name']}: Primer={m['primary']}, Sekunder={m['secondary']}" for m in members_data])
    
    # Count archetypes
    archetype_dist = {"driver": 0, "spark": 0, "anchor": 0, "analyst": 0}
    for m in members_data:
        if m["primary"] in archetype_dist:
            archetype_dist[m["primary"]] += 1
    
    prompt = f"""
    Anda adalah coach dinamika {pack_type_label} dan komunikasi yang berpengalaman.
    Bahasa output: {"Indonesia" if language == "id" else "English"}
    
    Analisis dinamika {pack_type_label} "{pack['pack_name']}" berdasarkan profil berikut:
    
    ANGGOTA {pack_type_label.upper()}:
    {members_summary}
    
    DISTRIBUSI ARKETIPE:
    - Driver: {archetype_dist['driver']} orang
    - Spark: {archetype_dist['spark']} orang  
    - Anchor: {archetype_dist['anchor']} orang
    - Analyst: {archetype_dist['analyst']} orang
    
    Buat analisis komprehensif dengan struktur:
    
    ## 1. Profil Dinamika {pack_type_label.title()}
    - Gambaran keseluruhan komposisi arketipe
    - Keseimbangan energi dalam {pack_type_label}
    
    ## 2. Kekuatan Kolektif
    - 5 kekuatan unik dari kombinasi ini
    
    ## 3. Potensi Tantangan
    - 5 potensi konflik atau kesulitan
    - Rekomendasi untuk mengatasinya
    
    ## 4. Peta Peran Optimal
    - Saran peran terbaik untuk setiap anggota berdasarkan arketipe mereka
    
    ## 5. Tips Komunikasi {pack_type_label.title()}
    - 5 tips praktis untuk meningkatkan komunikasi
    
    ## 6. Ritual Mingguan
    - 3 aktivitas {pack_type_label} yang disarankan untuk memperkuat hubungan
    
    Gunakan bahasa yang hangat, praktis, dan actionable.
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"team_analysis_{pack_id}",
            system_message=f"Anda adalah coach dinamika {pack_type_label} yang berpengalaman dan hangat."
        ).with_model("openai", "gpt-5.2")
        
        analysis = await chat.send_message(UserMessage(text=prompt))
        
        # Cache the analysis
        await db.team_packs.update_one(
            {"pack_id": pack_id},
            {"$set": {"team_analysis": analysis, "analysis_member_count": len(members_data)}}
        )
        
        return {"analysis": analysis, "cached": False}
    except Exception as e:
        logger.error(f"Error generating team analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analysis")

@team_router.delete("/leave/{pack_id}")
async def leave_team_pack(pack_id: str, user=Depends(get_current_user)):
    """Leave a team/family pack"""
    pack = await db.team_packs.find_one({"pack_id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    if pack["owner_id"] == user["user_id"]:
        raise HTTPException(status_code=400, detail="Owner cannot leave. Transfer ownership or delete the pack.")
    
    # Remove member
    await db.team_packs.update_one(
        {"pack_id": pack_id},
        {"$pull": {"members": {"user_id": user["user_id"]}}}
    )
    
    return {"status": "left", "pack_id": pack_id}

# Blog Router
blog_router = APIRouter(prefix="/blog", tags=["blog"])

class CreateArticleRequest(BaseModel):
    title_id: str
    title_en: str
    slug: str
    excerpt_id: str
    excerpt_en: str
    content_id: str
    content_en: str
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    status: str = "draft"  # draft, published

class UpdateArticleRequest(BaseModel):
    title_id: Optional[str] = None
    title_en: Optional[str] = None
    slug: Optional[str] = None
    excerpt_id: Optional[str] = None
    excerpt_en: Optional[str] = None
    content_id: Optional[str] = None
    content_en: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    status: Optional[str] = None

BLOG_CATEGORIES = [
    {"id": "communication", "name_id": "Komunikasi", "name_en": "Communication"},
    {"id": "relationships", "name_id": "Hubungan", "name_en": "Relationships"},
    {"id": "archetypes", "name_id": "Arketipe", "name_en": "Archetypes"},
    {"id": "tips", "name_id": "Tips & Trik", "name_en": "Tips & Tricks"},
    {"id": "stories", "name_id": "Cerita", "name_en": "Stories"}
]

@blog_router.get("/articles")
async def get_articles(
    page: int = 1, 
    limit: int = 10, 
    category: Optional[str] = None,
    tag: Optional[str] = None,
    status: str = "published"
):
    """Get paginated blog articles"""
    skip = (page - 1) * limit
    
    query = {}
    if status != "all":
        query["status"] = status
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    
    articles = await db.blog_articles.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blog_articles.count_documents(query)
    
    return {
        "articles": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@blog_router.get("/articles/{slug}")
async def get_article_by_slug(slug: str):
    """Get single article by slug"""
    article = await db.blog_articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    await db.blog_articles.update_one(
        {"slug": slug},
        {"$inc": {"views": 1}}
    )
    article["views"] = article.get("views", 0) + 1
    
    return article

@blog_router.get("/categories")
async def get_categories():
    """Get blog categories"""
    return {"categories": BLOG_CATEGORIES}

@blog_router.get("/featured")
async def get_featured_articles(limit: int = 3):
    """Get featured/recent articles for homepage"""
    articles = await db.blog_articles.find(
        {"status": "published"},
        {"_id": 0, "content_id": 0, "content_en": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return {"articles": articles}

# Compatibility Router
compatibility_router = APIRouter(prefix="/compatibility", tags=["compatibility"])

# Comprehensive compatibility data for all 16 combinations
COMPATIBILITY_MATRIX = {
    "driver_driver": {
        "compatibility_score": 65,
        "energy": "high",
        "title_id": "Duo Dinamis",
        "title_en": "Dynamic Duo",
        "summary_id": "Dua Driver bersama menciptakan energi tinggi dan momentum luar biasa. Keduanya fokus pada hasil dan efisiensi.",
        "summary_en": "Two Drivers together create high energy and incredible momentum. Both are focused on results and efficiency.",
        "strengths_id": [
            "Pengambilan keputusan cepat",
            "Fokus pada tujuan yang jelas",
            "Momentum tinggi dalam eksekusi",
            "Tidak takut tantangan besar",
            "Saling memahami kebutuhan akan kontrol"
        ],
        "strengths_en": [
            "Quick decision making",
            "Clear goal focus",
            "High momentum in execution",
            "Not afraid of big challenges",
            "Mutual understanding of control needs"
        ],
        "challenges_id": [
            "Perebutan kendali dan dominasi",
            "Kurang sabar satu sama lain",
            "Kompetisi yang tidak sehat",
            "Kesulitan kompromi",
            "Risiko konflik ego"
        ],
        "challenges_en": [
            "Power struggles and dominance",
            "Impatience with each other",
            "Unhealthy competition",
            "Difficulty compromising",
            "Risk of ego conflicts"
        ],
        "tips_id": [
            "Bagi area tanggung jawab dengan jelas",
            "Jadwalkan waktu untuk mendengarkan, bukan hanya memimpin",
            "Rayakan kemenangan bersama, bukan individu",
            "Latih kesabaran dengan timeout sebelum bereaksi"
        ],
        "tips_en": [
            "Clearly divide areas of responsibility",
            "Schedule time for listening, not just leading",
            "Celebrate victories together, not individually",
            "Practice patience with timeouts before reacting"
        ]
    },
    "driver_spark": {
        "compatibility_score": 85,
        "energy": "very_high",
        "title_id": "Pemimpin & Inspirator",
        "title_en": "Leader & Inspirer",
        "summary_id": "Kombinasi yang sangat dinamis! Driver memberikan arah dan struktur, sementara Spark membawa energi, kreativitas, dan antusiasme.",
        "summary_en": "A highly dynamic combination! Driver provides direction and structure, while Spark brings energy, creativity, and enthusiasm.",
        "strengths_id": [
            "Visi besar + eksekusi kreatif",
            "Energi tinggi yang saling melengkapi",
            "Driver memberi fokus, Spark memberi inspirasi",
            "Kemampuan motivasi tim yang kuat",
            "Inovasi dengan arah yang jelas"
        ],
        "strengths_en": [
            "Big vision + creative execution",
            "Complementary high energy",
            "Driver gives focus, Spark gives inspiration",
            "Strong team motivation ability",
            "Innovation with clear direction"
        ],
        "challenges_id": [
            "Spark mungkin merasa dikontrol berlebihan",
            "Driver bisa frustrasi dengan ketidakkonsistenan Spark",
            "Perbedaan dalam menghargai detail vs gambaran besar",
            "Risiko burnout dari terlalu banyak aktivitas"
        ],
        "challenges_en": [
            "Spark may feel overly controlled",
            "Driver can get frustrated with Spark's inconsistency",
            "Differences in valuing details vs big picture",
            "Risk of burnout from too many activities"
        ],
        "tips_id": [
            "Driver: beri ruang kreativitas untuk Spark",
            "Spark: hormati kebutuhan Driver akan struktur",
            "Tetapkan waktu untuk brainstorming bebas",
            "Buat sistem yang fleksibel tapi tetap ada batasan"
        ],
        "tips_en": [
            "Driver: give creative space to Spark",
            "Spark: respect Driver's need for structure",
            "Set aside time for free brainstorming",
            "Create systems that are flexible but have boundaries"
        ]
    },
    "driver_anchor": {
        "compatibility_score": 75,
        "energy": "balanced",
        "title_id": "Aksi & Stabilitas",
        "title_en": "Action & Stability",
        "summary_id": "Driver yang berorientasi hasil bertemu Anchor yang menjaga harmoni. Kombinasi yang seimbang antara progress dan stabilitas.",
        "summary_en": "Results-oriented Driver meets harmony-keeping Anchor. A balanced combination of progress and stability.",
        "strengths_id": [
            "Keseimbangan antara dorongan dan kehati-hatian",
            "Anchor menstabilkan intensitas Driver",
            "Driver membantu Anchor keluar dari zona nyaman",
            "Keputusan yang lebih matang",
            "Tim yang solid dan dapat diandalkan"
        ],
        "strengths_en": [
            "Balance between drive and caution",
            "Anchor stabilizes Driver's intensity",
            "Driver helps Anchor step out of comfort zone",
            "More mature decisions",
            "Solid and reliable team"
        ],
        "challenges_id": [
            "Driver bisa frustrasi dengan kecepatan Anchor",
            "Anchor mungkin merasa terburu-buru",
            "Perbedaan prioritas (hasil vs hubungan)",
            "Anchor kesulitan menyuarakan ketidaksetujuan"
        ],
        "challenges_en": [
            "Driver may get frustrated with Anchor's pace",
            "Anchor may feel rushed",
            "Different priorities (results vs relationships)",
            "Anchor struggles to voice disagreement"
        ],
        "tips_id": [
            "Driver: perlambat dan hargai proses",
            "Anchor: berani menyampaikan kebutuhan",
            "Jadwalkan check-in emosional rutin",
            "Buat timeline yang realistis bersama"
        ],
        "tips_en": [
            "Driver: slow down and appreciate the process",
            "Anchor: be brave in expressing needs",
            "Schedule regular emotional check-ins",
            "Create realistic timelines together"
        ]
    },
    "driver_analyst": {
        "compatibility_score": 70,
        "energy": "focused",
        "title_id": "Eksekutor & Strategis",
        "title_en": "Executor & Strategist",
        "summary_id": "Driver ingin bertindak cepat, Analyst ingin menganalisis dulu. Jika dikelola dengan baik, menghasilkan keputusan yang cepat DAN tepat.",
        "summary_en": "Driver wants quick action, Analyst wants to analyze first. If managed well, produces decisions that are both fast AND accurate.",
        "strengths_id": [
            "Tindakan yang didukung data",
            "Keputusan strategis yang tereksekusi",
            "Analyst memberikan perspektif yang Driver lewatkan",
            "Kombinasi intuisi dan logika",
            "Hasil yang terukur dan akuntabel"
        ],
        "strengths_en": [
            "Data-backed actions",
            "Strategic decisions that get executed",
            "Analyst provides perspective Driver misses",
            "Combination of intuition and logic",
            "Measurable and accountable results"
        ],
        "challenges_id": [
            "Driver frustrasi dengan analysis paralysis",
            "Analyst merasa didesak tanpa informasi cukup",
            "Perbedaan kecepatan kerja yang signifikan",
            "Konflik antara 'cukup baik' vs 'sempurna'"
        ],
        "challenges_en": [
            "Driver frustrated with analysis paralysis",
            "Analyst feels rushed without enough information",
            "Significant difference in work pace",
            "Conflict between 'good enough' vs 'perfect'"
        ],
        "tips_id": [
            "Tetapkan deadline analisis yang jelas",
            "Driver: hargai kebutuhan akan data",
            "Analyst: berikan rekomendasi, bukan hanya data",
            "Buat framework keputusan bersama"
        ],
        "tips_en": [
            "Set clear analysis deadlines",
            "Driver: appreciate the need for data",
            "Analyst: provide recommendations, not just data",
            "Create a decision framework together"
        ]
    },
    "spark_spark": {
        "compatibility_score": 75,
        "energy": "explosive",
        "title_id": "Festival Ide",
        "title_en": "Idea Festival",
        "summary_id": "Dua Spark bersama menciptakan ledakan kreativitas dan kegembiraan! Penuh ide brilian, tapi mungkin kesulitan menuntaskan.",
        "summary_en": "Two Sparks together create an explosion of creativity and joy! Full of brilliant ideas, but may struggle to complete them.",
        "strengths_id": [
            "Kreativitas tanpa batas",
            "Energi positif yang menular",
            "Selalu ada ide baru yang exciting",
            "Lingkungan yang menyenangkan",
            "Kemampuan improvisasi tinggi"
        ],
        "strengths_en": [
            "Unlimited creativity",
            "Contagious positive energy",
            "Always new exciting ideas",
            "Fun environment",
            "High improvisation ability"
        ],
        "challenges_id": [
            "Kesulitan menyelesaikan proyek",
            "Kurang struktur dan organisasi",
            "Terlalu banyak ide, kurang fokus",
            "Menghindari tugas yang membosankan",
            "Risiko chaos tanpa anchor"
        ],
        "challenges_en": [
            "Difficulty completing projects",
            "Lack of structure and organization",
            "Too many ideas, not enough focus",
            "Avoiding boring tasks",
            "Risk of chaos without anchor"
        ],
        "tips_id": [
            "Pilih SATU ide untuk difokuskan",
            "Buat sistem accountability bersama",
            "Jadwalkan 'boring time' untuk admin",
            "Rekrut bantuan untuk detail dan follow-through"
        ],
        "tips_en": [
            "Choose ONE idea to focus on",
            "Create an accountability system together",
            "Schedule 'boring time' for admin tasks",
            "Recruit help for details and follow-through"
        ]
    },
    "spark_anchor": {
        "compatibility_score": 90,
        "energy": "harmonious",
        "title_id": "Kegembiraan & Kehangatan",
        "title_en": "Joy & Warmth",
        "summary_id": "Kombinasi yang sangat harmonis! Spark membawa kegembiraan dan spontanitas, Anchor memberikan kehangatan dan stabilitas emosional.",
        "summary_en": "A very harmonious combination! Spark brings joy and spontaneity, Anchor provides warmth and emotional stability.",
        "strengths_id": [
            "Hubungan yang penuh cinta dan kegembiraan",
            "Anchor memberikan rumah yang aman untuk Spark",
            "Spark membawa petualangan ke kehidupan Anchor",
            "Komunikasi yang penuh empati",
            "Keseimbangan antara fun dan keamanan"
        ],
        "strengths_en": [
            "Relationship full of love and joy",
            "Anchor provides a safe home for Spark",
            "Spark brings adventure to Anchor's life",
            "Communication full of empathy",
            "Balance between fun and security"
        ],
        "challenges_id": [
            "Spark mungkin merasa terikat",
            "Anchor bisa kewalahan dengan energi Spark",
            "Perbedaan dalam kebutuhan sosial",
            "Anchor mungkin terlalu mengalah"
        ],
        "challenges_en": [
            "Spark may feel tied down",
            "Anchor can be overwhelmed by Spark's energy",
            "Differences in social needs",
            "Anchor may give in too much"
        ],
        "tips_id": [
            "Spark: jadwalkan waktu berkualitas di rumah",
            "Anchor: ikut sesekali dalam petualangan Spark",
            "Komunikasikan kebutuhan akan ruang/kebersamaan",
            "Ciptakan tradisi yang menyenangkan bersama"
        ],
        "tips_en": [
            "Spark: schedule quality time at home",
            "Anchor: join Spark's adventures occasionally",
            "Communicate needs for space/togetherness",
            "Create fun traditions together"
        ]
    },
    "spark_analyst": {
        "compatibility_score": 60,
        "energy": "contrasting",
        "title_id": "Kreativitas & Logika",
        "title_en": "Creativity & Logic",
        "summary_id": "Kombinasi yang kontras tapi bisa sangat produktif! Spark membawa ide out-of-the-box, Analyst membantu mewujudkannya dengan sistematis.",
        "summary_en": "A contrasting but potentially very productive combination! Spark brings out-of-the-box ideas, Analyst helps realize them systematically.",
        "strengths_id": [
            "Ide kreatif + implementasi sistematis",
            "Saling melengkapi kekurangan",
            "Inovasi yang tervalidasi",
            "Perspektif yang sangat berbeda = solusi unik",
            "Analyst memberikan reality check yang dibutuhkan"
        ],
        "strengths_en": [
            "Creative ideas + systematic implementation",
            "Complementing each other's weaknesses",
            "Validated innovation",
            "Very different perspectives = unique solutions",
            "Analyst provides needed reality check"
        ],
        "challenges_id": [
            "Perbedaan gaya komunikasi yang ekstrem",
            "Spark merasa dikritik terus-menerus",
            "Analyst frustrasi dengan ketidakteraturan",
            "Kesulitan memahami cara berpikir satu sama lain"
        ],
        "challenges_en": [
            "Extreme difference in communication styles",
            "Spark feels constantly criticized",
            "Analyst frustrated with disorganization",
            "Difficulty understanding each other's thinking"
        ],
        "tips_id": [
            "Hargai perbedaan sebagai kekuatan",
            "Spark: terima feedback sebagai bantuan",
            "Analyst: sampaikan kritik dengan cara positif",
            "Buat zona bebas kritik untuk brainstorming"
        ],
        "tips_en": [
            "Appreciate differences as strengths",
            "Spark: receive feedback as help",
            "Analyst: deliver criticism positively",
            "Create criticism-free zones for brainstorming"
        ]
    },
    "anchor_anchor": {
        "compatibility_score": 80,
        "energy": "peaceful",
        "title_id": "Pelabuhan Tenang",
        "title_en": "Peaceful Harbor",
        "summary_id": "Dua Anchor menciptakan lingkungan yang sangat stabil, damai, dan penuh dukungan. Hubungan yang dalam dan tulus.",
        "summary_en": "Two Anchors create a very stable, peaceful, and supportive environment. A deep and sincere relationship.",
        "strengths_id": [
            "Hubungan yang sangat stabil",
            "Komunikasi yang penuh empati",
            "Saling mendukung tanpa syarat",
            "Rumah yang damai dan harmonis",
            "Loyalitas dan komitmen tinggi"
        ],
        "strengths_en": [
            "Very stable relationship",
            "Empathetic communication",
            "Unconditional mutual support",
            "Peaceful and harmonious home",
            "High loyalty and commitment"
        ],
        "challenges_id": [
            "Terlalu nyaman = kurang pertumbuhan",
            "Menghindari konflik yang perlu dihadapi",
            "Kesulitan membuat perubahan",
            "Mungkin terlalu fokus ke dalam",
            "Kurang spontanitas dan petualangan"
        ],
        "challenges_en": [
            "Too comfortable = less growth",
            "Avoiding conflicts that need to be addressed",
            "Difficulty making changes",
            "May be too inward-focused",
            "Lack of spontaneity and adventure"
        ],
        "tips_id": [
            "Jadwalkan petualangan kecil bersama",
            "Praktikkan menghadapi konflik, bukan menghindari",
            "Dukung pertumbuhan individu masing-masing",
            "Undang energi baru sesekali (teman, aktivitas)"
        ],
        "tips_en": [
            "Schedule small adventures together",
            "Practice facing conflicts, not avoiding",
            "Support each other's individual growth",
            "Invite new energy occasionally (friends, activities)"
        ]
    },
    "anchor_analyst": {
        "compatibility_score": 70,
        "energy": "thoughtful",
        "title_id": "Hati & Pikiran",
        "title_en": "Heart & Mind",
        "summary_id": "Anchor membawa kehangatan emosional, Analyst membawa kejelasan rasional. Kombinasi yang seimbang jika dikomunikasikan dengan baik.",
        "summary_en": "Anchor brings emotional warmth, Analyst brings rational clarity. A balanced combination if communicated well.",
        "strengths_id": [
            "Keputusan yang melibatkan logika DAN perasaan",
            "Anchor membantu Analyst terhubung emosional",
            "Analyst membantu Anchor berpikir jernih",
            "Keseimbangan antara empati dan objektivitas",
            "Hubungan yang dalam dan bermakna"
        ],
        "strengths_en": [
            "Decisions involving both logic AND feelings",
            "Anchor helps Analyst connect emotionally",
            "Analyst helps Anchor think clearly",
            "Balance between empathy and objectivity",
            "Deep and meaningful relationship"
        ],
        "challenges_id": [
            "Perbedaan bahasa emosional vs logis",
            "Anchor merasa tidak dipahami secara emosional",
            "Analyst merasa keputusan terlalu emosional",
            "Gaya pemecahan masalah yang berbeda"
        ],
        "challenges_en": [
            "Difference between emotional vs logical language",
            "Anchor feels emotionally misunderstood",
            "Analyst feels decisions are too emotional",
            "Different problem-solving styles"
        ],
        "tips_id": [
            "Analyst: akui perasaan sebelum memberikan solusi",
            "Anchor: sampaikan kebutuhan dengan jelas",
            "Belajar 'bahasa' satu sama lain",
            "Buat waktu untuk emosi DAN analisis"
        ],
        "tips_en": [
            "Analyst: acknowledge feelings before giving solutions",
            "Anchor: express needs clearly",
            "Learn each other's 'language'",
            "Make time for both emotions AND analysis"
        ]
    },
    "analyst_analyst": {
        "compatibility_score": 75,
        "energy": "intellectual",
        "title_id": "Pikiran Ganda",
        "title_en": "Double Minds",
        "summary_id": "Dua Analyst bersama menciptakan kemitraan yang sangat rasional dan terstruktur. Percakapan yang dalam dan bermakna.",
        "summary_en": "Two Analysts together create a very rational and structured partnership. Deep and meaningful conversations.",
        "strengths_id": [
            "Percakapan intelektual yang memuaskan",
            "Keputusan yang sangat terpertimbangkan",
            "Saling menghormati kebutuhan akan ruang",
            "Tidak ada drama yang tidak perlu",
            "Efisiensi dalam mengelola kehidupan"
        ],
        "strengths_en": [
            "Satisfying intellectual conversations",
            "Very well-considered decisions",
            "Mutual respect for space needs",
            "No unnecessary drama",
            "Efficiency in managing life"
        ],
        "challenges_id": [
            "Kurang ekspresi emosional",
            "Terlalu banyak analisis, kurang tindakan",
            "Menghindari pembicaraan emosional penting",
            "Hubungan terasa 'dingin' dari luar",
            "Overthinking masalah kecil"
        ],
        "challenges_en": [
            "Lack of emotional expression",
            "Too much analysis, not enough action",
            "Avoiding important emotional conversations",
            "Relationship seems 'cold' from outside",
            "Overthinking small problems"
        ],
        "tips_id": [
            "Jadwalkan waktu untuk koneksi emosional",
            "Praktikkan menyatakan perasaan, bukan hanya pikiran",
            "Batasi waktu analisis sebelum bertindak",
            "Tambahkan elemen spontanitas dan fun"
        ],
        "tips_en": [
            "Schedule time for emotional connection",
            "Practice stating feelings, not just thoughts",
            "Limit analysis time before acting",
            "Add elements of spontaneity and fun"
        ]
    },
    "spark_driver": {
        "compatibility_score": 85,
        "energy": "very_high",
        "title_id": "Inspirator & Pemimpin",
        "title_en": "Inspirer & Leader",
        "summary_id": "Kombinasi yang sangat dinamis! Spark membawa kreativitas dan energi, sementara Driver memberikan arah dan eksekusi.",
        "summary_en": "A highly dynamic combination! Spark brings creativity and energy, while Driver provides direction and execution.",
        "strengths_id": [
            "Kreativitas + eksekusi yang kuat",
            "Energi tinggi yang saling mendorong",
            "Spark menginspirasi, Driver mewujudkan",
            "Tim yang mampu memotivasi orang lain",
            "Inovasi dengan hasil nyata"
        ],
        "strengths_en": [
            "Creativity + strong execution",
            "High energy pushing each other",
            "Spark inspires, Driver delivers",
            "Team that can motivate others",
            "Innovation with real results"
        ],
        "challenges_id": [
            "Driver bisa mendominasi ide Spark",
            "Spark merasa tidak didengar",
            "Perbedaan dalam pendekatan (struktural vs bebas)",
            "Kompetisi untuk spotlight"
        ],
        "challenges_en": [
            "Driver may dominate Spark's ideas",
            "Spark feels unheard",
            "Difference in approach (structural vs free)",
            "Competition for spotlight"
        ],
        "tips_id": [
            "Driver: akui kontribusi kreatif Spark",
            "Spark: apresiasi kemampuan eksekusi Driver",
            "Bergantian memimpin dalam proyek berbeda",
            "Ciptakan ruang aman untuk ide bebas"
        ],
        "tips_en": [
            "Driver: acknowledge Spark's creative contribution",
            "Spark: appreciate Driver's execution ability",
            "Take turns leading different projects",
            "Create safe space for free ideas"
        ]
    },
    "anchor_driver": {
        "compatibility_score": 75,
        "energy": "balanced",
        "title_id": "Stabilitas & Aksi",
        "title_en": "Stability & Action",
        "summary_id": "Anchor yang menjaga harmoni bertemu Driver yang berorientasi hasil. Kombinasi yang menyeimbangkan kecepatan dan stabilitas.",
        "summary_en": "Harmony-keeping Anchor meets results-oriented Driver. A combination that balances speed and stability.",
        "strengths_id": [
            "Driver mendorong kemajuan, Anchor menjaga keseimbangan",
            "Keputusan yang mempertimbangkan hubungan dan hasil",
            "Anchor memberikan support emosional",
            "Driver memberikan arah dan motivasi",
            "Tim yang solid dan produktif"
        ],
        "strengths_en": [
            "Driver pushes progress, Anchor maintains balance",
            "Decisions considering relationships and results",
            "Anchor provides emotional support",
            "Driver provides direction and motivation",
            "Solid and productive team"
        ],
        "challenges_id": [
            "Anchor merasa tidak dihargai kontribusinya",
            "Driver merasa ditahan oleh Anchor",
            "Perbedaan kecepatan kerja",
            "Anchor sulit mengatakan tidak ke Driver"
        ],
        "challenges_en": [
            "Anchor feels contributions unappreciated",
            "Driver feels held back by Anchor",
            "Different work speeds",
            "Anchor has difficulty saying no to Driver"
        ],
        "tips_id": [
            "Driver: ucapkan terima kasih secara eksplisit",
            "Anchor: latih ketegasan dalam menyampaikan batasan",
            "Buat keputusan bersama tentang prioritas",
            "Jadwalkan waktu santai tanpa agenda"
        ],
        "tips_en": [
            "Driver: say thank you explicitly",
            "Anchor: practice assertiveness in setting boundaries",
            "Make decisions together about priorities",
            "Schedule relaxation time without agenda"
        ]
    },
    "analyst_driver": {
        "compatibility_score": 70,
        "energy": "focused",
        "title_id": "Strategis & Eksekutor",
        "title_en": "Strategist & Executor",
        "summary_id": "Analyst ingin menganalisis, Driver ingin bertindak. Kombinasi yang kuat untuk keputusan cepat berbasis data.",
        "summary_en": "Analyst wants to analyze, Driver wants to act. A strong combination for fast data-based decisions.",
        "strengths_id": [
            "Keputusan yang cepat dan berbasis data",
            "Driver memberikan urgensi yang dibutuhkan",
            "Analyst memberikan kedalaman analisis",
            "Hasil yang terukur dan optimal",
            "Saling melengkapi dalam perencanaan dan eksekusi"
        ],
        "strengths_en": [
            "Fast and data-based decisions",
            "Driver provides needed urgency",
            "Analyst provides depth of analysis",
            "Measurable and optimal results",
            "Complementing in planning and execution"
        ],
        "challenges_id": [
            "Analyst merasa tertekan oleh deadline Driver",
            "Driver frustrasi menunggu analisis",
            "Konflik antara 'sempurna' dan 'sekarang'",
            "Komunikasi yang terlalu singkat atau terlalu detail"
        ],
        "challenges_en": [
            "Analyst feels pressured by Driver's deadlines",
            "Driver frustrated waiting for analysis",
            "Conflict between 'perfect' and 'now'",
            "Communication too brief or too detailed"
        ],
        "tips_id": [
            "Sepakati definisi 'cukup' untuk setiap keputusan",
            "Driver: berikan waktu yang realistis",
            "Analyst: prioritaskan insight paling penting",
            "Buat template keputusan bersama"
        ],
        "tips_en": [
            "Agree on definition of 'enough' for each decision",
            "Driver: give realistic time",
            "Analyst: prioritize most important insights",
            "Create decision templates together"
        ]
    },
    "anchor_spark": {
        "compatibility_score": 90,
        "energy": "harmonious",
        "title_id": "Kehangatan & Kegembiraan",
        "title_en": "Warmth & Joy",
        "summary_id": "Kombinasi yang sangat harmonis! Anchor memberikan stabilitas dan kehangatan, Spark membawa kegembiraan dan petualangan.",
        "summary_en": "A very harmonious combination! Anchor provides stability and warmth, Spark brings joy and adventure.",
        "strengths_id": [
            "Rumah yang hangat DAN menyenangkan",
            "Spark dibumi-kan oleh Anchor",
            "Anchor dibawa keluar zona nyaman oleh Spark",
            "Keseimbangan sempurna antara fun dan keamanan",
            "Hubungan yang penuh cinta dan tawa"
        ],
        "strengths_en": [
            "Home that is warm AND fun",
            "Spark grounded by Anchor",
            "Anchor pushed out of comfort zone by Spark",
            "Perfect balance between fun and security",
            "Relationship full of love and laughter"
        ],
        "challenges_id": [
            "Spark butuh lebih banyak variasi",
            "Anchor butuh lebih banyak stabilitas",
            "Perbedaan energi sosial",
            "Anchor mungkin terlalu protektif"
        ],
        "challenges_en": [
            "Spark needs more variety",
            "Anchor needs more stability",
            "Differences in social energy",
            "Anchor may be too protective"
        ],
        "tips_id": [
            "Ciptakan keseimbangan waktu di rumah dan di luar",
            "Anchor: percayai petualangan Spark",
            "Spark: hargai kebutuhan Anchor akan rutinitas",
            "Buat ritual yang menyenangkan bersama"
        ],
        "tips_en": [
            "Create balance of time at home and outside",
            "Anchor: trust Spark's adventures",
            "Spark: appreciate Anchor's need for routine",
            "Create fun rituals together"
        ]
    },
    "analyst_spark": {
        "compatibility_score": 60,
        "energy": "contrasting",
        "title_id": "Logika & Kreativitas",
        "title_en": "Logic & Creativity",
        "summary_id": "Kombinasi yang sangat kontras! Analyst yang sistematis bertemu Spark yang bebas. Potensi besar jika saling menghormati.",
        "summary_en": "A very contrasting combination! Systematic Analyst meets free-spirited Spark. Great potential if mutually respectful.",
        "strengths_id": [
            "Kreativitas yang tervalidasi oleh logika",
            "Ide-ide inovatif yang bisa dieksekusi",
            "Saling melengkapi perspektif",
            "Analyst memberi struktur pada ide Spark",
            "Spark memberi kehidupan pada analisis"
        ],
        "strengths_en": [
            "Creativity validated by logic",
            "Innovative ideas that can be executed",
            "Complementing perspectives",
            "Analyst gives structure to Spark's ideas",
            "Spark brings life to analysis"
        ],
        "challenges_id": [
            "Spark merasa dibatasi dan dikritik",
            "Analyst frustrasi dengan chaos",
            "Perbedaan cara pemecahan masalah yang ekstrem",
            "Sulit menemukan bahasa yang sama"
        ],
        "challenges_en": [
            "Spark feels limited and criticized",
            "Analyst frustrated with chaos",
            "Extreme difference in problem-solving approaches",
            "Difficult to find common language"
        ],
        "tips_id": [
            "Pisahkan waktu brainstorming dan evaluasi",
            "Analyst: apresiasi dulu sebelum mengkritik",
            "Spark: terima analisis sebagai bentuk perhatian",
            "Rayakan keunikan perspektif masing-masing"
        ],
        "tips_en": [
            "Separate brainstorming and evaluation time",
            "Analyst: appreciate first before criticizing",
            "Spark: accept analysis as a form of care",
            "Celebrate each other's unique perspectives"
        ]
    },
    "analyst_anchor": {
        "compatibility_score": 70,
        "energy": "thoughtful",
        "title_id": "Pikiran & Hati",
        "title_en": "Mind & Heart",
        "summary_id": "Analyst yang rasional bertemu Anchor yang emosional. Keseimbangan yang baik jika bisa saling memahami bahasa masing-masing.",
        "summary_en": "Rational Analyst meets emotional Anchor. A good balance if they can understand each other's language.",
        "strengths_id": [
            "Keputusan yang seimbang (logis dan emosional)",
            "Analyst belajar empati dari Anchor",
            "Anchor belajar berpikir jernih dari Analyst",
            "Hubungan yang stabil dan bermakna",
            "Komunikasi yang dalam jika terbangun"
        ],
        "strengths_en": [
            "Balanced decisions (logical and emotional)",
            "Analyst learns empathy from Anchor",
            "Anchor learns clear thinking from Analyst",
            "Stable and meaningful relationship",
            "Deep communication once established"
        ],
        "challenges_id": [
            "Anchor merasa tidak dipahami secara emosional",
            "Analyst merasa terlalu banyak emosi",
            "Perbedaan cara mengekspresikan cinta",
            "Kesulitan dalam komunikasi konflik"
        ],
        "challenges_en": [
            "Anchor feels emotionally misunderstood",
            "Analyst feels there are too many emotions",
            "Different ways of expressing love",
            "Difficulty in conflict communication"
        ],
        "tips_id": [
            "Analyst: latih menyebut perasaan secara eksplisit",
            "Anchor: berikan ruang untuk Analyst memproses",
            "Buat 'love language' yang dipahami bersama",
            "Jadwalkan waktu untuk koneksi emosional"
        ],
        "tips_en": [
            "Analyst: practice naming feelings explicitly",
            "Anchor: give Analyst space to process",
            "Create a 'love language' understood by both",
            "Schedule time for emotional connection"
        ]
    }
}

@compatibility_router.get("/matrix")
async def get_compatibility_matrix():
    """Get the full compatibility matrix"""
    # Create a summary view
    archetypes = ["driver", "spark", "anchor", "analyst"]
    matrix_summary = []
    
    for arch1 in archetypes:
        row = {"archetype": arch1, "compatibilities": {}}
        for arch2 in archetypes:
            key = f"{arch1}_{arch2}"
            if key in COMPATIBILITY_MATRIX:
                row["compatibilities"][arch2] = {
                    "score": COMPATIBILITY_MATRIX[key]["compatibility_score"],
                    "energy": COMPATIBILITY_MATRIX[key]["energy"]
                }
        matrix_summary.append(row)
    
    return {"matrix": matrix_summary, "archetypes": archetypes}

@compatibility_router.get("/pair/{arch1}/{arch2}")
async def get_compatibility_pair(arch1: str, arch2: str, language: str = "id"):
    """Get detailed compatibility for a specific pair"""
    arch1 = arch1.lower()
    arch2 = arch2.lower()
    
    key = f"{arch1}_{arch2}"
    if key not in COMPATIBILITY_MATRIX:
        # Try reversed
        key = f"{arch2}_{arch1}"
        if key not in COMPATIBILITY_MATRIX:
            raise HTTPException(status_code=404, detail="Compatibility pair not found")
    
    data = COMPATIBILITY_MATRIX[key]
    
    # Return language-specific data
    result = {
        "pair": f"{arch1}_{arch2}",
        "archetype1": arch1,
        "archetype2": arch2,
        "compatibility_score": data["compatibility_score"],
        "energy": data["energy"],
        "title": data[f"title_{language}"],
        "summary": data[f"summary_{language}"],
        "strengths": data[f"strengths_{language}"],
        "challenges": data[f"challenges_{language}"],
        "tips": data[f"tips_{language}"]
    }
    
    return result

@compatibility_router.get("/for/{archetype}")
async def get_compatibility_for_archetype(archetype: str, language: str = "id"):
    """Get all compatibilities for a specific archetype"""
    archetype = archetype.lower()
    archetypes = ["driver", "spark", "anchor", "analyst"]
    
    if archetype not in archetypes:
        raise HTTPException(status_code=400, detail="Invalid archetype")
    
    compatibilities = []
    
    for other_arch in archetypes:
        key = f"{archetype}_{other_arch}"
        if key not in COMPATIBILITY_MATRIX:
            key = f"{other_arch}_{archetype}"
        
        if key in COMPATIBILITY_MATRIX:
            data = COMPATIBILITY_MATRIX[key]
            compatibilities.append({
                "with_archetype": other_arch,
                "compatibility_score": data["compatibility_score"],
                "energy": data["energy"],
                "title": data[f"title_{language}"],
                "summary": data[f"summary_{language}"]
            })
    
    # Sort by score
    compatibilities.sort(key=lambda x: x["compatibility_score"], reverse=True)
    
    return {
        "archetype": archetype,
        "compatibilities": compatibilities
    }

@compatibility_router.get("/share/card/{arch1}/{arch2}")
async def generate_compatibility_share_card(arch1: str, arch2: str, language: str = "id"):
    """Generate shareable SVG card for compatibility pair"""
    arch1 = arch1.lower()
    arch2 = arch2.lower()
    
    # Get compatibility data
    key = f"{arch1}_{arch2}"
    if key not in COMPATIBILITY_MATRIX:
        key = f"{arch2}_{arch1}"
        if key not in COMPATIBILITY_MATRIX:
            raise HTTPException(status_code=404, detail="Compatibility pair not found")
    
    data = COMPATIBILITY_MATRIX[key]
    
    archetype_colors = {
        "driver": "#C05640",
        "spark": "#D99E30", 
        "anchor": "#5D8A66",
        "analyst": "#5B8FA8"
    }
    archetype_names = {
        "driver": {"id": "Penggerak", "en": "Driver"},
        "spark": {"id": "Percikan", "en": "Spark"},
        "anchor": {"id": "Jangkar", "en": "Anchor"},
        "analyst": {"id": "Analis", "en": "Analyst"}
    }
    
    arch1_color = archetype_colors.get(arch1, "#4A3B32")
    arch2_color = archetype_colors.get(arch2, "#4A3B32")
    arch1_name = archetype_names.get(arch1, {}).get(language, arch1.title())
    arch2_name = archetype_names.get(arch2, {}).get(language, arch2.title())
    
    score = data["compatibility_score"]
    title = data[f"title_{language}"]
    
    # Score color based on value
    if score >= 85:
        score_color = "#5D8A66"  # green
    elif score >= 75:
        score_color = "#D99E30"  # yellow
    elif score >= 65:
        score_color = "#C05640"  # orange
    else:
        score_color = "#5B8FA8"  # blue
    
    header_text = "Kompatibilitas Komunikasi" if language == "id" else "Communication Compatibility"
    cta = "Cek kompatibilitasmu di relasi4warna.com" if language == "id" else "Check your compatibility at 4colorrelating.com"
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 315" width="600" height="315">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FDFCF8"/>
                <stop offset="100%" style="stop-color:#F2EFE9"/>
            </linearGradient>
            <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:{arch1_color}"/>
                <stop offset="100%" style="stop-color:{arch2_color}"/>
            </linearGradient>
        </defs>
        <rect width="600" height="315" fill="url(#bgGrad)"/>
        <rect x="0" y="0" width="600" height="8" fill="url(#topBar)"/>
        
        <!-- Archetype circles -->
        <circle cx="180" cy="130" r="40" fill="{arch1_color}" opacity="0.15"/>
        <circle cx="180" cy="130" r="25" fill="{arch1_color}"/>
        <circle cx="420" cy="130" r="40" fill="{arch2_color}" opacity="0.15"/>
        <circle cx="420" cy="130" r="25" fill="{arch2_color}"/>
        
        <!-- Heart icon in middle -->
        <text x="300" y="140" text-anchor="middle" font-size="28" fill="#E6E2D8">♥</text>
        
        <!-- Header -->
        <text x="300" y="45" text-anchor="middle" font-family="serif" font-size="16" fill="#7A6E62">{header_text}</text>
        
        <!-- Archetype names -->
        <text x="180" y="190" text-anchor="middle" font-family="serif" font-weight="bold" font-size="18" fill="{arch1_color}">{arch1_name}</text>
        <text x="420" y="190" text-anchor="middle" font-family="serif" font-weight="bold" font-size="18" fill="{arch2_color}">{arch2_name}</text>
        
        <!-- Score -->
        <rect x="255" y="200" width="90" height="45" rx="10" fill="{score_color}" opacity="0.15"/>
        <text x="300" y="232" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="{score_color}">{score}</text>
        
        <!-- Title -->
        <text x="300" y="265" text-anchor="middle" font-family="serif" font-size="14" fill="#4A3B32">"{title}"</text>
        
        <!-- Divider -->
        <rect x="150" y="278" width="300" height="1" fill="#E6E2D8"/>
        
        <!-- CTA -->
        <text x="300" y="300" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#7A6E62">{cta}</text>
        
        <!-- Logo -->
        <rect x="20" y="287" width="50" height="16" rx="4" fill="#4A3B32"/>
        <text x="45" y="299" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#FDFCF8">R4</text>
    </svg>'''
    
    return Response(content=svg_content, media_type="image/svg+xml")

# Admin Blog Endpoints
@admin_router.post("/blog/articles")
async def create_article(data: CreateArticleRequest, user=Depends(get_admin_user)):
    """Create a new blog article"""
    # Check slug uniqueness
    existing = await db.blog_articles.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    article_id = f"art_{uuid.uuid4().hex[:12]}"
    article = {
        "article_id": article_id,
        "title_id": data.title_id,
        "title_en": data.title_en,
        "slug": data.slug,
        "excerpt_id": data.excerpt_id,
        "excerpt_en": data.excerpt_en,
        "content_id": data.content_id,
        "content_en": data.content_en,
        "category": data.category,
        "tags": data.tags,
        "featured_image": data.featured_image,
        "seo_title": data.seo_title or data.title_en,
        "seo_description": data.seo_description or data.excerpt_en[:160],
        "status": data.status,
        "author_id": user["user_id"],
        "author_name": user.get("name", "Admin"),
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blog_articles.insert_one(article)
    article.pop("_id", None)
    return article

@admin_router.put("/blog/articles/{article_id}")
async def update_article(article_id: str, data: UpdateArticleRequest, user=Depends(get_admin_user)):
    """Update a blog article"""
    article = await db.blog_articles.find_one({"article_id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Check slug uniqueness if changing
    if "slug" in update_data and update_data["slug"] != article.get("slug"):
        existing = await db.blog_articles.find_one({"slug": update_data["slug"]})
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_articles.update_one(
        {"article_id": article_id},
        {"$set": update_data}
    )
    
    updated = await db.blog_articles.find_one({"article_id": article_id}, {"_id": 0})
    return updated

@admin_router.delete("/blog/articles/{article_id}")
async def delete_article(article_id: str, user=Depends(get_admin_user)):
    """Delete a blog article"""
    result = await db.blog_articles.delete_one({"article_id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "deleted", "article_id": article_id}

@admin_router.get("/blog/articles")
async def admin_get_articles(page: int = 1, limit: int = 20, status: str = "all", user=Depends(get_admin_user)):
    """Get all articles for admin"""
    skip = (page - 1) * limit
    
    query = {}
    if status != "all":
        query["status"] = status
    
    articles = await db.blog_articles.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blog_articles.count_documents(query)
    
    return {
        "articles": articles,
        "total": total,
        "page": page
    }

# Weekly Tips Router
tips_router = APIRouter(prefix="/tips", tags=["tips"])

class TipsSubscription(BaseModel):
    subscribed: bool = True

class GenerateTipRequest(BaseModel):
    archetype: str
    language: str = "id"

@tips_router.get("/subscription")
async def get_tips_subscription(user=Depends(get_current_user)):
    """Get user's weekly tips subscription status"""
    subscription = await db.tips_subscriptions.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    return {
        "subscribed": subscription.get("subscribed", False) if subscription else False,
        "primary_archetype": subscription.get("primary_archetype") if subscription else None,
        "email": user.get("email"),
        "language": user.get("language", "id")
    }

@tips_router.post("/subscription")
async def update_tips_subscription(data: TipsSubscription, user=Depends(get_current_user)):
    """Subscribe or unsubscribe from weekly tips"""
    # Get user's latest result for archetype
    latest_result = await db.results.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0},
        sort=[("created_at", -1)]
    )
    
    primary_archetype = latest_result.get("primary_archetype") if latest_result else None
    
    subscription = {
        "user_id": user["user_id"],
        "email": user["email"],
        "subscribed": data.subscribed,
        "primary_archetype": primary_archetype,
        "language": user.get("language", "id"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tips_subscriptions.update_one(
        {"user_id": user["user_id"]},
        {"$set": subscription},
        upsert=True
    )
    
    status_msg = "subscribed to" if data.subscribed else "unsubscribed from"
    return {
        "status": "success",
        "message": f"Successfully {status_msg} weekly tips",
        "subscribed": data.subscribed,
        "primary_archetype": primary_archetype
    }

@tips_router.post("/generate")
async def generate_weekly_tip(data: GenerateTipRequest, user=Depends(get_current_user)):
    """Generate a weekly communication tip using AI"""
    archetype = data.archetype.lower()
    if archetype not in ARCHETYPES:
        raise HTTPException(status_code=400, detail="Invalid archetype")
    
    archetype_data = ARCHETYPES[archetype]
    archetype_name = archetype_data.get(f"name_{data.language}", archetype.title())
    
    prompt = f"""
    Anda adalah coach komunikasi hubungan yang hangat dan praktis.
    Bahasa output: {"Indonesia" if data.language == "id" else "English"}
    
    Buat 1 tip komunikasi mingguan untuk seseorang dengan arketipe "{archetype_name}" ({archetype}).
    
    Karakteristik arketipe ini:
    - Kekuatan: {', '.join(archetype_data.get(f'strengths_{data.language}', [])[:3])}
    - Area perhatian: {', '.join(archetype_data.get(f'blindspots_{data.language}', [])[:2])}
    
    Format tip:
    ## Tips Minggu Ini untuk {archetype_name}
    
    **Fokus Minggu Ini:** [Tema spesifik 3-5 kata]
    
    **Tips Praktis:**
    [1 paragraf berisi saran konkret yang bisa langsung diterapkan]
    
    **Latihan Harian:**
    [1 aktivitas sederhana yang bisa dilakukan setiap hari]
    
    **Skrip Contoh:**
    Situasi: [situasi umum]
    Daripada: "[kalimat yang sebaiknya dihindari]"
    Coba: "[kalimat alternatif yang lebih baik]"
    
    **Afirmasi Minggu Ini:**
    "[1 kalimat afirmasi positif untuk arketipe ini]"
    
    Buat konten yang segar, relevan dengan kehidupan sehari-hari, dan mudah diterapkan.
    Gunakan bahasa yang hangat dan mendorong.
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"tip_{user['user_id']}_{datetime.now().strftime('%Y%m%d')}",
            system_message="Anda adalah relationship communication coach yang hangat, supportif, dan praktis."
        ).with_model("openai", "gpt-5.2")
        
        tip_content = await chat.send_message(UserMessage(text=prompt))
        
        # Save generated tip
        tip_id = f"tip_{uuid.uuid4().hex[:12]}"
        tip = {
            "tip_id": tip_id,
            "user_id": user["user_id"],
            "archetype": archetype,
            "language": data.language,
            "content": tip_content,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.generated_tips.insert_one(tip)
        
        tip.pop("_id", None)
        return tip
    except Exception as e:
        logger.error(f"Error generating tip: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate tip")

@tips_router.get("/history")
async def get_tips_history(limit: int = 10, user=Depends(get_current_user)):
    """Get user's generated tips history"""
    tips = await db.generated_tips.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return {"tips": tips}

@tips_router.get("/latest")
async def get_latest_tip(user=Depends(get_current_user)):
    """Get user's latest generated tip"""
    tip = await db.generated_tips.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0},
        sort=[("created_at", -1)]
    )
    if not tip:
        return {"tip": None, "message": "No tips generated yet"}
    return {"tip": tip}

# Admin endpoint for sending weekly tips batch
@admin_router.post("/send-weekly-tips")
async def send_weekly_tips_batch(user=Depends(get_admin_user)):
    """Send weekly tips to all subscribed users (admin only)"""
    subscribers = await db.tips_subscriptions.find(
        {"subscribed": True},
        {"_id": 0}
    ).to_list(1000)
    
    if not subscribers:
        return {"status": "no_subscribers", "message": "No active subscribers"}
    
    sent_count = 0
    errors = []
    
    for sub in subscribers:
        if not sub.get("primary_archetype"):
            continue
            
        try:
            # Generate tip for this user's archetype
            archetype = sub["primary_archetype"]
            language = sub.get("language", "id")
            archetype_data = ARCHETYPES.get(archetype, {})
            archetype_name = archetype_data.get(f"name_{language}", archetype.title())
            
            prompt = f"""
            Buat tip komunikasi mingguan singkat untuk arketipe "{archetype_name}" ({archetype}).
            Bahasa: {"Indonesia" if language == "id" else "English"}
            
            Format:
            **Tips Minggu Ini:** [1 tip praktis singkat]
            
            **Latihan Harian:** [1 aktivitas sederhana]
            
            **Afirmasi:** "[1 kalimat afirmasi]"
            
            Buat singkat, hangat, dan mudah diterapkan.
            """
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"batch_tip_{sub['user_id']}",
                system_message="Anda adalah relationship coach yang hangat dan praktis."
            ).with_model("openai", "gpt-5.2")
            
            tip_content = await chat.send_message(UserMessage(text=prompt))
            
            # Send email with tip
            if RESEND_API_KEY:
                subject = f"Tips Komunikasi Mingguan Anda - {archetype_name}" if language == "id" else f"Your Weekly Communication Tip - {archetype_name}"
                html_content = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; padding: 20px; background-color: #4A3B32; color: white; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">{'Relasi4Warna' if language == 'id' else '4Color Relating'}</h1>
                        <p style="margin: 5px 0 0 0;">{'Tips Mingguan Anda' if language == 'id' else 'Your Weekly Tips'}</p>
                    </div>
                    <div style="padding: 30px; background-color: #FDFCF8; border: 1px solid #E6E2D8;">
                        <div style="white-space: pre-wrap;">{tip_content}</div>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #7A6E62; font-size: 12px;">
                        <p>{'Untuk berhenti berlangganan, kunjungi dashboard Anda.' if language == 'id' else 'To unsubscribe, visit your dashboard.'}</p>
                    </div>
                </div>
                """
                
                params = {
                    "from": SENDER_EMAIL,
                    "to": [sub["email"]],
                    "subject": subject,
                    "html": html_content
                }
                await asyncio.to_thread(resend.Emails.send, params)
            
            sent_count += 1
            
        except Exception as e:
            errors.append({"user_id": sub["user_id"], "error": str(e)})
            logger.error(f"Error sending tip to {sub['user_id']}: {e}")
    
    return {
        "status": "completed",
        "sent_count": sent_count,
        "total_subscribers": len(subscribers),
        "errors": errors[:10] if errors else []
    }

@admin_router.get("/tips-subscribers")
async def get_tips_subscribers(user=Depends(get_admin_user)):
    """Get all weekly tips subscribers (admin only)"""
    subscribers = await db.tips_subscriptions.find({}, {"_id": 0}).to_list(500)
    active = sum(1 for s in subscribers if s.get("subscribed"))
    return {
        "subscribers": subscribers,
        "total": len(subscribers),
        "active": active
    }

async def seed_questions_for_series(series: str) -> List[dict]:
    """Generate seed questions for a series using expanded questions data"""
    questions_data = EXPANDED_QUESTIONS.get(series, [])
    
    questions = []
    for idx, q in enumerate(questions_data):
        question_id = f"q_{series}_{idx+1}"
        question = {
            "question_id": question_id,
            "series": series,
            "question_id_text": q["id_text"],
            "question_en_text": q["en_text"],
            "question_type": "forced_choice",
            "options": q["options"],
            "scoring_map": {opt["archetype"]: 1 for opt in q["options"]},
            "stress_marker_flag": idx in [0, 5, 12, 18],  # Mark some questions as stress markers
            "active": True,
            "order": idx + 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.questions.insert_one(question)
        questions.append(question)
    
    return questions

async def seed_admin_user():
    """Create default admin user"""
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@relasi4warna.com')
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if not existing:
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin123!')
        user_id = f"admin_{uuid.uuid4().hex[:8]}"
        admin = {
            "user_id": user_id,
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "language": "id",
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        logger.info(f"Admin user created: {admin_email}")

# ==================== APP SETUP ====================

@app.on_event("startup")
async def startup_event():
    await seed_admin_user()
    # Seed questions for all series
    for series in ["family", "business", "friendship", "couples"]:
        count = await db.questions.count_documents({"series": series})
        if count == 0:
            await seed_questions_for_series(series)
            logger.info(f"Seeded questions for {series}")

@api_router.get("/")
async def root():
    return {"message": "Relasi4Warna API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(quiz_router)
api_router.include_router(payment_router)
api_router.include_router(report_router)
api_router.include_router(admin_router)
api_router.include_router(share_router)
api_router.include_router(email_router)
api_router.include_router(couples_router)
api_router.include_router(team_router)
api_router.include_router(challenge_router)
api_router.include_router(blog_router)
api_router.include_router(compatibility_router)
api_router.include_router(tips_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
