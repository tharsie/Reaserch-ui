from __future__ import annotations

from fastapi import APIRouter

from python_api.api.schemas import HealthResponse

router = APIRouter(tags=["paddy-forecasting"])


@router.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")
