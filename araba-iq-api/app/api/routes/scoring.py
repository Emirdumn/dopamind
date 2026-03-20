from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.scoring import FitScoreRequest, FitScoreResponse
from app.services.scoring_service import compute_fit_scores

router = APIRouter(prefix="/scoring", tags=["scoring"])


@router.post("/fit-score", response_model=FitScoreResponse)
def fit_score(payload: FitScoreRequest, db: Session = Depends(get_db)) -> FitScoreResponse:
    try:
        return compute_fit_scores(db, payload.user_preferences, payload.car_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
