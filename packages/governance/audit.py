"""
Audit Logger
============
Comprehensive audit trail for all system actions.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid
import json


class AuditEventType(str, Enum):
    """Types of auditable events"""
    # User events
    USER_LOGIN = "user_login"
    USER_REGISTER = "user_register"
    USER_LOGOUT = "user_logout"
    
    # Quiz events
    QUIZ_STARTED = "quiz_started"
    QUIZ_COMPLETED = "quiz_completed"
    
    # AI events
    AI_GENERATION_STARTED = "ai_generation_started"
    AI_GENERATION_COMPLETED = "ai_generation_completed"
    AI_GENERATION_BLOCKED = "ai_generation_blocked"
    
    # HITL events
    RISK_ASSESSMENT_CREATED = "risk_assessment_created"
    MODERATION_REQUIRED = "moderation_required"
    MODERATION_COMPLETED = "moderation_completed"
    
    # Admin events
    ADMIN_ACTION = "admin_action"
    CONFIG_CHANGE = "config_change"
    
    # Payment events
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_COMPLETED = "payment_completed"
    PAYMENT_FAILED = "payment_failed"
    
    # Report events
    REPORT_GENERATED = "report_generated"
    REPORT_DOWNLOADED = "report_downloaded"
    REPORT_SHARED = "report_shared"


@dataclass
class AuditEvent:
    """Single audit event"""
    event_id: str
    event_type: AuditEventType
    user_id: Optional[str]
    timestamp: datetime
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type.value,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
            "details": self.details,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent
        }


class AuditLogger:
    """
    Logs audit events to database.
    
    All significant system actions should be logged through this.
    """
    
    def __init__(self, db_adapter=None):
        """
        Args:
            db_adapter: Database adapter for persistence (injected by API)
        """
        self.db = db_adapter
        self._buffer: List[AuditEvent] = []
        self._buffer_size = 100
    
    def log(
        self,
        event_type: AuditEventType,
        user_id: Optional[str] = None,
        details: Dict = None,
        ip_address: str = None,
        user_agent: str = None
    ) -> AuditEvent:
        """
        Log an audit event.
        
        Args:
            event_type: Type of event
            user_id: User who triggered the event
            details: Event-specific details
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Created AuditEvent
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            user_id=user_id,
            timestamp=datetime.now(),
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self._buffer.append(event)
        
        # Flush if buffer is full
        if len(self._buffer) >= self._buffer_size:
            self.flush()
        
        return event
    
    def flush(self):
        """Flush buffered events to database"""
        if self.db and self._buffer:
            # In production, this would batch insert to DB
            self._buffer = []
    
    def log_ai_generation(
        self,
        user_id: str,
        content_id: str,
        model: str,
        risk_level: str,
        blocked: bool = False
    ) -> AuditEvent:
        """Convenience method for AI generation events"""
        event_type = (
            AuditEventType.AI_GENERATION_BLOCKED if blocked 
            else AuditEventType.AI_GENERATION_COMPLETED
        )
        
        return self.log(
            event_type=event_type,
            user_id=user_id,
            details={
                "content_id": content_id,
                "model": model,
                "risk_level": risk_level,
                "blocked": blocked
            }
        )
    
    def log_moderation(
        self,
        moderator_id: str,
        queue_item_id: str,
        action: str,
        reason: str = None
    ) -> AuditEvent:
        """Convenience method for moderation events"""
        return self.log(
            event_type=AuditEventType.MODERATION_COMPLETED,
            user_id=moderator_id,
            details={
                "queue_item_id": queue_item_id,
                "action": action,
                "reason": reason
            }
        )
    
    def log_payment(
        self,
        user_id: str,
        order_id: str,
        amount: float,
        status: str,
        payment_method: str = None
    ) -> AuditEvent:
        """Convenience method for payment events"""
        event_type = {
            "pending": AuditEventType.PAYMENT_INITIATED,
            "success": AuditEventType.PAYMENT_COMPLETED,
            "failed": AuditEventType.PAYMENT_FAILED
        }.get(status, AuditEventType.PAYMENT_INITIATED)
        
        return self.log(
            event_type=event_type,
            user_id=user_id,
            details={
                "order_id": order_id,
                "amount": amount,
                "status": status,
                "payment_method": payment_method
            }
        )
    
    def get_user_events(
        self,
        user_id: str,
        event_types: List[AuditEventType] = None,
        limit: int = 100
    ) -> List[Dict]:
        """
        Get events for a specific user.
        
        In production, this queries the database.
        """
        # Placeholder - actual implementation queries DB
        return []
    
    def get_events_by_type(
        self,
        event_type: AuditEventType,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Get events of a specific type.
        
        In production, this queries the database.
        """
        # Placeholder - actual implementation queries DB
        return []


# Global logger instance
_logger = None

def get_audit_logger(db_adapter=None) -> AuditLogger:
    """Get singleton AuditLogger instance"""
    global _logger
    if _logger is None:
        _logger = AuditLogger(db_adapter)
    return _logger
