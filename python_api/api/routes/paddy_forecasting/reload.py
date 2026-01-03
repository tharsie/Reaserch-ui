from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["paddy-forecasting"])


@router.post("/api/reload")
def reload_models():
    """Clears in-process model cache so updated artifacts are picked up."""

    try:
        from python_api.predictor import reset_cache

        reset_cache()
        return {"status": "ok"}
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(e))
