"""
Human-in-the-Loop (HITL) Moderation System
==========================================
A 3-Level Risk System for AI-powered relationship intelligence platform.

Level 1 (NORMAL): Auto-publish AI report
Level 2 (SENSITIVE): Publish with safety buffer, flag for sampling review
Level 3 (CRITICAL): Hold report, show safe response, require human review
"""

import re
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from pydantic import BaseModel

# ==================== ENUMS & CONSTANTS ====================

class RiskLevel(str, Enum):
    LEVEL_1 = "level_1"  # Normal - auto publish
    LEVEL_2 = "level_2"  # Sensitive - publish with buffer
    LEVEL_3 = "level_3"  # Critical - hold for review

class KeywordCategory(str, Enum):
    RED = "red"              # Crisis/violence/self-harm - IMMEDIATE Level 3
    YELLOW = "yellow"        # Distress/hopelessness
    WEAPONIZATION = "weaponization"  # Control/domination intent
    CLINICAL = "clinical"    # Diagnostic terms - blocked
    LABELING = "labeling"    # Demeaning labels - blocked

class ModerationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    APPROVED_WITH_BUFFER = "approved_with_buffer"
    EDITED = "edited"
    SAFE_RESPONSE_ONLY = "safe_response_only"
    ESCALATED = "escalated"

class ModerationAction(str, Enum):
    APPROVE_AS_IS = "approve_as_is"
    APPROVE_WITH_BUFFER = "approve_with_buffer"
    EDIT_OUTPUT = "edit_output"
    SAFE_RESPONSE_ONLY = "safe_response_only"
    ESCALATE = "escalate"

# ==================== RISK THRESHOLDS (CONFIGURABLE) ====================

RISK_THRESHOLDS = {
    "level_1_max": 30,      # < 30 = Level 1
    "level_2_max": 70,      # 30-69 = Level 2
    # >= 70 OR red keyword = Level 3
}

SAMPLING_RATE = 0.10  # 10% of Level 2 go to queue

# ==================== SCORING WEIGHTS ====================

SCORING_WEIGHTS = {
    "stress_flag": 25,
    "stress_markers_1_2": 10,
    "stress_markers_3_4": 20,
    "stress_markers_5_plus": 30,
    "yellow_keyword": 15,  # per occurrence, max 2
    "weaponization_keyword": 40,
    "clinical_keyword": 50,  # triggers block
    "labeling_keyword": 30,
}

# ==================== DEFAULT KEYWORDS ====================
# These are initial defaults - actual keywords should be loaded from DB

DEFAULT_KEYWORDS = {
    "red": {
        "id": [
            "bunuh diri", "mau mati", "ingin mati", "tidak ingin hidup",
            "mengakhiri hidup", "menyakiti diri", "luka diri", "potong nadi",
            "overdosis", "gantung diri", "bunuh", "membunuh", "mau bunuh",
            "kekerasan fisik", "dipukul", "diperkosa", "dilecehkan"
        ],
        "en": [
            "suicide", "kill myself", "want to die", "end my life",
            "self-harm", "cut myself", "overdose", "hang myself",
            "kill", "murder", "physical abuse", "beaten", "raped", "molested"
        ]
    },
    "yellow": {
        "id": [
            "putus asa", "tidak ada harapan", "tidak berguna", "beban",
            "sendirian", "tidak ada yang peduli", "depresi", "cemas berlebihan",
            "tidak bisa tidur", "mimpi buruk terus", "panik", "takut keluar rumah",
            "tidak mau makan", "tidak punya tenaga"
        ],
        "en": [
            "hopeless", "no hope", "worthless", "burden", "alone",
            "nobody cares", "depressed", "anxious", "can't sleep",
            "nightmares", "panic", "afraid to leave", "can't eat", "no energy"
        ]
    },
    "weaponization": {
        "id": [
            "cara mengontrol", "cara mendominasi", "cara memaksa",
            "membuat takut", "mengancam", "memeras", "manipulasi pasangan",
            "cara menang", "cara menyalahkan", "cara membungkam",
            "cara membuat patuh", "cara menghukum"
        ],
        "en": [
            "how to control", "how to dominate", "how to force",
            "make them afraid", "threaten", "blackmail", "manipulate partner",
            "how to win", "how to blame", "how to silence",
            "make them obey", "how to punish"
        ]
    },
    "clinical": {
        "id": [
            "gangguan mental", "gangguan kepribadian", "bipolar",
            "skizofrenia", "psikopat", "sosiopat", "gangguan jiwa",
            "sakit jiwa", "gila", "tidak waras", "borderline"
        ],
        "en": [
            "mental disorder", "personality disorder", "bipolar",
            "schizophrenia", "psychopath", "sociopath", "mental illness",
            "insane", "crazy", "borderline"
        ]
    },
    "labeling": {
        "id": [
            "toxic", "narsistik", "narsis", "manipulatif", "abusive",
            "pecundang", "sampah", "tidak berguna", "rusak", "cacat mental"
        ],
        "en": [
            "toxic", "narcissistic", "narcissist", "manipulative", "abusive",
            "loser", "trash", "useless", "broken", "mentally defective"
        ]
    }
}

# ==================== SAFETY MESSAGES ====================

SAFETY_BUFFER = {
    "id": """⚠️ **Catatan Keamanan**

Hasil ini bersifat reflektif untuk pengembangan diri. Jika ada bagian yang terasa memicu emosi berat:
- Beri jeda sejenak
- Tarik napas dalam-dalam
- Lanjutkan saat merasa lebih tenang

Fokus pada respons dan pilihan kata yang **bisa Anda kendalikan**. Hasil ini bukan diagnosis dan tidak menggantikan dukungan profesional.""",
    
    "en": """⚠️ **Safety Note**

This result is reflective for self-development. If any part feels emotionally triggering:
- Pause briefly
- Take deep breaths
- Continue when you feel calmer

Focus on responses and word choices **you can control**. This is not a diagnosis and does not replace professional support."""
}

SAFE_RESPONSE = {
    "id": """## Pesan Penting untuk Anda

Situasi yang Anda hadapi terdengar berat, dan kami menghargai keberanian Anda untuk mencari pemahaman.

Platform ini dirancang untuk **refleksi dan pembelajaran komunikasi**, bukan untuk menangani kondisi krisis atau situasi yang membutuhkan penanganan segera.

### Langkah yang Kami Sarankan:

1. **Prioritaskan keselamatan Anda** - Jika Anda atau seseorang dalam bahaya, hubungi layanan darurat.

2. **Pertimbangkan dukungan manusia langsung** - Bicarakan dengan:
   - Orang tepercaya di sekitar Anda
   - Konselor profesional
   - Hotline dukungan (Indonesia: 119 ext 8)

3. **Kembali saat siap** - Platform ini akan tetap tersedia ketika Anda merasa lebih stabil untuk melakukan refleksi.

Kami peduli dengan kesejahteraan Anda. Dukungan manusia langsung seringkali lebih tepat untuk situasi yang kompleks.

---
*Jika Anda merasa ini adalah kesalahan, silakan hubungi tim support kami.*""",

    "en": """## Important Message for You

What you're experiencing sounds heavy, and we appreciate your courage in seeking understanding.

This platform is designed for **reflection and communication learning**, not for handling crisis situations or circumstances requiring immediate intervention.

### Steps We Recommend:

1. **Prioritize your safety** - If you or someone is in danger, contact emergency services.

2. **Consider direct human support** - Talk to:
   - A trusted person around you
   - A professional counselor
   - Support hotline

3. **Return when ready** - This platform will remain available when you feel more stable for reflection.

We care about your wellbeing. Direct human support is often more appropriate for complex situations.

---
*If you believe this is an error, please contact our support team.*"""
}

# ==================== BLOCKED OUTPUT PATTERNS ====================

BLOCKED_PATTERNS = {
    "clinical_diagnosis": [
        r"\b(diagnos[ae]|diagnosed|gangguan|disorder)\b.*\b(mental|personality|kepribadian)\b",
        r"\b(you are|anda adalah|kamu)\b.*\b(bipolar|narcissist|psychopath|sociopath|borderline)\b",
    ],
    "absolute_statements": [
        r"\bselalu\s+(akan|pasti|harus)\b",
        r"\btidak pernah\s+(bisa|akan|mungkin)\b",
        r"\balways\s+(will|must|should)\b",
        r"\bnever\s+(can|will|could)\b",
    ],
    "blaming_language": [
        r"\b(ini semua|semuanya)\s+salah\s+(kamu|anda|dia|mereka)\b",
        r"\b(it's all|this is all)\s+(your|their|his|her)\s+fault\b",
    ],
    "aggressive_advice": [
        r"\b(konfrontasi|hadapi|tantang|lawan)\s+(langsung|segera)\b",
        r"\b(confront|challenge|fight)\s+(them|him|her)\s+(now|immediately|directly)\b",
    ]
}

# ==================== PROBABILISTIC REWRITES ====================

ABSOLUTE_TO_PROBABILISTIC = [
    (r"\bselalu\b", "cenderung"),
    (r"\btidak pernah\b", "jarang"),
    (r"\bpasti\b", "kemungkinan besar"),
    (r"\bsemua orang\b", "banyak orang"),
    (r"\balways\b", "tends to"),
    (r"\bnever\b", "rarely"),
    (r"\bdefinitely\b", "likely"),
    (r"\beveryone\b", "many people"),
]

# ==================== PYDANTIC MODELS ====================

class RiskAssessmentInput(BaseModel):
    user_id: str
    result_id: str
    series: str
    stress_flag: bool = False
    stress_markers_count: int = 0
    user_context: Optional[str] = None
    ai_output: Optional[str] = None
    language: str = "id"

class RiskAssessmentResult(BaseModel):
    assessment_id: str
    risk_score: int
    risk_level: RiskLevel
    detected_keywords: Dict[str, List[str]]
    flags: List[str]
    safety_buffer_required: bool
    requires_human_review: bool
    blocked_patterns_found: List[str]
    rewrite_applied: bool

class ModerationQueueItem(BaseModel):
    queue_id: str
    assessment_id: str
    user_id_hash: str  # Anonymized
    result_id: str
    series: str
    risk_level: RiskLevel
    risk_score: int
    detected_keywords: Dict[str, List[str]]
    original_output: str
    status: ModerationStatus
    created_at: str
    language: str

class ModerationDecision(BaseModel):
    action: ModerationAction
    moderator_notes: str
    edited_output: Optional[str] = None

# ==================== HITL ENGINE CLASS ====================

class HITLEngine:
    """Human-in-the-Loop Moderation Engine"""
    
    def __init__(self, db):
        self.db = db
        self.keywords_cache = None
        self.keywords_cache_time = None
        self.cache_ttl = 300  # 5 minutes
    
    async def get_keywords(self) -> Dict[str, Dict[str, List[str]]]:
        """Get keywords from database with caching"""
        now = datetime.now(timezone.utc)
        
        # Check cache
        if self.keywords_cache and self.keywords_cache_time:
            if (now - self.keywords_cache_time).total_seconds() < self.cache_ttl:
                return self.keywords_cache
        
        # Load from database
        keywords = {}
        cursor = self.db.risk_keywords.find({}, {"_id": 0})
        async for doc in cursor:
            category = doc.get("category")
            if category:
                keywords[category] = {
                    "id": doc.get("keywords_id", []),
                    "en": doc.get("keywords_en", [])
                }
        
        # If empty, use defaults
        if not keywords:
            keywords = DEFAULT_KEYWORDS
            # Seed database with defaults
            await self._seed_default_keywords()
        
        self.keywords_cache = keywords
        self.keywords_cache_time = now
        return keywords
    
    async def _seed_default_keywords(self):
        """Seed database with default keywords"""
        for category, langs in DEFAULT_KEYWORDS.items():
            await self.db.risk_keywords.update_one(
                {"category": category},
                {"$set": {
                    "category": category,
                    "keywords_id": langs["id"],
                    "keywords_en": langs["en"],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
    
    def _detect_keywords(
        self, 
        text: str, 
        keywords: Dict[str, Dict[str, List[str]]], 
        language: str
    ) -> Dict[str, List[str]]:
        """Detect keywords in text"""
        if not text:
            return {}
        
        text_lower = text.lower()
        detected = {}
        
        for category, langs in keywords.items():
            keyword_list = langs.get(language, []) + langs.get("en" if language == "id" else "id", [])
            found = []
            for keyword in keyword_list:
                if keyword.lower() in text_lower:
                    found.append(keyword)
            if found:
                detected[category] = found
        
        return detected
    
    def _calculate_risk_score(
        self,
        stress_flag: bool,
        stress_markers_count: int,
        detected_keywords: Dict[str, List[str]]
    ) -> Tuple[int, List[str]]:
        """Calculate risk score based on signals"""
        score = 0
        flags = []
        
        # Stress flag
        if stress_flag:
            score += SCORING_WEIGHTS["stress_flag"]
            flags.append("stress_flag_detected")
        
        # Stress markers count
        if stress_markers_count >= 5:
            score += SCORING_WEIGHTS["stress_markers_5_plus"]
            flags.append("high_stress_markers")
        elif stress_markers_count >= 3:
            score += SCORING_WEIGHTS["stress_markers_3_4"]
            flags.append("moderate_stress_markers")
        elif stress_markers_count >= 1:
            score += SCORING_WEIGHTS["stress_markers_1_2"]
            flags.append("low_stress_markers")
        
        # Yellow keywords (max 2 counted)
        yellow_count = min(len(detected_keywords.get("yellow", [])), 2)
        if yellow_count > 0:
            score += yellow_count * SCORING_WEIGHTS["yellow_keyword"]
            flags.append(f"yellow_keywords_{yellow_count}")
        
        # Weaponization keywords
        if detected_keywords.get("weaponization"):
            score += SCORING_WEIGHTS["weaponization_keyword"]
            flags.append("weaponization_detected")
        
        # Clinical keywords (should be blocked)
        if detected_keywords.get("clinical"):
            score += SCORING_WEIGHTS["clinical_keyword"]
            flags.append("clinical_terms_detected")
        
        # Labeling keywords
        if detected_keywords.get("labeling"):
            score += SCORING_WEIGHTS["labeling_keyword"]
            flags.append("labeling_detected")
        
        return score, flags
    
    def _determine_risk_level(
        self, 
        score: int, 
        detected_keywords: Dict[str, List[str]]
    ) -> RiskLevel:
        """Determine risk level based on score and keywords"""
        # Red keywords = immediate Level 3
        if detected_keywords.get("red"):
            return RiskLevel.LEVEL_3
        
        # Score-based
        if score >= RISK_THRESHOLDS["level_2_max"]:
            return RiskLevel.LEVEL_3
        elif score >= RISK_THRESHOLDS["level_1_max"]:
            return RiskLevel.LEVEL_2
        else:
            return RiskLevel.LEVEL_1
    
    def _check_blocked_patterns(self, text: str) -> List[str]:
        """Check for blocked patterns in output"""
        if not text:
            return []
        
        blocked = []
        for category, patterns in BLOCKED_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    blocked.append(f"{category}:{pattern[:30]}")
        
        return blocked
    
    def _apply_probabilistic_rewrite(self, text: str) -> Tuple[str, bool]:
        """Apply probabilistic language rewrites"""
        if not text:
            return text, False
        
        modified = text
        changed = False
        
        for pattern, replacement in ABSOLUTE_TO_PROBABILISTIC:
            new_text = re.sub(pattern, replacement, modified, flags=re.IGNORECASE)
            if new_text != modified:
                modified = new_text
                changed = True
        
        return modified, changed
    
    async def assess_risk(self, input_data: RiskAssessmentInput) -> RiskAssessmentResult:
        """Main risk assessment function"""
        keywords = await self.get_keywords()
        
        # Combine all text for analysis
        text_to_analyze = " ".join(filter(None, [
            input_data.user_context,
            input_data.ai_output
        ]))
        
        # Detect keywords
        detected_keywords = self._detect_keywords(text_to_analyze, keywords, input_data.language)
        
        # Calculate score
        score, flags = self._calculate_risk_score(
            input_data.stress_flag,
            input_data.stress_markers_count,
            detected_keywords
        )
        
        # Determine risk level
        risk_level = self._determine_risk_level(score, detected_keywords)
        
        # Check blocked patterns in AI output
        blocked_patterns = self._check_blocked_patterns(input_data.ai_output)
        if blocked_patterns:
            flags.append("blocked_patterns_found")
            # Escalate to Level 3 if blocked patterns found
            if risk_level != RiskLevel.LEVEL_3:
                risk_level = RiskLevel.LEVEL_3
                flags.append("escalated_due_to_blocked_patterns")
        
        # Check if rewrite was applied
        rewrite_applied = False
        if input_data.ai_output and risk_level == RiskLevel.LEVEL_2:
            _, rewrite_applied = self._apply_probabilistic_rewrite(input_data.ai_output)
        
        # Determine requirements
        safety_buffer_required = risk_level in [RiskLevel.LEVEL_2, RiskLevel.LEVEL_3]
        requires_human_review = risk_level == RiskLevel.LEVEL_3
        
        # For Level 2, apply sampling for human review
        if risk_level == RiskLevel.LEVEL_2:
            import random
            if random.random() < SAMPLING_RATE:
                requires_human_review = True
                flags.append("sampled_for_review")
        
        # Create assessment
        assessment_id = f"assess_{uuid.uuid4().hex[:12]}"
        
        result = RiskAssessmentResult(
            assessment_id=assessment_id,
            risk_score=score,
            risk_level=risk_level,
            detected_keywords=detected_keywords,
            flags=flags,
            safety_buffer_required=safety_buffer_required,
            requires_human_review=requires_human_review,
            blocked_patterns_found=blocked_patterns,
            rewrite_applied=rewrite_applied
        )
        
        # Store assessment in database
        await self._store_assessment(input_data, result)
        
        return result
    
    async def _store_assessment(
        self, 
        input_data: RiskAssessmentInput, 
        result: RiskAssessmentResult
    ):
        """Store risk assessment in database"""
        await self.db.risk_assessments.insert_one({
            "assessment_id": result.assessment_id,
            "user_id": input_data.user_id,
            "result_id": input_data.result_id,
            "series": input_data.series,
            "language": input_data.language,
            "risk_score": result.risk_score,
            "risk_level": result.risk_level.value,
            "detected_keywords": result.detected_keywords,
            "flags": result.flags,
            "stress_flag": input_data.stress_flag,
            "stress_markers_count": input_data.stress_markers_count,
            "safety_buffer_required": result.safety_buffer_required,
            "requires_human_review": result.requires_human_review,
            "blocked_patterns_found": result.blocked_patterns_found,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    async def create_moderation_queue_item(
        self,
        input_data: RiskAssessmentInput,
        result: RiskAssessmentResult,
        original_output: str
    ) -> str:
        """Create item in moderation queue for human review"""
        import hashlib
        
        queue_id = f"queue_{uuid.uuid4().hex[:12]}"
        user_id_hash = hashlib.sha256(input_data.user_id.encode()).hexdigest()[:16]
        
        item = {
            "queue_id": queue_id,
            "assessment_id": result.assessment_id,
            "user_id_hash": user_id_hash,
            "result_id": input_data.result_id,
            "series": input_data.series,
            "risk_level": result.risk_level.value,
            "risk_score": result.risk_score,
            "detected_keywords": result.detected_keywords,
            "flags": result.flags,
            "original_output": original_output,
            "status": ModerationStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "language": input_data.language,
            "moderator_id": None,
            "moderator_notes": None,
            "moderated_at": None,
            "final_output": None
        }
        
        await self.db.moderation_queue.insert_one(item)
        
        # Track event
        await self._track_event(
            "hitl_level3_held" if result.risk_level == RiskLevel.LEVEL_3 else "hitl_level2_flagged",
            {
                "queue_id": queue_id,
                "assessment_id": result.assessment_id,
                "risk_level": result.risk_level.value,
                "risk_score": result.risk_score
            }
        )
        
        return queue_id
    
    async def process_moderation_decision(
        self,
        queue_id: str,
        decision: ModerationDecision,
        moderator_id: str
    ) -> Dict[str, Any]:
        """Process moderator's decision"""
        item = await self.db.moderation_queue.find_one({"queue_id": queue_id})
        if not item:
            raise ValueError("Queue item not found")
        
        # Determine new status and final output
        status_map = {
            ModerationAction.APPROVE_AS_IS: ModerationStatus.APPROVED,
            ModerationAction.APPROVE_WITH_BUFFER: ModerationStatus.APPROVED_WITH_BUFFER,
            ModerationAction.EDIT_OUTPUT: ModerationStatus.EDITED,
            ModerationAction.SAFE_RESPONSE_ONLY: ModerationStatus.SAFE_RESPONSE_ONLY,
            ModerationAction.ESCALATE: ModerationStatus.ESCALATED,
        }
        
        new_status = status_map[decision.action]
        
        # Determine final output
        final_output = None
        if decision.action == ModerationAction.APPROVE_AS_IS:
            final_output = item["original_output"]
        elif decision.action == ModerationAction.APPROVE_WITH_BUFFER:
            buffer = SAFETY_BUFFER.get(item["language"], SAFETY_BUFFER["en"])
            final_output = f"{buffer}\n\n---\n\n{item['original_output']}"
        elif decision.action == ModerationAction.EDIT_OUTPUT:
            final_output = decision.edited_output
        elif decision.action == ModerationAction.SAFE_RESPONSE_ONLY:
            final_output = SAFE_RESPONSE.get(item["language"], SAFE_RESPONSE["en"])
        elif decision.action == ModerationAction.ESCALATE:
            final_output = SAFE_RESPONSE.get(item["language"], SAFE_RESPONSE["en"])
        
        # Update queue item
        await self.db.moderation_queue.update_one(
            {"queue_id": queue_id},
            {"$set": {
                "status": new_status.value,
                "moderator_id": moderator_id,
                "moderator_notes": decision.moderator_notes,
                "moderated_at": datetime.now(timezone.utc).isoformat(),
                "final_output": final_output,
                "action_taken": decision.action.value
            }}
        )
        
        # Create audit log
        await self._create_audit_log(
            queue_id=queue_id,
            action=decision.action.value,
            moderator_id=moderator_id,
            notes=decision.moderator_notes,
            original_status=item["status"],
            new_status=new_status.value
        )
        
        # Track event
        event_map = {
            ModerationAction.APPROVE_AS_IS: "hitl_moderator_approved",
            ModerationAction.APPROVE_WITH_BUFFER: "hitl_moderator_approved",
            ModerationAction.EDIT_OUTPUT: "hitl_moderator_edited",
            ModerationAction.SAFE_RESPONSE_ONLY: "hitl_safe_response_shown",
            ModerationAction.ESCALATE: "hitl_escalated",
        }
        await self._track_event(event_map[decision.action], {
            "queue_id": queue_id,
            "moderator_id": moderator_id
        })
        
        return {
            "queue_id": queue_id,
            "status": new_status.value,
            "final_output": final_output
        }
    
    async def _create_audit_log(
        self,
        queue_id: str,
        action: str,
        moderator_id: str,
        notes: str,
        original_status: str,
        new_status: str
    ):
        """Create audit log entry"""
        await self.db.audit_logs.insert_one({
            "log_id": f"log_{uuid.uuid4().hex[:12]}",
            "queue_id": queue_id,
            "action": action,
            "moderator_id": moderator_id,
            "notes": notes,
            "original_status": original_status,
            "new_status": new_status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    async def _track_event(self, event_name: str, data: Dict[str, Any]):
        """Track HITL events"""
        await self.db.hitl_events.insert_one({
            "event_id": f"evt_{uuid.uuid4().hex[:12]}",
            "event_name": event_name,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    async def get_moderation_queue(
        self,
        status: Optional[str] = None,
        risk_level: Optional[str] = None,
        series: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict]:
        """Get moderation queue items with filters"""
        query = {}
        if status:
            query["status"] = status
        if risk_level:
            query["risk_level"] = risk_level
        if series:
            query["series"] = series
        
        cursor = self.db.moderation_queue.find(
            query,
            {"_id": 0, "original_output": 0}  # Exclude large fields from list
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=limit)
    
    async def get_queue_item_detail(self, queue_id: str) -> Optional[Dict]:
        """Get full detail of a queue item"""
        return await self.db.moderation_queue.find_one(
            {"queue_id": queue_id},
            {"_id": 0}
        )
    
    async def get_audit_logs(self, queue_id: str) -> List[Dict]:
        """Get audit logs for a queue item"""
        cursor = self.db.audit_logs.find(
            {"queue_id": queue_id},
            {"_id": 0}
        ).sort("timestamp", -1)
        return await cursor.to_list(length=100)
    
    async def get_hitl_stats(self) -> Dict[str, Any]:
        """Get HITL statistics"""
        # Count by status
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = {}
        async for doc in self.db.moderation_queue.aggregate(pipeline):
            status_counts[doc["_id"]] = doc["count"]
        
        # Count by risk level
        pipeline = [
            {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
        ]
        risk_counts = {}
        async for doc in self.db.risk_assessments.aggregate(pipeline):
            risk_counts[doc["_id"]] = doc["count"]
        
        # Recent events
        recent_events = await self.db.hitl_events.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(10).to_list(length=10)
        
        return {
            "queue_by_status": status_counts,
            "assessments_by_risk": risk_counts,
            "pending_count": status_counts.get("pending", 0),
            "recent_events": recent_events
        }
    
    def get_safety_buffer(self, language: str = "id") -> str:
        """Get safety buffer text"""
        return SAFETY_BUFFER.get(language, SAFETY_BUFFER["en"])
    
    def get_safe_response(self, language: str = "id") -> str:
        """Get safe response text"""
        return SAFE_RESPONSE.get(language, SAFE_RESPONSE["en"])
    
    async def update_keywords(
        self,
        category: str,
        keywords_id: List[str],
        keywords_en: List[str]
    ):
        """Update keywords for a category"""
        await self.db.risk_keywords.update_one(
            {"category": category},
            {"$set": {
                "category": category,
                "keywords_id": keywords_id,
                "keywords_en": keywords_en,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        # Clear cache
        self.keywords_cache = None
    
    async def get_all_keywords(self) -> List[Dict]:
        """Get all keyword categories"""
        cursor = self.db.risk_keywords.find({}, {"_id": 0})
        return await cursor.to_list(length=100)


# ==================== HELPER FUNCTIONS ====================

def process_ai_output_with_hitl(
    original_output: str,
    risk_result: RiskAssessmentResult,
    language: str = "id"
) -> Tuple[str, bool]:
    """
    Process AI output based on HITL assessment.
    Returns: (processed_output, is_blocked)
    """
    # Level 3: Block and return safe response
    if risk_result.risk_level == RiskLevel.LEVEL_3:
        return SAFE_RESPONSE.get(language, SAFE_RESPONSE["en"]), True
    
    # Level 2: Add safety buffer
    if risk_result.risk_level == RiskLevel.LEVEL_2:
        buffer = SAFETY_BUFFER.get(language, SAFETY_BUFFER["en"])
        
        # Apply probabilistic rewrite if needed
        processed_output = original_output
        for pattern, replacement in ABSOLUTE_TO_PROBABILISTIC:
            processed_output = re.sub(pattern, replacement, processed_output, flags=re.IGNORECASE)
        
        return f"{buffer}\n\n---\n\n{processed_output}", False
    
    # Level 1: Return as-is
    return original_output, False
