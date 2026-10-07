import json
import logging
from typing import Optional
import httpx
from app.config import settings
from app.schemas.ai import AITaskAnalyzeResponse

logger = logging.getLogger(__name__)

VALID_PRIORITIES = {"Low", "Medium", "High", "Urgent"}

def _normalize_priority(raw_priority: Optional[str]) -> str:
    """Ensures priority is strictly one of Low, Medium, High, Urgent."""
    if not raw_priority:
        return "Medium"
    capitalized = raw_priority.strip().capitalize()
    if capitalized in VALID_PRIORITIES:
        return capitalized
    # Heuristic mapping
    lower = raw_priority.lower()
    if "urg" in lower or "crit" in lower or "block" in lower:
        return "Urgent"
    if "high" in lower or "sev" in lower or "error" in lower or "down" in lower:
        return "High"
    if "low" in lower or "minor" in lower or "trivial" in lower:
        return "Low"
    return "Medium"

def _rule_based_fallback(title: str, description: str, reason: str) -> AITaskAnalyzeResponse:
    """
    Fallback analyzer invoked when the Gemini API key is missing or the external service
    is temporarily unreachable. Ensures the application remains functional without crashing.
    """
    combined = f"{title} {description}".lower()

    # Determine priority
    if any(k in combined for k in ["urgent", "down", "critical", "crash", "blocker", "outage", "security", "vulnerability"]):
        priority = "Urgent"
    elif any(k in combined for k in ["error", "bug", "fail", "broken", "payment", "500", "loss", "timeout", "high"]):
        priority = "High"
    elif any(k in combined for k in ["minor", "typo", "cosmetic", "tweak", "low", "docs", "readme"]):
        priority = "Low"
    else:
        priority = "Medium"

    # Determine category
    if any(k in combined for k in ["bug", "error", "fail", "crash", "issue", "exception", "broken"]):
        category = "Technical Issue"
    elif any(k in combined for k in ["deploy", "docker", "server", "aws", "pipeline", "ci/cd", "db", "postgres"]):
        category = "DevOps & Infrastructure"
    elif any(k in combined for k in ["feature", "add", "implement", "create", "build", "ui", "redesign"]):
        category = "Feature Request"
    elif any(k in combined for k in ["doc", "readme", "guide", "comment"]):
        category = "Documentation"
    else:
        category = "General"

    summary = f"Address: {title.strip()}."
    if description and len(description.strip()) > 10:
        summary = f"{title.strip()} — {description.strip()[:120]}..."

    next_action = f"Reproduce and examine technical logs or requirements for '{title.strip()}'."
    if category == "Technical Issue":
        next_action = "Review server error logs and inspect recent code changes or endpoints."
    elif category == "Feature Request":
        next_action = "Draft requirement specifications and break implementation into sub-tasks."

    return AITaskAnalyzeResponse(
        priority=priority,
        category=category,
        summary=summary,
        next_action=next_action,
        source=f"Local Heuristic Fallback ({reason})"
    )

async def analyze_task_with_ai(title: str, description: str = "") -> AITaskAnalyzeResponse:
    """
    Sends the task title and description to the Google Gemini API with a controlled prompt
    requesting structured JSON with priority, category, summary, and next_action.

    Validates and normalizes the output. Gracefully falls back to heuristic analysis if the
    API key is missing or Gemini API fails.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Using rule-based fallback analyzer.")
        return _rule_based_fallback(
            title, 
            description, 
            "GEMINI_API_KEY not configured in backend .env"
        )

    # Controlled prompt requesting strict JSON schema
    prompt = f"""You are an expert AI task workflow triage assistant. Analyze this task:
Title: {title}
Description: {description if description else "None provided"}

Analyze the urgency, domain, and objective of this task.
Respond ONLY with a valid JSON object matching this exact structure:
{{
  "priority": "Low | Medium | High | Urgent",
  "category": "Technical Issue | Bug Fix | Feature Request | Documentation | DevOps | General",
  "summary": "A clear, concise one-sentence summary of the task objective (under 20 words).",
  "next_action": "A concrete, practical first action step to take to resolve or advance the task."
}}
Do NOT include markdown backticks or any explanatory text outside the JSON object."""

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    request_payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=request_payload)

        if response.status_code != 200:
            logger.error(f"Gemini API returned HTTP {response.status_code}: {response.text}")
            return _rule_based_fallback(
                title, 
                description, 
                f"Gemini API error (HTTP {response.status_code})"
            )

        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return _rule_based_fallback(title, description, "No candidate response from Gemini")

        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        if not raw_text:
            return _rule_based_fallback(title, description, "Empty text in Gemini response")

        # Parse JSON
        parsed = json.loads(raw_text.strip())
        
        priority = _normalize_priority(parsed.get("priority"))
        category = str(parsed.get("category", "General")).strip()
        summary = str(parsed.get("summary", title)).strip()
        next_action = str(parsed.get("next_action", "Review task requirements and begin implementation.")).strip()

        return AITaskAnalyzeResponse(
            priority=priority,
            category=category,
            summary=summary,
            next_action=next_action,
            source=f"Google Gemini ({settings.GEMINI_MODEL})"
        )

    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Failed to parse Gemini response: {e}")
        return _rule_based_fallback(title, description, "Failed to parse AI output into JSON")
    except httpx.RequestError as e:
        logger.error(f"Network error calling Gemini API: {e}")
        return _rule_based_fallback(title, description, f"Network timeout/connection error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in AI task analysis: {e}")
        return _rule_based_fallback(title, description, f"Unexpected error: {str(e)}")
