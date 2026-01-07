"""
Profile Generator
=================
Generate human-readable profiles and summaries.
"""

from typing import Dict, List


ARCHETYPE_DESCRIPTIONS = {
    "driver": {
        "title_en": "The Driver",
        "title_id": "Penggerak",
        "tagline_en": "Action-oriented leader who makes things happen",
        "tagline_id": "Pemimpin berorientasi aksi yang membuat segalanya terjadi",
        "traits": ["decisive", "direct", "results-focused", "confident"],
        "growth_areas": ["patience", "active listening", "emotional awareness"]
    },
    "spark": {
        "title_en": "The Spark",
        "title_id": "Percikan",
        "tagline_en": "Creative enthusiast who inspires others",
        "tagline_id": "Penggemar kreatif yang menginspirasi orang lain",
        "traits": ["creative", "enthusiastic", "optimistic", "adaptable"],
        "growth_areas": ["follow-through", "organization", "realistic planning"]
    },
    "anchor": {
        "title_en": "The Anchor",
        "title_id": "Jangkar",
        "tagline_en": "Supportive presence who provides stability",
        "tagline_id": "Kehadiran yang mendukung dan memberikan stabilitas",
        "traits": ["reliable", "patient", "supportive", "consistent"],
        "growth_areas": ["assertiveness", "change adaptation", "self-advocacy"]
    },
    "analyst": {
        "title_en": "The Analyst",
        "title_id": "Analis",
        "tagline_en": "Thoughtful thinker who ensures quality",
        "tagline_id": "Pemikir yang memastikan kualitas",
        "traits": ["logical", "thorough", "systematic", "quality-focused"],
        "growth_areas": ["flexibility", "quick decisions", "emotional expression"]
    }
}


def generate_profile_summary(
    primary: str,
    secondary: str,
    balance_index: float,
    language: str = "en"
) -> str:
    """
    Generate a narrative summary of the personality profile.
    
    Args:
        primary: Primary archetype
        secondary: Secondary archetype
        balance_index: Balance index (0-1)
        language: "en" or "id"
        
    Returns:
        Markdown-formatted profile summary
    """
    primary_info = ARCHETYPE_DESCRIPTIONS.get(primary, ARCHETYPE_DESCRIPTIONS["driver"])
    secondary_info = ARCHETYPE_DESCRIPTIONS.get(secondary, ARCHETYPE_DESCRIPTIONS["spark"])
    
    title_key = f"title_{language}"
    tagline_key = f"tagline_{language}"
    
    if language == "id":
        balance_text = "seimbang" if balance_index > 0.6 else "dominan"
        summary = f"""## {primary_info[title_key]}

{primary_info[tagline_key]}

### Profil Anda

Anda adalah seorang **{primary_info[title_key]}** dengan pengaruh {secondary_info[title_key]}.
Profil Anda menunjukkan pola yang {"cukup " + balance_text if balance_index > 0.6 else balance_text} 
dengan kejelasan kepribadian.

### Kekuatan Utama
- {', '.join(primary_info['traits'][:3])}

### Area Pertumbuhan
- {', '.join(primary_info['growth_areas'][:2])}
"""
    else:
        balance_text = "balanced" if balance_index > 0.6 else "dominant"
        summary = f"""## {primary_info[title_key]}

{primary_info[tagline_key]}

### Your Profile

You are a **{primary_info[title_key]}** with {secondary_info[title_key]} influence.
Your profile shows a {"fairly " + balance_text if balance_index > 0.6 else balance_text} 
pattern with clear personality definition.

### Core Strengths
- {', '.join(primary_info['traits'][:3])}

### Growth Areas
- {', '.join(primary_info['growth_areas'][:2])}
"""
    
    return summary


def get_archetype_traits(archetype: str) -> Dict:
    """
    Get detailed traits for an archetype.
    
    Args:
        archetype: Archetype name
        
    Returns:
        Dict with traits, growth areas, and descriptions
    """
    return ARCHETYPE_DESCRIPTIONS.get(
        archetype.lower(),
        ARCHETYPE_DESCRIPTIONS["driver"]
    )


def generate_compatibility_narrative(
    type1: str,
    type2: str,
    score: int,
    language: str = "en"
) -> str:
    """
    Generate narrative description of compatibility.
    
    Args:
        type1: First archetype
        type2: Second archetype
        score: Compatibility score (0-100)
        language: "en" or "id"
        
    Returns:
        Narrative text
    """
    info1 = ARCHETYPE_DESCRIPTIONS.get(type1, ARCHETYPE_DESCRIPTIONS["driver"])
    info2 = ARCHETYPE_DESCRIPTIONS.get(type2, ARCHETYPE_DESCRIPTIONS["spark"])
    
    title_key = f"title_{language}"
    
    if score >= 80:
        level = "tinggi" if language == "id" else "high"
    elif score >= 60:
        level = "baik" if language == "id" else "good"
    elif score >= 40:
        level = "moderat" if language == "id" else "moderate"
    else:
        level = "menantang" if language == "id" else "challenging"
    
    if language == "id":
        return f"""Kompatibilitas antara {info1[title_key]} dan {info2[title_key]} 
berada pada tingkat **{level}** ({score}%). Hubungan ini memiliki potensi 
untuk saling melengkapi jika kedua pihak memahami perbedaan gaya komunikasi."""
    else:
        return f"""The compatibility between {info1[title_key]} and {info2[title_key]} 
is at a **{level}** level ({score}%). This relationship has potential for 
complementary dynamics if both parties understand their communication style differences."""
