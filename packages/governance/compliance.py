"""
Compliance Checker
==================
Checks system compliance with governance framework.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta


# Governance rules as per framework
GOVERNANCE_RULES = {
    # Section 1: System Integrity
    "SI-001": {
        "name": "HITL Risk Assessment",
        "description": "All AI outputs must undergo risk assessment",
        "check_type": "runtime",
        "severity": "critical"
    },
    "SI-002": {
        "name": "Safety Buffer Application",
        "description": "Level 2 content must have safety buffer",
        "check_type": "runtime",
        "severity": "high"
    },
    "SI-003": {
        "name": "Level 3 Block",
        "description": "Level 3 content must be blocked for human review",
        "check_type": "runtime",
        "severity": "critical"
    },
    
    # Section 2: Content Policy
    "CP-001": {
        "name": "No Clinical Diagnosis",
        "description": "System must not diagnose mental health conditions",
        "check_type": "content",
        "severity": "critical"
    },
    "CP-002": {
        "name": "No Weaponization",
        "description": "System must not enable manipulation of others",
        "check_type": "content",
        "severity": "critical"
    },
    "CP-003": {
        "name": "Scope Boundaries",
        "description": "System must stay within relationship communication scope",
        "check_type": "content",
        "severity": "high"
    },
    
    # Section 3: Data Handling
    "DH-001": {
        "name": "PII Anonymization",
        "description": "PII must be anonymized for moderation review",
        "check_type": "data",
        "severity": "high"
    },
    "DH-002": {
        "name": "Audit Trail",
        "description": "All significant actions must be logged",
        "check_type": "runtime",
        "severity": "medium"
    },
    
    # Section 4: Access Control
    "AC-001": {
        "name": "Admin Authentication",
        "description": "Admin actions require authentication",
        "check_type": "access",
        "severity": "critical"
    },
    "AC-002": {
        "name": "Tier Enforcement",
        "description": "Features must be gated by user tier",
        "check_type": "access",
        "severity": "high"
    }
}


@dataclass
class ComplianceCheck:
    """Result of a single compliance check"""
    rule_id: str
    rule_name: str
    passed: bool
    message: str
    severity: str
    checked_at: datetime


@dataclass
class ComplianceReport:
    """Full compliance report"""
    report_id: str
    generated_at: datetime
    total_rules: int
    passed_rules: int
    failed_rules: int
    checks: List[ComplianceCheck]
    overall_status: str  # "compliant", "non_compliant", "warning"
    
    def to_dict(self) -> Dict:
        return {
            "report_id": self.report_id,
            "generated_at": self.generated_at.isoformat(),
            "total_rules": self.total_rules,
            "passed_rules": self.passed_rules,
            "failed_rules": self.failed_rules,
            "checks": [
                {
                    "rule_id": c.rule_id,
                    "rule_name": c.rule_name,
                    "passed": c.passed,
                    "message": c.message,
                    "severity": c.severity
                }
                for c in self.checks
            ],
            "overall_status": self.overall_status
        }


class ComplianceChecker:
    """
    Checks system compliance with governance framework.
    
    Can run periodic compliance audits and generate reports.
    """
    
    def __init__(self, db_adapter=None):
        self.db = db_adapter
        self.rules = GOVERNANCE_RULES
    
    def check_runtime_compliance(self, metrics: Dict) -> List[ComplianceCheck]:
        """
        Check runtime compliance based on system metrics.
        
        Args:
            metrics: Dict with system metrics (from analytics)
            
        Returns:
            List of compliance check results
        """
        checks = []
        now = datetime.now()
        
        # SI-001: Check if HITL is being applied
        total_generations = metrics.get("total_ai_generations", 0)
        total_assessments = metrics.get("total_risk_assessments", 0)
        
        if total_generations > 0:
            coverage = total_assessments / total_generations
            checks.append(ComplianceCheck(
                rule_id="SI-001",
                rule_name="HITL Risk Assessment",
                passed=coverage >= 0.99,  # 99% coverage required
                message=f"Risk assessment coverage: {coverage*100:.1f}%",
                severity="critical",
                checked_at=now
            ))
        
        # SI-003: Check Level 3 blocking
        level_3_total = metrics.get("level_3_total", 0)
        level_3_blocked = metrics.get("level_3_blocked", 0)
        
        if level_3_total > 0:
            block_rate = level_3_blocked / level_3_total
            checks.append(ComplianceCheck(
                rule_id="SI-003",
                rule_name="Level 3 Block",
                passed=block_rate >= 1.0,  # 100% must be blocked
                message=f"Level 3 block rate: {block_rate*100:.1f}%",
                severity="critical",
                checked_at=now
            ))
        
        return checks
    
    def check_content_compliance(self, sample_outputs: List[str]) -> List[ComplianceCheck]:
        """
        Check content compliance on sample outputs.
        
        Args:
            sample_outputs: List of AI-generated content to check
            
        Returns:
            List of compliance check results
        """
        from packages.governance.policy_engine import PolicyEngine
        
        checks = []
        now = datetime.now()
        policy = PolicyEngine()
        
        violations_found = 0
        for output in sample_outputs:
            result = policy.evaluate(output)
            if not result.passed:
                violations_found += 1
        
        if sample_outputs:
            violation_rate = violations_found / len(sample_outputs)
            checks.append(ComplianceCheck(
                rule_id="CP-001",
                rule_name="Content Policy Compliance",
                passed=violation_rate == 0,
                message=f"Content violations found in {violations_found}/{len(sample_outputs)} samples",
                severity="critical",
                checked_at=now
            ))
        
        return checks
    
    def generate_report(self, metrics: Dict = None, sample_outputs: List[str] = None) -> ComplianceReport:
        """
        Generate full compliance report.
        
        Args:
            metrics: System metrics for runtime checks
            sample_outputs: Sample outputs for content checks
            
        Returns:
            Complete ComplianceReport
        """
        import uuid
        
        all_checks = []
        
        if metrics:
            all_checks.extend(self.check_runtime_compliance(metrics))
        
        if sample_outputs:
            all_checks.extend(self.check_content_compliance(sample_outputs))
        
        passed = [c for c in all_checks if c.passed]
        failed = [c for c in all_checks if not c.passed]
        
        # Determine overall status
        critical_failures = [c for c in failed if c.severity == "critical"]
        if critical_failures:
            status = "non_compliant"
        elif failed:
            status = "warning"
        else:
            status = "compliant"
        
        return ComplianceReport(
            report_id=str(uuid.uuid4()),
            generated_at=datetime.now(),
            total_rules=len(all_checks),
            passed_rules=len(passed),
            failed_rules=len(failed),
            checks=all_checks,
            overall_status=status
        )


def get_compliance_checker(db_adapter=None) -> ComplianceChecker:
    """Get ComplianceChecker instance"""
    return ComplianceChecker(db_adapter)
