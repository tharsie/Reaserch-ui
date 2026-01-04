import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

clf = joblib.load(os.path.join(MODEL_DIR, "fertilizer_models/fertilizer_model.pkl"))
reg = joblib.load(os.path.join(MODEL_DIR, "yield_models/yield_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "yield_models/scaler.pkl"))
encoders = joblib.load(os.path.join(MODEL_DIR, "fertilizer_models/label_encoders.pkl"))
feature_names = joblib.load(os.path.join(MODEL_DIR, "fertilizer_models/feature_names.pkl"))

MASTER_DATA = os.path.join(BASE_DIR, "Dataset.csv")
df_master = pd.read_csv(MASTER_DATA)
