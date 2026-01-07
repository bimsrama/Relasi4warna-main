"""
Scoring Module
==============
Archetype scoring calculations and balance metrics.
"""

from typing import Dict, List, Tuple


def calculate_archetype_scores(answers: List[Dict]) -> Dict[str, float]:
    """
    Calculate raw archetype scores from quiz answers.
    
    Args:
        answers: List of answer dicts with question_id and selected_option
        
    Returns:
        Dict mapping archetype to score (0-100)
    """
    scores = {
        "driver": 0,
        "spark": 0,
        "anchor": 0,
        "analyst": 0
    }
    
    # Option to archetype mapping
    option_map = {
        "A": "driver",
        "B": "spark",
        "C": "anchor", 
        "D": "analyst"
    }
    
    for answer in answers:
        option = answer.get("selected_option", "").upper()
        if option in option_map:
            scores[option_map[option]] += 1
    
    # Normalize to percentages
    total = sum(scores.values()) or 1
    return {k: round((v / total) * 100, 1) for k, v in scores.items()}


def get_balance_index(scores: Dict[str, float]) -> float:
    """
    Calculate balance index from archetype scores.
    
    A perfectly balanced profile has index = 1.0
    A completely dominant profile has index = 0.0
    
    Args:
        scores: Dict of archetype scores
        
    Returns:
        Balance index between 0 and 1
    """
    if not scores:
        return 0.5
    
    values = list(scores.values())
    max_val = max(values)
    min_val = min(values)
    
    # Balance index based on spread
    spread = max_val - min_val
    balance = 1 - (spread / 100)
    
    return round(max(0, min(1, balance)), 2)


def determine_types(scores: Dict[str, float]) -> Tuple[str, str]:
    """
    Determine primary and secondary archetype from scores.
    
    Args:
        scores: Dict of archetype scores
        
    Returns:
        Tuple of (primary, secondary) archetype names
    """
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores[0][0], sorted_scores[1][0]


def calculate_compatibility(scores1: Dict[str, float], scores2: Dict[str, float]) -> int:
    """
    Calculate compatibility score between two profiles.
    
    Uses vector similarity approach with adjustments for
    complementary vs. clashing combinations.
    
    Args:
        scores1: First profile's archetype scores
        scores2: Second profile's archetype scores
        
    Returns:
        Compatibility score 0-100
    """
    # Base similarity (cosine-like)
    dot_product = sum(scores1.get(k, 0) * scores2.get(k, 0) for k in scores1)
    mag1 = sum(v ** 2 for v in scores1.values()) ** 0.5
    mag2 = sum(v ** 2 for v in scores2.values()) ** 0.5
    
    if mag1 == 0 or mag2 == 0:
        return 50
    
    similarity = dot_product / (mag1 * mag2)
    
    # Convert to 0-100 scale with adjustment
    # Pure similarity isn't ideal - some difference is good
    base_score = int(similarity * 60 + 40)
    
    # Complementary bonus
    primary1 = max(scores1, key=scores1.get)
    primary2 = max(scores2, key=scores2.get)
    
    complementary_pairs = [
        ("driver", "anchor"),
        ("spark", "analyst")
    ]
    
    pair = tuple(sorted([primary1, primary2]))
    if pair in [tuple(sorted(p)) for p in complementary_pairs]:
        base_score += 10
    
    return min(100, max(0, base_score))
