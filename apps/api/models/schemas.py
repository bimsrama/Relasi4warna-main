"""Pydantic models/schemas for API requests and responses"""
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

# ==================== AUTH MODELS ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str

# ==================== QUIZ MODELS ====================
class QuizAnswer(BaseModel):
    question_id: str
    selected_option: int

class QuizSubmission(BaseModel):
    attempt_id: str
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    result_id: str
    primary_archetype: str
    secondary_archetype: str
    scores: Dict[str, float]
    balance_index: float

# ==================== PAYMENT MODELS ====================
class PaymentCreate(BaseModel):
    result_id: str
    product_type: str = "single_report"
    currency: str = "IDR"
    coupon_code: Optional[str] = None

# ==================== ADMIN MODELS ====================
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

class QuestionBulkCreate(BaseModel):
    series: str
    questions: List[Dict[str, Any]]

class PricingCreate(BaseModel):
    product_id: str
    name_id: str
    name_en: str
    description_id: str = ""
    description_en: str = ""
    price_idr: float
    price_usd: float
    features_id: List[str] = []
    features_en: List[str] = []
    active: bool = True
    is_popular: bool = False

class CouponCreate(BaseModel):
    code: str
    discount_percent: int
    max_uses: int = 100

class CouponCreateAdvanced(BaseModel):
    code: str
    discount_type: str = "percent"  # percent, fixed_idr, fixed_usd
    discount_value: float
    max_uses: int = 100
    min_purchase_idr: float = 0
    valid_products: List[str] = []
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    one_per_user: bool = True
    active: bool = True

# ==================== BLOG MODELS ====================
class BlogArticle(BaseModel):
    title_id: str
    title_en: str
    slug: str
    content_id: str
    content_en: str
    excerpt_id: str = ""
    excerpt_en: str = ""
    featured_image: str = ""
    category: str = "tips"
    tags: List[str] = []
    status: str = "draft"

# ==================== TEAM/COUPLES MODELS ====================
class TeamPackCreate(BaseModel):
    name: str
    members: List[str] = []

class CouplesPackCreate(BaseModel):
    partner_email: EmailStr
    pack_name: str = "Our Couples Pack"

class CouplesInvite(BaseModel):
    pack_id: str
    partner_email: EmailStr

# ==================== EMAIL MODELS ====================
class EmailReportRequest(BaseModel):
    result_id: str
    recipient_email: EmailStr
    language: str = "id"

class TipsSubscription(BaseModel):
    email: EmailStr
    language: str = "id"

# ==================== HITL MODELS ====================
class ModerationDecision(BaseModel):
    action: str  # approve, approve_with_buffer, edit, safe_response_only, escalate
    notes: str = ""
    edited_output: str = ""
