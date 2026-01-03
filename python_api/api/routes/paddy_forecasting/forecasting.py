from __future__ import annotations

from fastapi import APIRouter, HTTPException

from python_api.api.schemas import ForecastRequest
from python_api.services.forecasting_service import run_forecast

router = APIRouter(tags=["paddy-forecasting"])


@router.post("/api/forecasting")
def forecasting(req: ForecastRequest):
    try:
        return run_forecast(
            region=req.region,
            variety=req.variety,
            horizon_days=req.horizonDays,
            start_date=req.startDate,
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Model/artifact file not found. Place your .h5/.joblib files under python_api/models/ "
                "(or update predictor paths). "
                f"Missing: {e}"
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
