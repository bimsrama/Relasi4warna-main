"""
Output Router
=============
Unified output routing that enforces Governance → HITL → Output flow.

NO AI OUTPUT may bypass this router.
"""

from typing import Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import uuid

# Import from packages
import sys
sys.path.insert(0, '/app/packages')

from hitl.risk_engine import RiskEngine, RiskLevel, RiskAssessment
from hitl.safety import SafetyGate, SAFE_RESPONSE, SAFE_RESPONSE_ID
from hitl.moderation import ModerationQueue, ModerationStatus
from governance.policy_engine import PolicyEngine, PolicyResult
from governance.audit import AuditLogger, AuditEventType


@dataclass
class OutputResult:
    """Result of output processing"""
    success: bool
    content: str
    original_content: Optional[str]
    risk_level: str
    risk_assessment_id: str
    requires_moderation: bool
    moderation_queue_id: Optional[str]
    policy_violations: list
    buffered: bool
    blocked: bool
    audit_event_id: str
    
    def to_dict(self) -> Dict:
        return {
            "success": self.success,
            "content": self.content,
            "risk_level": self.risk_level,
            "risk_assessment_id": self.risk_assessment_id,
            "requires_moderation": self.requires_moderation,
            "moderation_queue_id": self.moderation_queue_id,
            "policy_violations": self.policy_violations,
            "buffered": self.buffered,
            "blocked": self.blocked
        }


class OutputRouter:
    """
    Central router for all AI-generated outputs.
    
    Enforces the flow:
    1. Governance Policy Check
    2. HITL Risk Assessment
    3. Safety Gate
    4. Output Routing
    
    Level 3 content is ALWAYS blocked.
    Level 2 content gets safety buffer.
    Level 1 content passes through.
    """
    
    def __init__(self, db_adapter=None):
        self.policy_engine = PolicyEngine()
        self.risk_engine = RiskEngine()
        self.safety_gate = SafetyGate()
        self.moderation_queue = ModerationQueue(db_adapter)
        self.audit_logger = AuditLogger(db_adapter)
        self.db = db_adapter
    
    async def process(
        self,
        content: str,
        content_id: str,
        user_id: str,
        language: str = "en",
        context: Dict = None
    ) -> OutputResult:
        """
        Process AI output through governance and HITL pipeline.
        
        Args:
            content: AI-generated content
            content_id: Unique content identifier
            user_id: User who requested generation
            language: "en" or "id"
            context: Optional context (user history, etc.)
            
        Returns:
            OutputResult with processed content and metadata
        """
        violations = []
        blocked = False
        buffered = False
        requires_moderation = False
        moderation_queue_id = None
        final_content = content
        
        # STEP 1: Governance Policy Check
        policy_result = self.policy_engine.evaluate(content, context)
        violations = [v.to_dict() for v in policy_result.violations]
        
        if not policy_result.passed:
            # Critical policy violation - block immediately
            blocked = True
            final_content = policy_result.safe_output or (
                SAFE_RESPONSE_ID if language == "id" else SAFE_RESPONSE
            )
        
        # STEP 2: HITL Risk Assessment (even if policy failed - for logging)
        risk_assessment = self.risk_engine.assess(
            content=content,
            content_id=content_id,
            user_id=user_id,
            context=context
        )
        
        # Persist risk assessment
        if self.db:
            await self.db.risk_assessments.insert_one(risk_assessment.to_dict())
        
        # STEP 3: Apply Safety Gate based on risk level
        if not blocked:  # Only if not already blocked by policy
            gate_result = self.safety_gate.process(
                content=content,
                risk_level=risk_assessment.level.value,
                language=language
            )
            
            final_content = gate_result["content"]
            buffered = gate_result["buffered"]
            blocked = not gate_result["allowed"]
            requires_moderation = gate_result["requires_review"]
        
        # STEP 4: Create moderation queue item for Level 3
        if risk_assessment.level == RiskLevel.LEVEL_3 or requires_moderation:
            queue_item = self.moderation_queue.create_queue_item(
                content_id=content_id,
                user_id=user_id,
                original_content=content,
                risk_assessment_id=risk_assessment.assessment_id,
                risk_level=risk_assessment.level.value
            )
            moderation_queue_id = queue_item.queue_id
            
            # Persist queue item
            if self.db:
                await self.db.moderation_queue.insert_one(queue_item.to_dict())
        
        # STEP 5: Audit log
        audit_event = self.audit_logger.log_ai_generation(
            user_id=user_id,
            content_id=content_id,
            model="gpt-4o",  # Or from context
            risk_level=risk_assessment.level.value,
            blocked=blocked
        )
        
        return OutputResult(
            success=not blocked,
            content=final_content,
            original_content=content if blocked else None,
            risk_level=risk_assessment.level.value,
            risk_assessment_id=risk_assessment.assessment_id,
            requires_moderation=requires_moderation,
            moderation_queue_id=moderation_queue_id,
            policy_violations=violations,
            buffered=buffered,
            blocked=blocked,
            audit_event_id=audit_event.event_id
        )
    
    async def get_moderated_content(
        self,
        content_id: str,
        user_id: str
    ) -> Optional[str]:
        """
        Get content after moderation approval.
        
        Returns None if content is still pending or rejected.
        """
        if not self.db:
            return None
        
        # Find moderation queue item
        queue_item = await self.db.moderation_queue.find_one({
            "content_id": content_id,
            "user_id": user_id
        })
        
        if not queue_item:
            return None
        
        status = queue_item.get("status")
        
        if status == ModerationStatus.PENDING.value:
            return None
        
        if status == ModerationStatus.REJECTED.value:
            return None
        
        if status == ModerationStatus.SAFE_RESPONSE_ONLY.value:
            return SAFE_RESPONSE
        
        if status == ModerationStatus.EDITED.value:
            decision = queue_item.get("decision", {})
            return decision.get("edited_content")
        
        if status == ModerationStatus.APPROVED_WITH_BUFFER.value:
            from hitl.safety import SafetyBuffer
            buffer = SafetyBuffer()
            return buffer.wrap(queue_item.get("original_content", ""))
        
        if status == ModerationStatus.APPROVED.value:
            return queue_item.get("original_content")
        
        return None


# Singleton instance
_router = None

def get_output_router(db_adapter=None) -> OutputRouter:
    """Get singleton OutputRouter instance"""
    global _router
    if _router is None:
        _router = OutputRouter(db_adapter)
    return _router


async def process_ai_output(
    content: str,
    content_id: str,
    user_id: str,
    language: str = "en",
    context: Dict = None,
    db_adapter=None
) -> OutputResult:
    """
    Convenience function to process AI output.
    
    Usage:
        result = await process_ai_output(
            content=ai_response,
            content_id=report_id,
            user_id=user_id,
            language="id",
            db_adapter=db
        )
        
        if result.blocked:
            return result.content  # Safe response
        else:
            return result.content  # Original or buffered content
    """
    router = get_output_router(db_adapter)
    return await router.process(
        content=content,
        content_id=content_id,
        user_id=user_id,
        language=language,
        context=context
    )
