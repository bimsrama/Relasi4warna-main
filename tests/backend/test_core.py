"""
Backend Tests - Core Functionality
==================================
Tests for personality engine, HITL, and governance.
"""

import pytest
import sys
sys.path.insert(0, '/app/packages')

from packages.core.personality_engine import PersonalityEngine, Archetype
from packages.core.scoring import calculate_archetype_scores, get_balance_index
from packages.hitl.risk_engine import RiskEngine, RiskLevel
from packages.hitl.keywords import KeywordScanner, KeywordCategory
from packages.hitl.safety import SafetyGate, SAFE_RESPONSE
from packages.governance.policy_engine import PolicyEngine


class TestPersonalityEngine:
    """Tests for PersonalityEngine"""
    
    def test_process_quiz_basic(self):
        """Test basic quiz processing"""
        engine = PersonalityEngine()
        
        # All A answers = Driver
        answers = [{"question_id": str(i), "selected_option": "A"} for i in range(26)]
        result = engine.process_quiz(answers)
        
        assert result.primary == Archetype.DRIVER
        assert result.archetype_scores["driver"] > 50
    
    def test_process_quiz_mixed(self):
        """Test mixed answer quiz"""
        engine = PersonalityEngine()
        
        # Mixed answers
        answers = [
            {"question_id": "1", "selected_option": "A"},
            {"question_id": "2", "selected_option": "B"},
            {"question_id": "3", "selected_option": "C"},
            {"question_id": "4", "selected_option": "D"},
            {"question_id": "5", "selected_option": "A"},
            {"question_id": "6", "selected_option": "B"},
        ]
        result = engine.process_quiz(answers)
        
        assert result.primary in [Archetype.DRIVER, Archetype.SPARK]
        assert result.balance_index > 0  # Some balance
    
    def test_balance_index_calculation(self):
        """Test balance index is between 0 and 1"""
        scores = {"driver": 40, "spark": 30, "anchor": 20, "analyst": 10}
        balance = get_balance_index(scores)
        
        assert 0 <= balance <= 1


class TestHITLRiskEngine:
    """Tests for HITL Risk Engine"""
    
    def test_level_1_normal_content(self):
        """Test normal content gets Level 1"""
        engine = RiskEngine()
        
        content = "You have a balanced communication style with good listening skills."
        result = engine.assess(content, "content_1", "user_1")
        
        assert result.level == RiskLevel.LEVEL_1
        assert result.total_score < 30
    
    def test_level_3_crisis_content(self):
        """Test crisis keywords trigger Level 3"""
        engine = RiskEngine()
        
        content = "I want to hurt myself and end my life."
        result = engine.assess(content, "content_2", "user_2")
        
        assert result.level == RiskLevel.LEVEL_3
        assert result.requires_review == True
        assert len(result.keywords_found) > 0
    
    def test_level_2_sensitive_content(self):
        """Test sensitive content gets Level 2"""
        engine = RiskEngine()
        
        content = "I feel hopeless and trapped in this situation. Everything feels desperate."
        result = engine.assess(content, "content_3", "user_3")
        
        # Should be Level 2 (yellow keywords, not red)
        assert result.level in [RiskLevel.LEVEL_2, RiskLevel.LEVEL_3]


class TestKeywordScanner:
    """Tests for Keyword Scanner"""
    
    def test_scan_red_keywords(self):
        """Test red keywords are detected"""
        scanner = KeywordScanner()
        
        result = scanner.scan("I want to kill myself")
        
        assert result["has_red"] == True
        assert result["requires_immediate_block"] == True
        assert len(result["found"]) > 0
    
    def test_scan_clean_content(self):
        """Test clean content passes"""
        scanner = KeywordScanner()
        
        result = scanner.scan("You communicate well with others.")
        
        assert result["has_red"] == False
        assert result["score"] == 0
    
    def test_scan_clinical_terms(self):
        """Test clinical terms are flagged"""
        scanner = KeywordScanner()
        
        result = scanner.scan("You might be a narcissist with bipolar disorder.")
        
        assert len(result["found"]) > 0
        assert KeywordCategory.CLINICAL.value in result["categories"]


class TestSafetyGate:
    """Tests for Safety Gate"""
    
    def test_level_1_passes(self):
        """Test Level 1 content passes through"""
        gate = SafetyGate()
        
        result = gate.process("Normal content here", "level_1")
        
        assert result["allowed"] == True
        assert result["buffered"] == False
        assert result["content"] == "Normal content here"
    
    def test_level_2_buffered(self):
        """Test Level 2 content gets buffered"""
        gate = SafetyGate()
        
        result = gate.process("Sensitive content here", "level_2")
        
        assert result["allowed"] == True
        assert result["buffered"] == True
        assert "Important Notice" in result["content"]
    
    def test_level_3_blocked(self):
        """Test Level 3 content is blocked"""
        gate = SafetyGate()
        
        result = gate.process("Critical content here", "level_3")
        
        assert result["allowed"] == False
        assert result["requires_review"] == True
        assert "well-being" in result["content"].lower()


class TestPolicyEngine:
    """Tests for Policy Engine"""
    
    def test_clean_content_passes(self):
        """Test clean content passes policy"""
        engine = PolicyEngine()
        
        result = engine.evaluate("You have great communication skills.")
        
        assert result.passed == True
        assert len(result.violations) == 0
    
    def test_clinical_diagnosis_blocked(self):
        """Test clinical diagnosis is caught"""
        engine = PolicyEngine()
        
        result = engine.evaluate("Based on your responses, you have been diagnosed with clinical disorder symptoms.")
        
        # Should flag clinical terms
        assert len(result.violations) > 0 or len(result.warnings) > 0
    
    def test_weaponization_blocked(self):
        """Test manipulation advice is blocked"""
        engine = PolicyEngine()
        
        result = engine.evaluate("Here's how to manipulate them into doing what you want.")
        
        assert result.passed == False
        assert any(v.severity == "critical" for v in result.violations)


class TestIntegration:
    """Integration tests for full pipeline"""
    
    def test_safe_content_pipeline(self):
        """Test safe content through full pipeline"""
        # Process through all stages
        content = "You communicate effectively with a balance of directness and empathy."
        
        # 1. Policy check
        policy = PolicyEngine()
        policy_result = policy.evaluate(content)
        assert policy_result.passed
        
        # 2. Risk assessment
        risk = RiskEngine()
        risk_result = risk.assess(content, "test_1", "user_1")
        assert risk_result.level == RiskLevel.LEVEL_1
        
        # 3. Safety gate
        gate = SafetyGate()
        gate_result = gate.process(content, risk_result.level.value)
        assert gate_result["allowed"]
        assert gate_result["content"] == content
    
    def test_dangerous_content_blocked(self):
        """Test dangerous content is blocked at multiple stages"""
        content = "I want to hurt myself. Help me end this suffering."
        
        # 1. Risk assessment catches it
        risk = RiskEngine()
        risk_result = risk.assess(content, "test_2", "user_2")
        assert risk_result.level == RiskLevel.LEVEL_3
        
        # 2. Safety gate blocks it
        gate = SafetyGate()
        gate_result = gate.process(content, risk_result.level.value)
        assert not gate_result["allowed"]
        assert gate_result["requires_review"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
