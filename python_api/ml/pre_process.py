import numpy as np
import pandas as pd
import joblib
from typing import Optional
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler


def _safe_label_transform(le: LabelEncoder, values: pd.Series) -> np.ndarray:
    # sklearn LabelEncoder doesn't support unknown classes.
    # We map unknowns to 0 (first class) to keep inference running.
    classes = set(le.classes_.tolist())
    v = values.astype(str)
    mapped = [x if x in classes else le.classes_[0] for x in v]
    return le.transform(mapped)


def preprocess_for_inference(
    df: pd.DataFrame,
    *,
    label_encoders: Optional[dict],
    scalers: Optional[dict],
):
    df = df.copy()
    df = df.sort_values("Date").reset_index(drop=True)
    df = df.ffill().fillna(df.median(numeric_only=True))

    # Apply encoders (Region, News_Sentiment)
    if label_encoders:
        for col in ["Region", "News_Sentiment"]:
            if col in df.columns and col in label_encoders:
                le = label_encoders[col]
                df[col] = _safe_label_transform(le, df[col])

    # Fit encoders if not provided (fallback)
    if not label_encoders:
        label_encoders = {}
        for col in ["Region", "News_Sentiment"]:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for t in ["Paddy_Price_LKR_per_kg", "Demand_Tons"]:
        if t in numeric_cols:
            numeric_cols.remove(t)

    # Apply scalers if provided (recommended)
    if scalers and "minmax" in scalers and "standard" in scalers:
        mm_scaler = scalers["minmax"]
        std_scaler = scalers["standard"]

        df_mm = df.copy()
        df_std = df.copy()
        df_mm[numeric_cols] = mm_scaler.transform(df_mm[numeric_cols]) if numeric_cols else df_mm[numeric_cols]
        df_std[numeric_cols] = std_scaler.transform(df_std[numeric_cols]) if numeric_cols else df_std[numeric_cols]
        return df, df_mm, df_std

    # Fallback: fit scalers on the fly
    mm_scaler = MinMaxScaler()
    std_scaler = StandardScaler()

    df_mm = df.copy()
    df_std = df.copy()

    if numeric_cols:
        df_mm[numeric_cols] = mm_scaler.fit_transform(df_mm[numeric_cols])
        df_std[numeric_cols] = std_scaler.fit_transform(df_std[numeric_cols])

    return df, df_mm, df_std


def load_artifacts(models_dir: str):
    label_encoders = None
    scalers = None

    try:
        label_encoders = joblib.load(f"{models_dir}/label_encoders.joblib")
    except Exception:
        label_encoders = None

    try:
        scalers = joblib.load(f"{models_dir}/scalers.joblib")
    except Exception:
        scalers = None

    return label_encoders, scalers
