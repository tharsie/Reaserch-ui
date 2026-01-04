import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

def _try_load(path: str):
	try:
		return joblib.load(path)
	except Exception:
		return None


clf = _try_load(os.path.join(MODEL_DIR, "fertilizer_models/fertilizer_model.pkl"))
reg = _try_load(os.path.join(MODEL_DIR, "yield_models/yield_model.pkl"))
scaler = _try_load(os.path.join(MODEL_DIR, "yield_models/scaler.pkl"))
encoders = _try_load(os.path.join(MODEL_DIR, "fertilizer_models/label_encoders.pkl"))
feature_names = _try_load(os.path.join(MODEL_DIR, "fertilizer_models/feature_names.pkl"))

MASTER_DATA = os.path.join(BASE_DIR, "Dataset.csv")
df_master = pd.read_csv(MASTER_DATA) if os.path.exists(MASTER_DATA) else None
