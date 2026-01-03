# AI Sustainable Paddy Dashboard

React (Vite) dashboard UI + a local Python FastAPI service that serves **real forecasting** from your trained models (GRU price + RandomForest demand).

## Run the UI

1. Install frontend deps:

`npm install`

2. Start the dev server:

`npm run dev`

The UI calls `/api/*` and Vite proxies it to `http://127.0.0.1:8000` (see `vite.config.js`).

## Run the Python API (forecasting)

Prereqs:
- Windows + Python **3.11** recommended (TensorFlow 2.15 doesn’t support Python 3.8).

From the repo root:

1. Create a venv (example name):

`C:\Users\Thars\AppData\Local\Programs\Python\Python311\python.exe -m venv .venv311`

2. Install pinned deps:

`.\.venv311\Scripts\python.exe -m pip install -r python_api\requirements.txt`

3. Start the API:

`.\.venv311\Scripts\python.exe python_api\__main__.py --port 8000`

Health check:

`http://127.0.0.1:8000/api/health`

Forecast endpoint:

`POST http://127.0.0.1:8000/api/forecasting`

Body example:

`{"region":"North","variety":"BG-352","horizonDays":7}`

## Notes on pinned versions

The API pins versions in `python_api/requirements.txt` to load your saved artifacts reliably:
- `tensorflow==2.15.1` for legacy `.h5` compatibility
- `scikit-learn==1.2.1` to match the RF `.joblib` artifact
- `numpy<2` to avoid binary/ABI issues with older ML wheels
