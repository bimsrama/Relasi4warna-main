"""
Shared Types
============
Common type definitions used across packages.
"""

from enum import Enum
from typing import TypedDict, Optional, List


class UserTier(str, Enum):
    """User subscription tiers"""
    FREE = "free"
    PREMIUM = "premium"
    ELITE = "elite"
    ELITE_PLUS = "elite_plus"
    CERTIFICATION = "certification"


class Series(str, Enum):
    """Quiz series types"""
    FAMILY = "family"
    BUSINESS = "business"
    FRIENDSHIP = "friendship"
    COUPLES = "couples"


class Language(str, Enum):
    """Supported languages"""
    ENGLISH = "en"
    INDONESIAN = "id"


class Archetype(str, Enum):
    """Personality archetypes"""
    DRIVER = "driver"
    SPARK = "spark"
    ANCHOR = "anchor"
    ANALYST = "analyst"


# TypedDict definitions for structured data

class QuizAnswer(TypedDict):
    """Single quiz answer"""
    question_id: str
    selected_option: str


class QuizResult(TypedDict):
    """Complete quiz result"""
    result_id: str
    user_id: str
    series: str
    primary_archetype: str
    secondary_archetype: str
    scores: dict
    balance_index: float
    is_paid: bool
    created_at: str


class UserProfile(TypedDict):
    """User profile data"""
    user_id: str
    email: str
    name: str
    tier: str
    language: str
    is_admin: bool
    created_at: str


class RiskAssessmentType(TypedDict):
    """Risk assessment data"""
    assessment_id: str
    content_id: str
    user_id: str
    level: str
    total_score: int
    factors: dict
    keywords_found: List[str]
    requires_review: bool
    created_at: str


class ModerationItemType(TypedDict):
    """Moderation queue item"""
    queue_id: str
    content_id: str
    user_id: str
    original_content: str
    anonymized_content: str
    risk_level: str
    status: str
    created_at: str
    updated_at: str
