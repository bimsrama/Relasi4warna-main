"""
Personality Engine - Core Logic
================================
Handles quiz processing, archetype scoring, and profile generation.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class Archetype(str, Enum):
    DRIVER = "driver"      # Red - Action-oriented, direct
    SPARK = "spark"        # Yellow - Enthusiastic, creative
    ANCHOR = "anchor"      # Green - Supportive, stable
    ANALYST = "analyst"    # Blue - Detail-oriented, systematic


@dataclass
class ArchetypeProfile:
    """Complete archetype profile for a user"""
    primary: Archetype
    secondary: Archetype
    scores: Dict[str, float]
    balance_index: float
    strengths: List[str]
    blind_spots: List[str]
    communication_style: str


@dataclass
class ScoreResult:
    """Result from scoring calculation"""
    archetype_scores: Dict[str, float]
    primary: Archetype
    secondary: Archetype
    balance_index: float
    dominant_percentage: float


ARCHETYPE_TRAITS = {
    Archetype.DRIVER: {
        "name_id": "Penggerak",
        "name_en": "Driver",
        "color": "#C05640",
        "strengths": [
            "Decisive and action-oriented",
            "Natural leadership abilities",
            "Direct communication style",
            "Results-focused mindset"
        ],
        "blind_spots": [
            "May appear impatient or controlling",
            "Can overlook emotional needs",
            "Risk of steamrolling others' opinions",
            "Difficulty with ambiguity"
        ],
        "communication_style": "Direct, concise, and focused on outcomes"
    },
    Archetype.SPARK: {
        "name_id": "Percikan",
        "name_en": "Spark",
        "color": "#D99E30",
        "strengths": [
            "Creative and innovative thinking",
            "Enthusiastic and energizing presence",
            "Excellent at generating ideas",
            "Adaptable and spontaneous"
        ],
        "blind_spots": [
            "May struggle with follow-through",
            "Can be disorganized or scattered",
            "Tendency to avoid difficult conversations",
            "May overlook practical constraints"
        ],
        "communication_style": "Enthusiastic, story-driven, and emotionally expressive"
    },
    Archetype.ANCHOR: {
        "name_id": "Jangkar",
        "name_en": "Anchor",
        "color": "#5D8A66",
        "strengths": [
            "Reliable and consistent",
            "Excellent listener and supporter",
            "Creates stability in relationships",
            "Patient and understanding"
        ],
        "blind_spots": [
            "May avoid necessary conflict",
            "Can be overly accommodating",
            "Difficulty expressing own needs",
            "May resist change"
        ],
        "communication_style": "Warm, supportive, and consensus-seeking"
    },
    Archetype.ANALYST: {
        "name_id": "Analis",
        "name_en": "Analyst",
        "color": "#5B8FA8",
        "strengths": [
            "Logical and systematic thinking",
            "Thorough and detail-oriented",
            "Excellent at problem-solving",
            "Quality-focused approach"
        ],
        "blind_spots": [
            "May over-analyze situations",
            "Can appear emotionally distant",
            "Difficulty with ambiguity",
            "May be overly critical"
        ],
        "communication_style": "Precise, factual, and structured"
    }
}


class PersonalityEngine:
    """
    Main engine for personality assessment and profile generation.
    
    Flow:
    1. Process quiz answers
    2. Calculate archetype scores
    3. Determine primary/secondary types
    4. Generate profile with strengths/blind spots
    """
    
    def __init__(self):
        self.archetype_weights = {
            "driver": {"assertive": 1.0, "decisive": 1.0, "results": 0.8, "direct": 0.9},
            "spark": {"creative": 1.0, "enthusiastic": 1.0, "spontaneous": 0.8, "expressive": 0.9},
            "anchor": {"supportive": 1.0, "patient": 1.0, "stable": 0.8, "harmonious": 0.9},
            "analyst": {"logical": 1.0, "thorough": 1.0, "systematic": 0.8, "precise": 0.9}
        }
    
    def process_quiz(self, answers: List[Dict]) -> ScoreResult:
        """
        Process quiz answers and calculate archetype scores.
        
        Args:
            answers: List of {question_id, selected_option} dicts
            
        Returns:
            ScoreResult with scores and primary/secondary archetypes
        """
        scores = {
            "driver": 0.0,
            "spark": 0.0,
            "anchor": 0.0,
            "analyst": 0.0
        }
        
        # Map options to archetype contributions
        option_archetypes = {
            "A": "driver",
            "B": "spark", 
            "C": "anchor",
            "D": "analyst"
        }
        
        for answer in answers:
            option = answer.get("selected_option", "").upper()
            if option in option_archetypes:
                archetype = option_archetypes[option]
                scores[archetype] += 1
        
        # Normalize to percentages
        total = sum(scores.values()) or 1
        normalized = {k: (v / total) * 100 for k, v in scores.items()}
        
        # Determine primary and secondary
        sorted_scores = sorted(normalized.items(), key=lambda x: x[1], reverse=True)
        primary = Archetype(sorted_scores[0][0])
        secondary = Archetype(sorted_scores[1][0])
        
        # Calculate balance index (0-1, higher = more balanced)
        max_score = max(normalized.values())
        min_score = min(normalized.values())
        balance_index = 1 - ((max_score - min_score) / 100)
        
        return ScoreResult(
            archetype_scores=normalized,
            primary=primary,
            secondary=secondary,
            balance_index=round(balance_index, 2),
            dominant_percentage=round(max_score, 1)
        )
    
    def generate_profile(self, score_result: ScoreResult, language: str = "en") -> ArchetypeProfile:
        """
        Generate complete profile from score result.
        
        Args:
            score_result: Calculated scores
            language: "en" or "id"
            
        Returns:
            Complete ArchetypeProfile
        """
        primary_traits = ARCHETYPE_TRAITS[score_result.primary]
        
        return ArchetypeProfile(
            primary=score_result.primary,
            secondary=score_result.secondary,
            scores=score_result.archetype_scores,
            balance_index=score_result.balance_index,
            strengths=primary_traits["strengths"],
            blind_spots=primary_traits["blind_spots"],
            communication_style=primary_traits["communication_style"]
        )
    
    def get_compatibility_score(self, profile1: ArchetypeProfile, profile2: ArchetypeProfile) -> Dict:
        """
        Calculate compatibility between two profiles.
        
        Returns dict with score (0-100), synergies, and challenges.
        """
        # Compatibility matrix (simplified)
        compatibility_matrix = {
            (Archetype.DRIVER, Archetype.ANCHOR): 85,
            (Archetype.DRIVER, Archetype.SPARK): 70,
            (Archetype.DRIVER, Archetype.ANALYST): 75,
            (Archetype.DRIVER, Archetype.DRIVER): 60,
            (Archetype.SPARK, Archetype.ANCHOR): 80,
            (Archetype.SPARK, Archetype.ANALYST): 65,
            (Archetype.SPARK, Archetype.SPARK): 75,
            (Archetype.ANCHOR, Archetype.ANALYST): 85,
            (Archetype.ANCHOR, Archetype.ANCHOR): 80,
            (Archetype.ANALYST, Archetype.ANALYST): 70,
        }
        
        pair = tuple(sorted([profile1.primary, profile2.primary], key=lambda x: x.value))
        base_score = compatibility_matrix.get(pair, 70)
        
        # Adjust based on secondary types
        if profile1.secondary == profile2.primary or profile2.secondary == profile1.primary:
            base_score += 5
        
        return {
            "score": min(100, base_score),
            "synergies": self._get_synergies(profile1.primary, profile2.primary),
            "challenges": self._get_challenges(profile1.primary, profile2.primary)
        }
    
    def _get_synergies(self, type1: Archetype, type2: Archetype) -> List[str]:
        """Get synergy points between two archetypes"""
        synergies = {
            (Archetype.DRIVER, Archetype.ANCHOR): [
                "Driver provides direction, Anchor provides stability",
                "Complementary action and support dynamic"
            ],
            (Archetype.SPARK, Archetype.ANALYST): [
                "Spark generates ideas, Analyst refines them",
                "Creative vision meets practical execution"
            ],
        }
        pair = tuple(sorted([type1, type2], key=lambda x: x.value))
        return synergies.get(pair, ["Shared respect for different perspectives"])
    
    def _get_challenges(self, type1: Archetype, type2: Archetype) -> List[str]:
        """Get potential challenges between two archetypes"""
        challenges = {
            (Archetype.DRIVER, Archetype.DRIVER): [
                "Power struggles may emerge",
                "Both want to lead, need clear role definition"
            ],
            (Archetype.SPARK, Archetype.ANALYST): [
                "Different paces of decision-making",
                "Spontaneity vs. planning tension"
            ],
        }
        pair = tuple(sorted([type1, type2], key=lambda x: x.value))
        return challenges.get(pair, ["Managing different communication styles"])


# Singleton instance
_engine = None

def get_personality_engine() -> PersonalityEngine:
    """Get singleton PersonalityEngine instance"""
    global _engine
    if _engine is None:
        _engine = PersonalityEngine()
    return _engine
