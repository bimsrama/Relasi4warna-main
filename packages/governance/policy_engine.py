"""
Policy Engine
=============
Enforces governance policies on all outputs.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid


class ViolationType(str, Enum):
    """Types of policy violations"""
    PROHIBITED_CONTENT = "prohibited_content"
    CLINICAL_DIAGNOSIS = "clinical_diagnosis"
    WEAPONIZATION_RISK = "weaponization_risk"
    PRIVACY_VIOLATION = "privacy_violation"
    SCOPE_VIOLATION = "scope_violation"


@dataclass
class PolicyViolation:
    """Record of a policy violation"""
    violation_id: str
    violation_type: ViolationType
    severity: str  # "critical", "high", "medium", "low"
    description: str
    content_excerpt: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            "violation_id": self.violation_id,
            "violation_type": self.violation_type.value,
            "severity": self.severity,
            "description": self.description,
            "content_excerpt": self.content_excerpt
        }


@dataclass
class PolicyResult:
    """Result of policy evaluation"""
    passed: bool
    violations: List[PolicyViolation]
    warnings: List[str]
    safe_output: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            "passed": self.passed,
            "violations": [v.to_dict() for v in self.violations],
            "warnings": self.warnings,
            "safe_output": self.safe_output
        }


# Core governance rules
GOVERNANCE_RULES = {
    "GR-001": {
        "name": "No Clinical Diagnosis",
        "description": "System must not provide clinical mental health diagnoses",
        "severity": "critical",
        "keywords": ["diagnosed with", "you have been diagnosed", "symptoms indicate", "clinical disorder"]
    },
    "GR-002": {
        "name": "No Weaponization",
        "description": "System must not provide advice that could be used to manipulate others",
        "severity": "critical",
        "keywords": ["manipulate", "control them", "make them feel", "punish them"]
    },
    "GR-003": {
        "name": "Scope Boundaries",
        "description": "System must stay within relationship communication scope",
        "severity": "high",
        "keywords": ["legal advice", "medical treatment", "financial investment"]
    },
    "GR-004": {
        "name": "No Absolute Statements",
        "description": "System should avoid absolute statements about personality",
        "severity": "medium",
        "keywords": ["you will always", "you can never", "impossible for you"]
    }
}


class PolicyEngine:
    """
    Main policy enforcement engine.
    
    All AI outputs must pass through this engine before release.
    """
    
    def __init__(self, rules: Dict = None):
        self.rules = rules or GOVERNANCE_RULES
    
    def evaluate(self, content: str, context: Dict = None) -> PolicyResult:
        """
        Evaluate content against all governance policies.
        
        Args:
            content: Content to evaluate
            context: Optional context (user info, request type)
            
        Returns:
            PolicyResult with violations and warnings
        """
        violations = []
        warnings = []
        
        content_lower = content.lower()
        
        for rule_id, rule in self.rules.items():
            for keyword in rule.get("keywords", []):
                if keyword.lower() in content_lower:
                    if rule["severity"] in ["critical", "high"]:
                        violations.append(PolicyViolation(
                            violation_id=str(uuid.uuid4()),
                            violation_type=self._map_violation_type(rule_id),
                            severity=rule["severity"],
                            description=f"{rule['name']}: {rule['description']}",
                            content_excerpt=self._get_excerpt(content, keyword)
                        ))
                    else:
                        warnings.append(f"{rule['name']}: Found '{keyword}'")
        
        passed = len([v for v in violations if v.severity in ["critical", "high"]]) == 0
        
        return PolicyResult(
            passed=passed,
            violations=violations,
            warnings=warnings,
            safe_output=None if passed else self._generate_safe_output()
        )
    
    def enforce(self, content: str, context: Dict = None) -> Dict:
        """
        Enforce policies and return allowed output.
        
        Args:
            content: Original content
            context: Optional context
            
        Returns:
            Dict with:
                - allowed: bool
                - content: processed content
                - violations: list of violations
        """
        result = self.evaluate(content, context)
        
        if result.passed:
            return {
                "allowed": True,
                "content": content,
                "violations": [v.to_dict() for v in result.violations],
                "warnings": result.warnings
            }
        else:
            return {
                "allowed": False,
                "content": result.safe_output,
                "violations": [v.to_dict() for v in result.violations],
                "warnings": result.warnings
            }
    
    def _map_violation_type(self, rule_id: str) -> ViolationType:
        """Map rule ID to violation type"""
        mapping = {
            "GR-001": ViolationType.CLINICAL_DIAGNOSIS,
            "GR-002": ViolationType.WEAPONIZATION_RISK,
            "GR-003": ViolationType.SCOPE_VIOLATION,
            "GR-004": ViolationType.PROHIBITED_CONTENT
        }
        return mapping.get(rule_id, ViolationType.PROHIBITED_CONTENT)
    
    def _get_excerpt(self, content: str, keyword: str, context_chars: int = 50) -> str:
        """Get excerpt around keyword"""
        lower = content.lower()
        idx = lower.find(keyword.lower())
        if idx == -1:
            return ""
        
        start = max(0, idx - context_chars)
        end = min(len(content), idx + len(keyword) + context_chars)
        
        excerpt = content[start:end]
        if start > 0:
            excerpt = "..." + excerpt
        if end < len(content):
            excerpt = excerpt + "..."
        
        return excerpt
    
    def _generate_safe_output(self) -> str:
        """Generate safe fallback output"""
        return """
We're unable to provide specific guidance on this topic as it falls outside 
our system's scope. For specialized support, please consult with:

- Licensed mental health professionals for emotional concerns
- Legal professionals for legal matters
- Medical professionals for health-related questions

Our system is designed to help with relationship communication patterns 
and interpersonal dynamics within appropriate boundaries.
"""


def get_policy_engine() -> PolicyEngine:
    """Get singleton PolicyEngine instance"""
    return PolicyEngine()
