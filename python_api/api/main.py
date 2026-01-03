from __future__ import annotations

from fastapi import FastAPI

from python_api.api.routes.paddy_forecasting.forecasting import router as forecasting_router
from python_api.api.routes.paddy_forecasting.health import router as health_router
from python_api.api.routes.paddy_forecasting.reload import router as reload_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI-Driven Sustainable Paddy Farming System API",
        version="0.1.0",
    )

    app.include_router(health_router)
    app.include_router(forecasting_router)
    app.include_router(reload_router)
    return app


app = create_app()
