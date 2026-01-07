"""
Moderation Module
=================
Human moderation queue and decision handling.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import uuid


class ModerationStatus(str, Enum):
    """Status of moderation queue item"""
    PENDING = "pending"
    APPROVED = "approved"
    APPROVED_WITH_BUFFER = "approved_with_buffer"
    EDITED = "edited"
    SAFE_RESPONSE_ONLY = "safe_response_only"
    ESCALATED = "escalated"
    REJECTED = "rejected"


class ModerationAction(str, Enum):
    """Actions a moderator can take"""
    APPROVE_AS_IS = "approve_as_is"
    APPROVE_WITH_BUFFER = "approve_with_buffer"
    EDIT_OUTPUT = "edit_output"
    SAFE_RESPONSE_ONLY = "safe_response_only"
    ESCALATE = "escalate"
    REJECT = "reject"


@dataclass
class ModerationDecision:
    """Record of a moderation decision"""
    decision_id: str
    queue_item_id: str
    moderator_id: str
    action: ModerationAction
    edited_content: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now())
    
    def to_dict(self) -> Dict:
        return {
            "decision_id": self.decision_id,
            "queue_item_id": self.queue_item_id,
            "moderator_id": self.moderator_id,
            "action": self.action.value,
            "edited_content": self.edited_content,
            "reason": self.reason,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class QueueItem:
    """Item in the moderation queue"""
    queue_id: str
    content_id: str
    user_id: str
    original_content: str
    anonymized_content: str
    risk_assessment_id: str
    risk_level: str
    status: ModerationStatus
    created_at: datetime = field(default_factory=lambda: datetime.now())
    updated_at: datetime = field(default_factory=lambda: datetime.now())
    decision: Optional[ModerationDecision] = None
    
    def to_dict(self) -> Dict:
        return {
            "queue_id": self.queue_id,
            "content_id": self.content_id,
            "user_id": self.user_id,
            "original_content": self.original_content,
            "anonymized_content": self.anonymized_content,
            "risk_assessment_id": self.risk_assessment_id,
            "risk_level": self.risk_level,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "decision": self.decision.to_dict() if self.decision else None
        }


class ModerationQueue:
    """
    Manages the moderation queue for Level 3 content.
    
    Queue items are persisted to database by the API layer.
    This class handles queue logic and decision processing.
    """
    
    def __init__(self, db_adapter=None):
        """
        Args:
            db_adapter: Database adapter for persistence (injected by API)
        """
        self.db = db_adapter
    
    def create_queue_item(
        self,
        content_id: str,
        user_id: str,
        original_content: str,
        risk_assessment_id: str,
        risk_level: str
    ) -> QueueItem:
        """
        Create a new moderation queue item.
        
        Args:
            content_id: ID of the content
            user_id: ID of the user
            original_content: The AI-generated content
            risk_assessment_id: ID of the risk assessment
            risk_level: Level from risk assessment
            
        Returns:
            New QueueItem
        """
        return QueueItem(
            queue_id=str(uuid.uuid4()),
            content_id=content_id,
            user_id=user_id,
            original_content=original_content,
            anonymized_content=self._anonymize(original_content),
            risk_assessment_id=risk_assessment_id,
            risk_level=risk_level,
            status=ModerationStatus.PENDING
        )
    
    def process_decision(
        self,
        queue_item: QueueItem,
        moderator_id: str,
        action: ModerationAction,
        edited_content: Optional[str] = None,
        reason: Optional[str] = None
    ) -> ModerationDecision:
        """
        Process a moderator's decision on a queue item.
        
        Args:
            queue_item: The queue item being moderated
            moderator_id: ID of the moderator
            action: Action taken
            edited_content: Content if action is EDIT_OUTPUT
            reason: Reason for decision
            
        Returns:
            ModerationDecision record
        """
        decision = ModerationDecision(
            decision_id=str(uuid.uuid4()),
            queue_item_id=queue_item.queue_id,
            moderator_id=moderator_id,
            action=action,
            edited_content=edited_content,
            reason=reason
        )
        
        # Update queue item status
        status_map = {
            ModerationAction.APPROVE_AS_IS: ModerationStatus.APPROVED,
            ModerationAction.APPROVE_WITH_BUFFER: ModerationStatus.APPROVED_WITH_BUFFER,
            ModerationAction.EDIT_OUTPUT: ModerationStatus.EDITED,
            ModerationAction.SAFE_RESPONSE_ONLY: ModerationStatus.SAFE_RESPONSE_ONLY,
            ModerationAction.ESCALATE: ModerationStatus.ESCALATED,
            ModerationAction.REJECT: ModerationStatus.REJECTED
        }
        
        queue_item.status = status_map.get(action, ModerationStatus.PENDING)
        queue_item.decision = decision
        queue_item.updated_at = datetime.now()
        
        return decision
    
    def get_released_content(self, queue_item: QueueItem) -> Optional[str]:
        """
        Get the content that should be released to user.
        
        Returns None if content should not be released.
        """
        from .safety import SAFE_RESPONSE, SafetyBuffer
        
        if queue_item.status == ModerationStatus.PENDING:
            return None
        
        if queue_item.status == ModerationStatus.REJECTED:
            return None
        
        if queue_item.status == ModerationStatus.SAFE_RESPONSE_ONLY:
            return SAFE_RESPONSE
        
        if queue_item.status == ModerationStatus.APPROVED_WITH_BUFFER:
            buffer = SafetyBuffer()
            return buffer.wrap(queue_item.original_content)
        
        if queue_item.status == ModerationStatus.EDITED:
            return queue_item.decision.edited_content if queue_item.decision else None
        
        if queue_item.status == ModerationStatus.APPROVED:
            return queue_item.original_content
        
        return None
    
    def _anonymize(self, content: str) -> str:
        """
        Anonymize content for moderator review.
        
        Removes/replaces potentially identifying information.
        """
        import re
        
        result = content
        
        # Replace email patterns
        result = re.sub(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            '[EMAIL]',
            result
        )
        
        # Replace phone patterns
        result = re.sub(
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            '[PHONE]',
            result
        )
        
        # Replace specific names (common patterns)
        result = re.sub(
            r'\b(my husband|my wife|my partner|my mother|my father)\s+([A-Z][a-z]+)\b',
            r'\1 [NAME]',
            result,
            flags=re.IGNORECASE
        )
        
        return result
