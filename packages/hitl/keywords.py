"""
Keyword Scanner
===============
Detect prohibited and sensitive keywords in content.
Implements Annex A and B from governance framework.
"""

from enum import Enum
from typing import Dict, List, Set
import re


class KeywordCategory(str, Enum):
    """Keyword categories with different severity"""
    RED = "red"              # Crisis/violence/self-harm - IMMEDIATE Level 3
    YELLOW = "yellow"        # Distress indicators
    WEAPONIZATION = "weaponization"  # Control/manipulation
    CLINICAL = "clinical"    # Diagnostic terms - blocked
    LABELING = "labeling"    # Demeaning labels - blocked


# ANNEX A: Prohibited/Sensitive Keywords
KEYWORD_REGISTRY = {
    KeywordCategory.RED: {
        "keywords": [
            "suicide", "kill myself", "end my life", "want to die",
            "hurt myself", "self harm", "cut myself",
            "murder", "kill them", "violence", "abuse",
            "bunuh diri", "mau mati", "ingin mati",  # Indonesian
            "menyakiti diri", "kekerasan"
        ],
        "score": 100,  # Immediate Level 3
        "action": "block"
    },
    KeywordCategory.YELLOW: {
        "keywords": [
            "hopeless", "worthless", "no point", "give up",
            "can't go on", "trapped", "desperate",
            "putus asa", "tidak berguna", "terjebak"  # Indonesian
        ],
        "score": 25,
        "action": "flag"
    },
    KeywordCategory.WEAPONIZATION: {
        "keywords": [
            "manipulate", "control them", "make them",
            "force them", "dominate", "punish them",
            "memanipulasi", "mengontrol", "memaksa"  # Indonesian
        ],
        "score": 30,
        "action": "flag"
    },
    KeywordCategory.CLINICAL: {
        "keywords": [
            "narcissist", "narcissistic", "borderline",
            "bipolar", "psychopath", "sociopath",
            "diagnosis", "disorder", "mental illness",
            "narsisis", "gangguan"  # Indonesian
        ],
        "score": 20,
        "action": "replace"
    },
    KeywordCategory.LABELING: {
        "keywords": [
            "toxic", "abuser", "gaslighter",
            "horrible person", "terrible mother",
            "bad father", "worst husband", "worst wife",
            "beracun", "pelaku kekerasan"  # Indonesian
        ],
        "score": 20,
        "action": "replace"
    }
}


class KeywordScanner:
    """
    Scans content for prohibited and sensitive keywords.
    
    Returns score and list of found keywords for risk assessment.
    """
    
    def __init__(self, custom_registry: Dict = None):
        self.registry = custom_registry or KEYWORD_REGISTRY
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Pre-compile regex patterns for efficiency"""
        self.patterns = {}
        for category, config in self.registry.items():
            patterns = []
            for keyword in config["keywords"]:
                # Word boundary matching, case insensitive
                pattern = re.compile(
                    r'\b' + re.escape(keyword) + r'\b',
                    re.IGNORECASE
                )
                patterns.append((keyword, pattern))
            self.patterns[category] = patterns
    
    def scan(self, content: str) -> Dict:
        """
        Scan content for all keyword categories.
        
        Args:
            content: Text to scan
            
        Returns:
            Dict with score, found keywords, and categories
        """
        total_score = 0
        found_keywords = []
        categories_triggered = set()
        
        for category, patterns in self.patterns.items():
            config = self.registry[category]
            for keyword, pattern in patterns:
                if pattern.search(content):
                    total_score += config["score"]
                    found_keywords.append(keyword)
                    categories_triggered.add(category.value)
        
        return {
            "score": total_score,
            "found": found_keywords,
            "categories": list(categories_triggered),
            "has_red": KeywordCategory.RED.value in categories_triggered,
            "requires_immediate_block": total_score >= 100
        }
    
    def get_safe_replacement(self, keyword: str) -> str:
        """
        Get safe replacement text for a keyword.
        Used for LABELING and CLINICAL categories.
        """
        replacements = {
            "narcissist": "someone with challenging behaviors",
            "toxic": "unhealthy patterns",
            "abuser": "person exhibiting harmful behavior",
            "gaslighter": "someone who dismisses your reality",
            "horrible person": "person with difficult behaviors",
            "narsisis": "seseorang dengan perilaku menantang",
            "beracun": "pola yang tidak sehat"
        }
        return replacements.get(keyword.lower(), "[sensitive term removed]")
    
    def sanitize(self, content: str) -> str:
        """
        Sanitize content by replacing flagged keywords.
        
        Args:
            content: Original content
            
        Returns:
            Sanitized content with replacements
        """
        result = content
        
        for category in [KeywordCategory.CLINICAL, KeywordCategory.LABELING]:
            for keyword, pattern in self.patterns.get(category, []):
                replacement = self.get_safe_replacement(keyword)
                result = pattern.sub(replacement, result)
        
        return result


def scan_content(content: str) -> Dict:
    """Convenience function to scan content"""
    scanner = KeywordScanner()
    return scanner.scan(content)
