# python_api

This folder is the backend service for the dashboard.

## Structure

- `python_api/api/`
  - `main.py` — FastAPI app factory and `app`
  - `routes/` — endpoint modules (add new routers here)
  - `schemas.py` — request/response models
- `python_api/services/` — business logic used by routes
- `python_api/ml/` — ML helpers (preprocess/feature engineering)
- `python_api/models/` — model artifacts (`.h5`, `.joblib`)
- `python_api/data/` — datasets (CSV)
- `python_api/scripts/` — runnable scripts (training, batch jobs)

## Config

You can override paths without changing code:

- `PADDY_MODELS_DIR` — directory containing model artifacts
- `PADDY_DATA_DIR` — directory containing datasets
- `PADDY_DATASET_PATH` — full path to the CSV file

## Run API

From repo root:

- `\.venv311\Scripts\python.exe -m python_api --host 127.0.0.1 --port 8000`

## Train seasonal GRU

- `\.venv311\Scripts\python.exe -m python_api.scripts.train_gru_seasonal --epochs 60 --window-size 21`
