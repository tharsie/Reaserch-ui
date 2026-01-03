# Paddy Forecasting Part

This folder represents *your* part of the backend.

- API routes live in `python_api/api/routes/paddy_forecasting/`
- ML logic lives in `python_api/predictor.py` and `python_api/ml/`
- Model artifacts are currently in `python_api/models/`
- Dataset is currently in `python_api/data/`

As other teams add parts, they should create their own folders under:
- `python_api/api/routes/<their_part>/`
- `python_api/services/<their_part>_service.py` (or a dedicated folder)

If later you want to physically move models/data into this part, the path resolver in `python_api/core/paths.py` can be extended to look under `python_api/parts/paddy_forecasting/assets/...`.
