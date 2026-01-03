from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str


class ForecastRequest(BaseModel):
    # Keep aligned with the React UI.
    region: str = Field(default="North")
    variety: str = Field(default="BG-352")
    horizonDays: int = Field(default=30, ge=1, le=365)
    startDate: Optional[date] = Field(
        default=None,
        description="Optional. If omitted, API uses tomorrow.",
    )


