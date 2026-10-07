from fastapi import APIRouter, Depends, status
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.ai import AITaskAnalyzeRequest, AITaskAnalyzeResponse
from app.services.ai_service import analyze_task_with_ai

router = APIRouter(prefix="/ai", tags=["AI Assistance"])

@router.post("/analyze-task", response_model=AITaskAnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_task(
    payload: AITaskAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes task context using Google Gemini API to suggest priority,
    category, a concise summary, and an actionable next step.
    
    Protects user safety: API keys remain safely guarded on the backend.
    Gracefully handles external service timeouts or missing API keys.
    """
    analysis = await analyze_task_with_ai(
        title=payload.title,
        description=payload.description or ""
    )
    return analysis
