"""
Shared Constants
================
Common constants used across the application.
"""

from typing import Dict, List, Any


# Archetype definitions
ARCHETYPES = {
    "driver": {
        "name_id": "Penggerak",
        "name_en": "Driver",
        "color": "#C05640",
        "description_id": "Berorientasi aksi dan langsung",
        "description_en": "Action-oriented and direct"
    },
    "spark": {
        "name_id": "Percikan",
        "name_en": "Spark",
        "color": "#D99E30",
        "description_id": "Kreatif dan antusias",
        "description_en": "Creative and enthusiastic"
    },
    "anchor": {
        "name_id": "Jangkar",
        "name_en": "Anchor",
        "color": "#5D8A66",
        "description_id": "Stabil dan mendukung",
        "description_en": "Stable and supportive"
    },
    "analyst": {
        "name_id": "Analis",
        "name_en": "Analyst",
        "color": "#5B8FA8",
        "description_id": "Logis dan sistematis",
        "description_en": "Logical and systematic"
    }
}


# Quiz series configuration
SERIES_CONFIG = {
    "family": {
        "name_id": "Keluarga",
        "name_en": "Family",
        "icon": "home",
        "questions_count": 26,
        "description_id": "Temukan pola komunikasi keluarga Anda",
        "description_en": "Discover your family communication patterns"
    },
    "business": {
        "name_id": "Bisnis",
        "name_en": "Business",
        "icon": "briefcase",
        "questions_count": 26,
        "description_id": "Pahami gaya kerja profesional Anda",
        "description_en": "Understand your professional work style"
    },
    "friendship": {
        "name_id": "Pertemanan",
        "name_en": "Friendship",
        "icon": "users",
        "questions_count": 26,
        "description_id": "Kenali cara Anda berhubungan dengan teman",
        "description_en": "Know how you relate to friends"
    },
    "couples": {
        "name_id": "Pasangan",
        "name_en": "Couples",
        "icon": "heart",
        "questions_count": 26,
        "description_id": "Optimalkan komunikasi dengan pasangan",
        "description_en": "Optimize communication with your partner"
    }
}


# Tier features and pricing
TIER_FEATURES = {
    "free": {
        "name_id": "Gratis",
        "name_en": "Free",
        "price_idr": 0,
        "price_usd": 0,
        "features": [
            "Basic quiz results",
            "Primary archetype identification",
            "Basic compatibility score"
        ]
    },
    "premium": {
        "name_id": "Premium",
        "name_en": "Premium",
        "price_idr": 99000,
        "price_usd": 6.99,
        "features": [
            "Full AI-generated report",
            "Detailed strengths & blind spots",
            "Communication scripts",
            "7-day action plan",
            "PDF download"
        ]
    },
    "elite": {
        "name_id": "Elite",
        "name_en": "Elite",
        "price_idr": 299000,
        "price_usd": 19.99,
        "features": [
            "All Premium features",
            "Quarterly Calibration module",
            "Parent-Child Dynamics module",
            "Business Leadership module",
            "Team Dynamics module"
        ]
    },
    "elite_plus": {
        "name_id": "Elite+",
        "name_en": "Elite+",
        "price_idr": 999000,
        "price_usd": 69.99,
        "features": [
            "All Elite features",
            "Certification Program (Levels 1-4)",
            "AI-Human Hybrid Coaching",
            "Governance Dashboard access",
            "Board-level metrics"
        ]
    },
    "certification": {
        "name_id": "Sertifikasi",
        "name_en": "Certification",
        "price_idr": 4999000,
        "price_usd": 349.99,
        "features": [
            "Full Certification Program",
            "Practitioner license",
            "Client management tools",
            "White-label reports"
        ]
    }
}


# Products for checkout
PRODUCTS = {
    "single_report": {"price_idr": 99000, "price_usd": 6.99, "tier": "premium"},
    "family_pack": {"price_idr": 349000, "price_usd": 24.99, "tier": "premium"},
    "team_pack": {"price_idr": 499000, "price_usd": 34.99, "tier": "premium"},
    "couples_pack": {"price_idr": 149000, "price_usd": 9.99, "tier": "premium"},
    "elite_single": {"price_idr": 299000, "price_usd": 19.99, "tier": "elite"},
    "elite_monthly": {"price_idr": 499000, "price_usd": 34.99, "tier": "elite"},
    "elite_plus_monthly": {"price_idr": 999000, "price_usd": 69.99, "tier": "elite_plus"},
    "certification_program": {"price_idr": 4999000, "price_usd": 349.99, "tier": "certification"}
}


# Risk level thresholds
RISK_THRESHOLDS = {
    "level_1_max": 30,
    "level_2_max": 60
}


# Rate limiting
RATE_LIMITS = {
    "ai_generation": {"requests": 10, "window_seconds": 3600},
    "quiz_submit": {"requests": 5, "window_seconds": 60},
    "login_attempts": {"requests": 5, "window_seconds": 300}
}
