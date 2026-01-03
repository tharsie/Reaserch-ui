from __future__ import annotations

import os
from pathlib import Path


def _env_path(name: str) -> Path | None:
    val = os.getenv(name)
    if not val:
        return None
    return Path(val).expanduser().resolve()


BASE_DIR = Path(__file__).resolve().parents[1]


def get_models_dir() -> Path:
    """Return directory containing model artifacts.

    Override with env var: PADDY_MODELS_DIR
    """

    override = _env_path("PADDY_MODELS_DIR")
    if override is not None:
        return override

    candidates = [
        BASE_DIR / "models",
        BASE_DIR / "assets" / "models",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]


def get_data_dir() -> Path:
    """Return directory containing datasets.

    Override with env var: PADDY_DATA_DIR
    """

    override = _env_path("PADDY_DATA_DIR")
    if override is not None:
        return override

    candidates = [
        BASE_DIR / "data",
        BASE_DIR / "assets" / "data",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]


def get_default_dataset_path() -> Path:
    """Default CSV dataset path (overrideable via PADDY_DATASET_PATH)."""

    override = _env_path("PADDY_DATASET_PATH")
    if override is not None:
        return override
    return get_data_dir() / "paddy_price_demand_dataset.csv"
