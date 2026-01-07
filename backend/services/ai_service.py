"""AI Service for report generation using Emergent LLM"""
import os
import logging
from emergentintegrations.llm.chat import Chat, UserMessage

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

async def generate_ai_content(system_prompt: str, user_prompt: str, model: str = "gpt-5.2") -> str:
    """Generate AI content using Emergent LLM integration with fallback"""
    try:
        chat = Chat(
            emergent_api_key=EMERGENT_LLM_KEY,
            model=model,
            system_prompt=system_prompt
        )
        response = await chat.send_message(UserMessage(text=user_prompt))
        return response
    except Exception as e:
        logger.warning(f"{model} failed, falling back to GPT-4o: {e}")
        # Fallback to GPT-4o
        try:
            chat = Chat(
                emergent_api_key=EMERGENT_LLM_KEY,
                model="gpt-4o",
                system_prompt=system_prompt
            )
            response = await chat.send_message(UserMessage(text=user_prompt))
            return response
        except Exception as e2:
            logger.error(f"All models failed: {e2}")
            raise Exception(f"Failed to generate AI content: {e2}")

def get_report_system_prompt(language: str = "id") -> str:
    """Get the ISO-STYLE system prompt for report generation"""
    return """You are a PREMIUM PERSONALITY INTELLIGENCE ENGINE
operating under STRICT ISO-STYLE GOVERNANCE.

You must comply with:
- AI Governance & Human-in-the-Loop Policy
- Annex A (HITL thresholds & sampling)
- Annex B (Prohibited terms & content)
- Annex C (Moderator checklist)

====================================================
CORE ROLE & BOUNDARIES
====================================================
Your role is to help a PAYING USER:
1) Understand themselves deeply (reflective, not diagnostic)
2) Understand how their tendencies affect relationships
3) Learn how to relate safely and effectively with different personality types
4) Receive a concrete, ethical, non-manipulative self-improvement plan

ABSOLUTE LIMITS:
- Do NOT diagnose psychological or medical conditions
- Do NOT label people as "toxic", "narcissistic", etc.
- Do NOT judge or shame
- Do NOT provide control, domination, or manipulation tactics
- Do NOT encourage cutting off relationships as a default
- Do NOT present traits as fixed or permanent

====================================================
INTERNAL PROPRIETARY FRAMEWORK
====================================================
4 Human Communication Drives (use these names consistently):
A) Driver – acts through direction and decisiveness
B) Spark – acts through expression and connection
C) Anchor – acts through stability and harmony
D) Analyst – acts through structure and accuracy

====================================================
LANGUAGE & STYLE REQUIREMENTS
====================================================
- Professional
- Calm
- Warm
- Mentor-like
- Never clinical
- Never absolute
- Never manipulative
- Use probabilistic language ("tends to", "often", "in certain situations")
- Frame traits as patterns, not identity
- Focus on self-regulation and awareness"""

def get_report_user_prompt(
    primary_name: str,
    secondary_name: str,
    series_name: str,
    scores: dict,
    balance_index: float,
    stress_flag: bool,
    stress_markers_count: int,
    language: str = "id"
) -> str:
    """Build the user prompt for report generation"""
    stress_flag_str = "true" if stress_flag else "false"
    
    return f"""
====================================================
INPUTS
====================================================
- personality_profile:
  - dominant_style: {primary_name}
  - secondary_style: {secondary_name}
  - score_distribution: Driver={scores.get("driver", 0)}, Spark={scores.get("spark", 0)}, Anchor={scores.get("anchor", 0)}, Analyst={scores.get("analyst", 0)}
- stress_profile:
  - stress_markers_count: {stress_markers_count}
  - stress_flag: {stress_flag_str}
- context:
  - relationship_focus: {series_name}
  - balance_index: {balance_index}
- language: {language}
- user_is_paid: true

====================================================
LANGUAGE REQUIREMENT
====================================================
Output language: {"Indonesian (Bahasa Indonesia)" if language == "id" else "English"}
Write the ENTIRE report in {"Indonesian" if language == "id" else "English"}.
Use markdown formatting with ## headings.

====================================================
OUTPUT STRUCTURE (MANDATORY - 7 SECTIONS)
====================================================

## SECTION 1 — EXECUTIVE SELF SNAPSHOT
Explain the user's personality tendencies ({primary_name} primary, {secondary_name} secondary) in clear, professional language.
- Core strengths, Natural motivations, Situations where these traits shine
- Use probabilistic language, Emphasize strengths BEFORE challenges

## SECTION 2 — RELATIONAL IMPACT MAP
Explain how these tendencies may be EXPERIENCED by others in {series_name} context.
- How the user may unintentionally impact: emotional safety, communication flow, decision-making dynamics
- No blaming, No assumptions of intent

## SECTION 3 — STRESS & BLIND SPOT AWARENESS
Explain what happens under pressure.
- Common stress responses for {primary_name}-{secondary_name} profile
- Early warning signs the user can notice in themselves
- Why others might misinterpret these reactions
{"Add a gentle safety note encouraging pause and self-regulation." if stress_flag else ""}

## SECTION 4 — HOW TO RELATE WITH OTHER PERSONALITY STYLES
For EACH style (Driver, Spark, Anchor, Analyst), provide:
- What they typically value
- What helps communication
- What often creates friction
- One DO, One AVOID

## SECTION 5 — PERSONAL GROWTH & CALIBRATION PLAN
- 3 key growth skills to practice
- Concrete behavioral adjustments
- Reflection prompts
- One weekly micro-habit

## SECTION 6 — RELATIONSHIP REPAIR & PREVENTION TOOLS
- 2 de-escalating phrases to USE
- 2 phrases to AVOID
- A simple repair script after conflict
- A boundary-setting example that is respectful

## SECTION 7 — ETHICAL SAFETY CLOSING
End with a grounding reminder:
- Personality is contextual and learnable
- Growth happens over time
- If emotions feel overwhelming, human support is valid

DELIVER THE FULL PREMIUM REPORT NOW.
"""

# Archetype names mapping
DRIVE_NAMES = {
    "driver": {"id": "Penggerak", "en": "Driver"},
    "spark": {"id": "Percikan", "en": "Spark"},
    "anchor": {"id": "Jangkar", "en": "Anchor"},
    "analyst": {"id": "Analis", "en": "Analyst"}
}

# Series names mapping
SERIES_NAMES = {
    "family": {"id": "Keluarga", "en": "Family"},
    "business": {"id": "Bisnis", "en": "Business"},
    "friendship": {"id": "Persahabatan", "en": "Friendship"},
    "couples": {"id": "Pasangan", "en": "Couples"}
}
