"""
Safety Module
=============
Safety gates, buffers, and safe responses.
"""

from typing import Dict, Optional
from dataclasses import dataclass


# Default safe response when content is blocked
SAFE_RESPONSE = """
Thank you for sharing your thoughts and feelings. Your experiences are important, 
and we want to ensure you receive the most helpful and appropriate support.

Based on what you've shared, we recommend:

1. **Speaking with a trained professional** who can provide personalized guidance
2. **Reaching out to a trusted friend or family member** for support
3. **Contacting support services** if you need immediate help:
   - Indonesia: 119 (Mental Health Hotline)
   - International: Your local crisis helpline

Your well-being matters. Taking this step to seek understanding is a positive sign, 
and there are people ready to help you navigate these feelings.

---
*This message was generated as a safety precaution. Our team is reviewing your 
request to provide more specific guidance soon.*
"""

SAFE_RESPONSE_ID = """
Terima kasih telah berbagi pikiran dan perasaan Anda. Pengalaman Anda penting, 
dan kami ingin memastikan Anda mendapatkan dukungan yang paling membantu dan tepat.

Berdasarkan apa yang telah Anda bagikan, kami merekomendasikan:

1. **Berbicara dengan profesional terlatih** yang dapat memberikan panduan personal
2. **Menghubungi teman atau anggota keluarga yang dipercaya** untuk dukungan
3. **Menghubungi layanan dukungan** jika Anda membutuhkan bantuan segera:
   - Indonesia: 119 (Hotline Kesehatan Mental)
   - Into The Light: 021-7884-5555

Kesejahteraan Anda penting. Mengambil langkah ini untuk mencari pemahaman adalah 
tanda positif, dan ada orang-orang yang siap membantu Anda menavigasi perasaan ini.

---
*Pesan ini dihasilkan sebagai tindakan pengamanan. Tim kami sedang meninjau 
permintaan Anda untuk memberikan panduan yang lebih spesifik segera.*
"""


@dataclass
class SafetyConfig:
    """Configuration for safety settings"""
    auto_block_red_keywords: bool = True
    require_buffer_level_2: bool = True
    max_content_length: int = 10000
    min_review_time_seconds: int = 30


class SafetyBuffer:
    """
    Wraps content with safety disclaimers for Level 2 content.
    """
    
    BUFFER_HEADER_EN = """
---
**Important Notice**: The following content contains sensitive themes related 
to relationships and emotional well-being. Please read with self-care in mind.

If any part of this content feels overwhelming, please take a break or reach 
out to a trusted person for support.
---

"""

    BUFFER_HEADER_ID = """
---
**Pemberitahuan Penting**: Konten berikut mengandung tema sensitif terkait 
hubungan dan kesejahteraan emosional. Harap baca dengan memperhatikan 
perawatan diri.

Jika ada bagian dari konten ini yang terasa berat, silakan istirahat atau 
hubungi orang yang dipercaya untuk dukungan.
---

"""

    BUFFER_FOOTER_EN = """

---
**Resources**: If you need additional support, please consider:
- Speaking with a licensed counselor or therapist
- Contacting local mental health services
- Reaching out to trusted friends or family

Your mental and emotional health matters.
---
"""

    BUFFER_FOOTER_ID = """

---
**Sumber Daya**: Jika Anda membutuhkan dukungan tambahan, silakan pertimbangkan:
- Berbicara dengan konselor atau terapis berlisensi
- Menghubungi layanan kesehatan mental lokal
- Menghubungi teman atau keluarga yang dipercaya

Kesehatan mental dan emosional Anda penting.
---
"""

    def __init__(self, language: str = "en"):
        self.language = language
    
    def wrap(self, content: str, language: str = None) -> str:
        """
        Wrap content with safety buffer.
        
        Args:
            content: Original content
            language: "en" or "id"
            
        Returns:
            Content with safety header and footer
        """
        lang = language or self.language
        
        if lang == "id":
            header = self.BUFFER_HEADER_ID
            footer = self.BUFFER_FOOTER_ID
        else:
            header = self.BUFFER_HEADER_EN
            footer = self.BUFFER_FOOTER_EN
        
        return f"{header}{content}{footer}"


class SafetyGate:
    """
    Gate that controls output flow based on risk assessment.
    
    All AI outputs must pass through this gate.
    """
    
    def __init__(self, config: SafetyConfig = None):
        self.config = config or SafetyConfig()
        self.buffer = SafetyBuffer()
    
    def process(
        self,
        content: str,
        risk_level: str,
        language: str = "en"
    ) -> Dict:
        """
        Process content through safety gate.
        
        Args:
            content: AI-generated content
            risk_level: Risk level from assessment
            language: "en" or "id"
            
        Returns:
            Dict with:
                - allowed: bool
                - content: processed content or safe response
                - requires_review: bool
                - buffered: bool
        """
        from .risk_engine import RiskLevel
        
        # Level 3: Block and return safe response
        if risk_level == RiskLevel.LEVEL_3.value:
            safe_resp = SAFE_RESPONSE_ID if language == "id" else SAFE_RESPONSE
            return {
                "allowed": False,
                "content": safe_resp,
                "requires_review": True,
                "buffered": False,
                "reason": "Level 3 risk detected - human review required"
            }
        
        # Level 2: Allow with safety buffer
        if risk_level == RiskLevel.LEVEL_2.value:
            buffered_content = self.buffer.wrap(content, language)
            return {
                "allowed": True,
                "content": buffered_content,
                "requires_review": False,
                "buffered": True,
                "reason": "Level 2 risk - safety buffer applied"
            }
        
        # Level 1: Allow as-is
        return {
            "allowed": True,
            "content": content,
            "requires_review": False,
            "buffered": False,
            "reason": "Level 1 - auto-approved"
        }
    
    def get_safe_response(self, language: str = "en") -> str:
        """Get safe response for the specified language"""
        return SAFE_RESPONSE_ID if language == "id" else SAFE_RESPONSE


def create_safety_gate(config: SafetyConfig = None) -> SafetyGate:
    """Factory function to create SafetyGate"""
    return SafetyGate(config)
