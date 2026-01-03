from __future__ import annotations

from datetime import date
from typing import Any, Dict, Optional

from python_api.predictor import forecast


def run_forecast(
    *,
    region: str,
    variety: str,
    horizon_days: int,
    start_date: Optional[date],
) -> Dict[str, Any]:
    return forecast(
        region=region,
        variety=variety,
        horizon_days=int(horizon_days),
        start_date=start_date,
    )
