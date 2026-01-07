"""
Risk Engine
===========
Core risk assessment logic for AI outputs.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import uuid


class RiskLevel(str, Enum):
    """Risk levels for HITL system"""
    LEVEL_1 = "level_1"  # Normal - auto publish
    LEVEL_2 = "level_2"  # Sensitive - publish with safety buffer
    LEVEL_3 = "level_3"  # Critical - hold for human review


@dataclass
class RiskAssessment:
    """Complete risk assessment for an AI output"""
    assessment_id: str
    content_id: str
    user_id: str
    level: RiskLevel
    total_score: int
    factors: Dict[str, int]
    keywords_found: List[str]
    requires_review: bool
    created_at: datetime = field(default_factory=lambda: datetime.now())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            "assessment_id": self.assessment_id,
            "content_id": self.content_id,
            "user_id": self.user_id,
            "level": self.level.value,
            "total_score": self.total_score,
            "factors": self.factors,
            "keywords_found": self.keywords_found,
            "requires_review": self.requires_review,
            "created_at": self.created_at.isoformat(),
            "metadata": self.metadata
        }


# Risk score thresholds
RISK_THRESHOLDS = {
    "level_1_max": 30,    # Score < 30 = Level 1
    "level_2_max": 60,    # Score 30-60 = Level 2
    # Score > 60 = Level 3
}


class RiskEngine:
    """
    Main risk assessment engine.
    
    Evaluates AI outputs against multiple risk factors:
    - Keyword detection (prohibited terms)
    - Context analysis (emotional intensity)
    - User signals (repeated distress patterns)
    - Content characteristics
    """
    
    def __init__(self):
        self.thresholds = RISK_THRESHOLDS.copy()
    
    def assess(
        self,
        content: str,
        content_id: str,
        user_id: str,
        context: Optional[Dict] = None
    ) -> RiskAssessment:
        """
        Perform full risk assessment on content.
        
        Args:
            content: AI-generated content to assess
            content_id: Unique ID for this content
            user_id: User who triggered generation
            context: Optional context (user history, etc.)
            
        Returns:
            Complete RiskAssessment object
        """
        from .keywords import KeywordScanner
        
        scanner = KeywordScanner()
        factors = {}
        keywords_found = []
        
        # Factor 1: Keyword analysis
        keyword_results = scanner.scan(content)
        factors["keywords"] = keyword_results["score"]
        keywords_found = keyword_results["found"]
        
        # Factor 2: Context intensity
        factors["intensity"] = self._assess_intensity(content)
        
        # Factor 3: User signals (if context provided)
        if context and context.get("user_history"):
            factors["user_signals"] = self._assess_user_signals(context["user_history"])
        else:
            factors["user_signals"] = 0
        
        # Factor 4: Content characteristics
        factors["content_chars"] = self._assess_content_characteristics(content)
        
        # Calculate total score
        total_score = sum(factors.values())
        
        # Determine risk level
        if total_score >= 60 or factors["keywords"] >= 50:
            level = RiskLevel.LEVEL_3
        elif total_score >= 30 or factors["keywords"] >= 25:
            level = RiskLevel.LEVEL_2
        else:
            level = RiskLevel.LEVEL_1
        
        return RiskAssessment(
            assessment_id=str(uuid.uuid4()),
            content_id=content_id,
            user_id=user_id,
            level=level,
            total_score=total_score,
            factors=factors,
            keywords_found=keywords_found,
            requires_review=level == RiskLevel.LEVEL_3,
            metadata=context or {}
        )
    
    def _assess_intensity(self, content: str) -> int:
        """Assess emotional intensity of content"""
        intensity_markers = [
            "always", "never", "everyone", "no one",
            "terrible", "horrible", "devastating",
            "unbearable", "impossible", "hopeless"
        ]
        
        content_lower = content.lower()
        count = sum(1 for marker in intensity_markers if marker in content_lower)
        
        return min(20, count * 4)
    
    def _assess_user_signals(self, history: List[Dict]) -> int:
        """Assess user history for risk signals"""
        if not history:
            return 0
        
        # Count recent Level 2/3 assessments
        recent_flags = sum(1 for item in history[-10:] 
                         if item.get("risk_level") in ["level_2", "level_3"])
        
        return min(20, recent_flags * 5)
    
    def _assess_content_characteristics(self, content: str) -> int:
        """Assess content for structural risk indicators"""
        score = 0
        
        # Excessive capitalization
        words = content.split()
        caps_words = sum(1 for w in words if w.isupper() and len(w) > 2)
        if caps_words > 3:
            score += 5
        
        # Excessive exclamation/question marks
        if content.count('!') > 5:
            score += 5
        if content.count('?') > 10:
            score += 3
        
        # Very short or very long content
        if len(content) < 50:
            score += 3
        elif len(content) > 5000:
            score += 2
        
        return min(15, score)


# Singleton instance
_engine = None

def get_risk_engine() -> RiskEngine:
    """Get singleton RiskEngine instance"""
    global _engine
    if _engine is None:
        _engine = RiskEngine()
    return _engine
