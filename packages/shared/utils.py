"""
Shared Utilities
================
Common utility functions.
"""

import uuid
import re
from datetime import datetime, timezone
from typing import Optional


def generate_id(prefix: str = "") -> str:
    """
    Generate a unique ID with optional prefix.
    
    Args:
        prefix: Optional prefix (e.g., "user_", "result_")
        
    Returns:
        Unique ID string
    """
    unique = uuid.uuid4().hex[:12]
    return f"{prefix}{unique}" if prefix else unique


def format_datetime(dt: datetime, format_str: str = None) -> str:
    """
    Format datetime to ISO string.
    
    Args:
        dt: Datetime to format
        format_str: Optional custom format string
        
    Returns:
        Formatted datetime string
    """
    if format_str:
        return dt.strftime(format_str)
    return dt.isoformat()


def now_utc() -> datetime:
    """Get current UTC datetime"""
    return datetime.now(timezone.utc)


def sanitize_string(text: str, max_length: int = None) -> str:
    """
    Sanitize string for safe storage/display.
    
    Args:
        text: Input text
        max_length: Optional maximum length
        
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Remove null bytes
    result = text.replace('\x00', '')
    
    # Normalize whitespace
    result = ' '.join(result.split())
    
    # Truncate if needed
    if max_length and len(result) > max_length:
        result = result[:max_length-3] + "..."
    
    return result


def mask_email(email: str) -> str:
    """
    Mask email for display (e.g., j***@example.com)
    
    Args:
        email: Full email address
        
    Returns:
        Masked email
    """
    if not email or '@' not in email:
        return email
    
    local, domain = email.rsplit('@', 1)
    if len(local) <= 2:
        masked_local = local[0] + '*'
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"


def mask_pii(text: str) -> str:
    """
    Mask personally identifiable information in text.
    
    Args:
        text: Input text
        
    Returns:
        Text with PII masked
    """
    result = text
    
    # Email pattern
    result = re.sub(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        '[EMAIL]',
        result
    )
    
    # Phone pattern (various formats)
    result = re.sub(
        r'\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        '[PHONE]',
        result
    )
    
    # Indonesian phone
    result = re.sub(
        r'\b0\d{2,3}[-.\s]?\d{6,8}\b',
        '[PHONE]',
        result
    )
    
    return result


def truncate_for_logging(text: str, max_length: int = 200) -> str:
    """
    Truncate text for safe logging.
    
    Args:
        text: Input text
        max_length: Maximum length
        
    Returns:
        Truncated text with indicator
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length] + f"... [+{len(text) - max_length} chars]"


def parse_bool(value: any) -> bool:
    """
    Parse various representations of boolean.
    
    Args:
        value: Value to parse
        
    Returns:
        Boolean value
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes', 'on')
    return bool(value)


def safe_get(data: dict, *keys, default=None):
    """
    Safely get nested dictionary value.
    
    Args:
        data: Dictionary to traverse
        keys: Keys to follow
        default: Default value if not found
        
    Returns:
        Value or default
    """
    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
        else:
            return default
        if result is None:
            return default
    return result
