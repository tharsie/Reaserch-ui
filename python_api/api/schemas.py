from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str


class ForecastRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            # Swagger UI typically prefers `example` for the "Example Value" block.
            # Keep it minimal as requested.
            "example": {"region": "North", "horizonDays": 7},
            "examples": [
                {"region": "North", "horizonDays": 7}
            ]
        }
    )
    # Keep aligned with the React UI.
    region: str = Field(default="North")
    horizonDays: int = Field(default=30, ge=1, le=365)
    startDate: Optional[date] = Field(
        default=None,
        description="Optional. If omitted, API uses tomorrow.",
    )

    # Optional NPK sensor readings (UI may send these).
    nitrogenN: Optional[float] = Field(default=None, description="N (sensor reading)")
    phosphorusP: Optional[float] = Field(default=None, description="P (sensor reading)")
    potassiumK: Optional[float] = Field(default=None, description="K (sensor reading)")


