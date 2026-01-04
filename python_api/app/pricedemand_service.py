from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd


@dataclass(frozen=True)
class PriceDemandArtifacts:
    lstm_model_path: str
    xgb_model_path: str
    lstm_feature_cols_path: str
    xgb_feature_cols_path: str
    scalers_path: str
    label_encoders_path: str
    training_info_path: str


def _models_dir() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "models", "PriceDemandModels")


def default_artifacts() -> PriceDemandArtifacts:
    root = _models_dir()
    return PriceDemandArtifacts(
        # Prefer .h5 for broader TensorFlow compatibility (incl. Python 3.8).
        lstm_model_path=os.path.join(root, "lstm_price_model_final.h5"),
        xgb_model_path=os.path.join(root, "xgb_demand_model_best_optimized.joblib"),
        lstm_feature_cols_path=os.path.join(root, "lstm_feature_columns.joblib"),
        xgb_feature_cols_path=os.path.join(root, "feature_columns_optimized.joblib"),
        scalers_path=os.path.join(root, "scalers.joblib"),
        label_encoders_path=os.path.join(root, "label_encoders.joblib"),
        training_info_path=os.path.join(root, "training_info.joblib"),
    )


def _load_keras_model(path: str):
    # Imported lazily so the API can still start without TensorFlow installed
    # (until the forecasting endpoint is actually called).
    from tensorflow.keras.models import load_model  # type: ignore

    if os.path.exists(path):
        return load_model(path)

    # Fallback if someone deletes/renames the .h5 but keeps the .keras
    alt = os.path.splitext(path)[0] + ".keras"
    if os.path.exists(alt):
        return load_model(alt)

    raise FileNotFoundError(f"Keras model not found. Tried: {path} and {alt}")


def _safe_date(d: Optional[date]) -> date:
    if d is not None:
        return d
    return (datetime.now() + timedelta(days=1)).date()


def load_price_demand_dataset() -> pd.DataFrame:
    """Loads the historical dataset used to seed the forecast.

    The training scripts expect a CSV with at least:
    - Date
    - Paddy_Price_LKR_per_kg
    - Demand_Tons

    You can override the path with env var PRICEDEMAND_DATASET.
    """

    env_path = os.environ.get("PRICEDEMAND_DATASET", "").strip()
    if env_path:
        dataset_path = env_path
    else:
        # Conventional local location (not currently in repo).
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dataset_path = os.path.join(base_dir, "paddy_price_demand_dataset.csv")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(
            "Price/Demand dataset CSV not found. "
            "Set env PRICEDEMAND_DATASET to the CSV path, "
            "or place it at python_api/paddy_price_demand_dataset.csv. "
            f"Tried: {dataset_path}"
        )

    df = pd.read_csv(dataset_path)
    if "Date" not in df.columns:
        raise ValueError("Dataset must contain a 'Date' column")

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"]).sort_values("Date").reset_index(drop=True)
    return df


# --- Script-compatible helpers (mirrors the user's standalone predict.py flow) ---


def load_dataset() -> pd.DataFrame:
    return load_price_demand_dataset()


def preprocess(
    df: pd.DataFrame,
    *,
    save_artifacts: bool = False,
    artifacts: Optional[PriceDemandArtifacts] = None,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """Preprocess dataset like the training/inference script.

    Returns (df_raw, df_mm, df_std, artifacts_dict).
    """

    if save_artifacts:
        # The API uses saved artifacts from disk; writing new artifacts is out of scope.
        raise ValueError("save_artifacts=True is not supported in the API runtime")

    artifacts = artifacts or default_artifacts()
    scalers = joblib.load(artifacts.scalers_path) or {}
    label_encoders = joblib.load(artifacts.label_encoders_path) or {}

    minmax = scalers.get("minmax")
    standard = scalers.get("standard")
    if minmax is None or standard is None:
        raise RuntimeError("scalers.joblib must contain 'minmax' and 'standard' scalers")

    df_raw = df.copy()
    df_raw = df_raw.sort_values("Date").reset_index(drop=True)
    df_raw = df_raw.ffill()

    df_enc = _encode_categories(df_raw, label_encoders)

    exclude_targets = ["Paddy_Price_LKR_per_kg", "Demand_Tons"]
    df_mm = _scale_numeric(df_enc, minmax, exclude_targets)
    df_std = _scale_numeric(df_enc, standard, exclude_targets)

    return df_raw, df_mm, df_std, {"scalers": scalers, "label_encoders": label_encoders}


def predict_price_future_enhanced(
    df_mm: pd.DataFrame,
    lstm: Any,
    feature_cols_lstm: List[str],
    start_date: pd.Timestamp,
    *,
    n_steps: int,
    window_size: int,
) -> Tuple[List[float], List[pd.Timestamp]]:
    # The standalone script runs feature engineering + dropna before calling this.
    df_mm = df_mm.copy()
    df_mm = _ensure_columns_zero(df_mm, list(feature_cols_lstm))
    df_mm = _fill_numeric(df_mm)

    seq = df_mm[list(feature_cols_lstm)].values[-window_size:]
    if seq.shape[0] != window_size:
        raise RuntimeError(f"Not enough history for window_size={window_size}. Have {seq.shape[0]} rows.")

    pred_dates = [start_date + pd.Timedelta(days=i) for i in range(n_steps)]

    price_preds: List[float] = []
    col_index = {c: idx for idx, c in enumerate(feature_cols_lstm)}
    for d in pred_dates:
        X = np.expand_dims(seq, axis=0)
        pred = float(np.asarray(lstm.predict(X, verbose=0)).reshape(-1)[0])
        price_preds.append(pred)

        next_row = seq[-1].copy()
        dt = d.to_pydatetime().date()
        if "Month" in col_index:
            next_row[col_index["Month"]] = dt.month
        if "Quarter" in col_index:
            next_row[col_index["Quarter"]] = (dt.month - 1) // 3 + 1
        if "day_of_week" in col_index:
            next_row[col_index["day_of_week"]] = dt.weekday()
        if "day_of_year" in col_index:
            next_row[col_index["day_of_year"]] = dt.timetuple().tm_yday
        if "month_sin" in col_index:
            next_row[col_index["month_sin"]] = np.sin(2 * np.pi * dt.month / 12)
        if "month_cos" in col_index:
            next_row[col_index["month_cos"]] = np.cos(2 * np.pi * dt.month / 12)
        if "quarter_sin" in col_index:
            q = (dt.month - 1) // 3 + 1
            next_row[col_index["quarter_sin"]] = np.sin(2 * np.pi * q / 4)
        if "quarter_cos" in col_index:
            q = (dt.month - 1) // 3 + 1
            next_row[col_index["quarter_cos"]] = np.cos(2 * np.pi * q / 4)
        if "dow_sin" in col_index:
            next_row[col_index["dow_sin"]] = np.sin(2 * np.pi * dt.weekday() / 7)
        if "dow_cos" in col_index:
            next_row[col_index["dow_cos"]] = np.cos(2 * np.pi * dt.weekday() / 7)
        if "doy_sin" in col_index:
            doy = dt.timetuple().tm_yday
            next_row[col_index["doy_sin"]] = np.sin(2 * np.pi * doy / 365)
        if "doy_cos" in col_index:
            doy = dt.timetuple().tm_yday
            next_row[col_index["doy_cos"]] = np.cos(2 * np.pi * doy / 365)
        if "year_progress" in col_index:
            next_row[col_index["year_progress"]] = dt.timetuple().tm_yday / 365.0
        if "is_weekend" in col_index:
            next_row[col_index["is_weekend"]] = 1 if dt.weekday() >= 5 else 0

        seq = np.vstack([seq[1:], next_row])

    return price_preds, pred_dates


def predict_demand_future_enhanced(
    df_std: pd.DataFrame,
    xgb: Any,
    feature_cols_xgb: List[str],
    price_preds: List[float],
    pred_dates: List[pd.Timestamp],
) -> List[float]:
    """Predict demand day-by-day using predicted prices.

    This follows the standalone script's call signature.
    """

    # The standalone script runs feature engineering + dropna before calling this.
    df_hist = df_std.copy()

    if "Demand_Tons" in df_hist.columns and len(df_hist["Demand_Tons"].dropna()):
        last_demand = float(df_hist["Demand_Tons"].dropna().iloc[-1])
    else:
        last_demand = 0.0

    preds: List[float] = []
    for dt, pred_price in zip(pred_dates, price_preds):
        # Append a new row while preserving dtypes (avoid Series->object casting).
        next_row = df_hist.tail(1).copy()
        if "Date" in next_row.columns:
            next_row.loc[next_row.index[0], "Date"] = pd.Timestamp(dt)
        if "Paddy_Price_LKR_per_kg" in next_row.columns:
            next_row.loc[next_row.index[0], "Paddy_Price_LKR_per_kg"] = float(pred_price)
        if "Demand_Tons" in next_row.columns:
            next_row.loc[next_row.index[0], "Demand_Tons"] = float(last_demand)

        df_tmp = pd.concat([df_hist, next_row], ignore_index=True)

        df_tmp = add_lag_features(df_tmp, "Demand_Tons", n_lags=21)
        df_tmp = add_rolling_and_seasonal(df_tmp)
        df_tmp = add_price_momentum(df_tmp)

        df_tmp = _ensure_columns_zero(df_tmp, list(feature_cols_xgb))
        df_tmp = _fill_numeric(df_tmp)

        X = df_tmp[list(feature_cols_xgb)].iloc[[-1]]
        pred_demand = float(np.asarray(xgb.predict(X)).reshape(-1)[0])
        preds.append(pred_demand)

        # Update history with the predicted demand so future lags/rollings evolve.
        df_hist = df_tmp.drop(columns=[c for c in df_tmp.columns if c.startswith("Demand_Tons_lag")], errors="ignore")
        last_demand = pred_demand

    return preds


def _encode_categories(df: pd.DataFrame, label_encoders: Dict[str, Any]) -> pd.DataFrame:
    def _normalize_region(raw: Any, allowed: List[str]) -> str:
        s = str(raw).strip()
        if not s:
            return allowed[0] if allowed else s

        # Exact / case-insensitive match first.
        if s in allowed:
            return s
        s_lower = s.lower()
        for a in allowed:
            if a.lower() == s_lower:
                return a

        # Simple UI-friendly mappings (the trained model uses 5 buckets).
        key = s_lower.replace("-", " ").replace("_", " ")
        key = " ".join([t for t in key.split() if t])
        mapping = {
            "north east": "East",
            "northeast": "East",
            "north west": "West",
            "northwest": "West",
            "south east": "East",
            "southeast": "East",
            "south west": "West",
            "southwest": "West",
        }
        mapped = mapping.get(key)
        if mapped and mapped in allowed:
            return mapped

        raise ValueError(f"Unsupported region '{s}'. Allowed: {', '.join(allowed)}")

    df = df.copy()
    for col, encoder in (label_encoders or {}).items():
        if col not in df.columns:
            continue

        # Keep behavior tolerant: cast to str; handle Region mapping explicitly.
        if col == "Region":
            allowed = list(getattr(encoder, "classes_", []))
            df[col] = df[col].apply(lambda v: _normalize_region(v, allowed))
        else:
            df[col] = df[col].astype(str)

        df[col] = encoder.transform(df[col])
    return df


def _scale_numeric(
    df: pd.DataFrame,
    scaler: Any,
    exclude_cols: List[str],
) -> pd.DataFrame:
    df = df.copy()
    exclude = set(exclude_cols)

    # Prefer the exact column set used during fit (sklearn stores it).
    expected = None
    try:
        expected = list(getattr(scaler, "feature_names_in_"))
    except Exception:
        expected = None

    if expected:
        cols = [c for c in expected if c in df.columns and c not in exclude]
    else:
        cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cols = [c for c in cols if c not in exclude]

    if not cols:
        return df

    df[cols] = scaler.transform(df[cols])
    return df


def add_rolling_and_seasonal(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if "Date" in df.columns:
        dt = pd.to_datetime(df["Date"], errors="coerce")
    else:
        dt = pd.Series([pd.NaT] * len(df))

    # Rolling means for demand/price (if present)
    for window in (3, 7, 14, 21):
        if "Demand_Tons" in df.columns:
            df[f"Demand_roll{window}_mean"] = df["Demand_Tons"].rolling(window).mean()
        if "Paddy_Price_LKR_per_kg" in df.columns:
            df[f"Price_roll{window}_mean"] = df["Paddy_Price_LKR_per_kg"].rolling(window).mean()

    if "Demand_Tons" in df.columns:
        df["Demand_roll7_std"] = df["Demand_Tons"].rolling(7).std()
    if "Paddy_Price_LKR_per_kg" in df.columns:
        df["Price_roll7_std"] = df["Paddy_Price_LKR_per_kg"].rolling(7).std()

    df["Month"] = dt.dt.month
    df["month_sin"] = np.sin(2 * np.pi * df["Month"].fillna(0) / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["Month"].fillna(0) / 12)

    df["Quarter"] = dt.dt.quarter
    df["quarter_sin"] = np.sin(2 * np.pi * df["Quarter"].fillna(0) / 4)
    df["quarter_cos"] = np.cos(2 * np.pi * df["Quarter"].fillna(0) / 4)

    df["day_of_week"] = dt.dt.dayofweek
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"].fillna(0) / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"].fillna(0) / 7)

    df["day_of_year"] = dt.dt.dayofyear
    df["doy_sin"] = np.sin(2 * np.pi * df["day_of_year"].fillna(0) / 365)
    df["doy_cos"] = np.cos(2 * np.pi * df["day_of_year"].fillna(0) / 365)

    df["year_progress"] = (df["day_of_year"].fillna(0) / 365.0).astype(float)
    df["is_weekend"] = (df["day_of_week"].fillna(0) >= 5).astype(int)

    return df


def add_price_momentum(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "Paddy_Price_LKR_per_kg" not in df.columns:
        return df

    df["price_diff_1"] = df["Paddy_Price_LKR_per_kg"].diff()
    df["price_diff_3"] = df["Paddy_Price_LKR_per_kg"].diff(3)
    df["price_diff_7"] = df["Paddy_Price_LKR_per_kg"].diff(7)

    df["price_momentum_3"] = df["Paddy_Price_LKR_per_kg"].pct_change(3)
    df["price_momentum_7"] = df["Paddy_Price_LKR_per_kg"].pct_change(7)

    df["price_volatility_7"] = df["Paddy_Price_LKR_per_kg"].rolling(7).std()
    return df


def add_lag_features(df: pd.DataFrame, target_col: str, n_lags: int = 21) -> pd.DataFrame:
    df = df.copy()
    if target_col not in df.columns:
        return df
    for lag in range(1, n_lags + 1):
        df[f"{target_col}_lag{lag}"] = df[target_col].shift(lag)
    return df


def _ensure_columns(df: pd.DataFrame, required: List[str]) -> pd.DataFrame:
    df = df.copy()
    for col in required:
        if col not in df.columns:
            df[col] = np.nan
    return df


def _ensure_columns_zero(df: pd.DataFrame, required: List[str]) -> pd.DataFrame:
    df = df.copy()
    for col in required:
        if col not in df.columns:
            df[col] = 0.0
    return df


def _fill_numeric(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols):
        df[numeric_cols] = df[numeric_cols].ffill().bfill()
        df[numeric_cols] = df[numeric_cols].apply(
            lambda s: s.fillna(s.mean()) if s.notna().any() else s
        )
    return df


def _build_forecast_dates(start: date, horizon_days: int) -> List[date]:
    return [start + timedelta(days=i) for i in range(horizon_days)]


def forecast_price_and_demand(
    *,
    region: str,
    horizon_days: int,
    start_date: Optional[date],
    nitrogen_n: Optional[float],
    phosphorus_p: Optional[float],
    potassium_k: Optional[float],
    artifacts: Optional[PriceDemandArtifacts] = None,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    artifacts = artifacts or default_artifacts()

    # Load artifacts (same as script)
    lstm = _load_keras_model(artifacts.lstm_model_path)
    xgb = joblib.load(artifacts.xgb_model_path)
    feature_cols_lstm = joblib.load(artifacts.lstm_feature_cols_path)
    feature_cols_xgb = joblib.load(artifacts.xgb_feature_cols_path)
    training_info = joblib.load(artifacts.training_info_path) or {}
    window_size = int(training_info.get("window_size", 21))

    # Enforce the 5 trained regions (user requirement)
    allowed_regions = ["Central", "West", "North", "South", "East"]
    if region not in allowed_regions:
        raise ValueError(f"Unsupported region '{region}'. Allowed: {', '.join(allowed_regions)}")

    # Load dataset + preprocess (same as script)
    df = load_dataset()
    if "Region" in df.columns:
        df.loc[df.index[-1], "Region"] = region

    df_raw, df_mm, df_std, _ = preprocess(df, save_artifacts=False, artifacts=artifacts)

    # Feature engineering + dropna (matches the standalone script)
    df_mm = add_rolling_and_seasonal(df_mm)
    df_mm = add_price_momentum(df_mm)
    df_mm = df_mm.dropna().reset_index(drop=True)

    df_std = add_rolling_and_seasonal(df_std)
    df_std = add_price_momentum(df_std)
    df_std = df_std.dropna().reset_index(drop=True)

    # Inject sensor values into df_mm ONLY (matches the standalone script)
    if all(c in df_mm.columns for c in ["Nitrogen_N", "Phosphorus_P", "Potassium_K"]):
        if nitrogen_n is not None and phosphorus_p is not None and potassium_k is not None:
            df_mm.loc[df_mm.index[-1], ["Nitrogen_N", "Phosphorus_P", "Potassium_K"]] = [
                float(nitrogen_n),
                float(phosphorus_p),
                float(potassium_k),
            ]

    start_ts = pd.Timestamp(_safe_date(start_date))
    price_preds, pred_dates = predict_price_future_enhanced(
        df_mm,
        lstm,
        list(feature_cols_lstm),
        start_ts,
        n_steps=int(horizon_days),
        window_size=window_size,
    )

    demand_preds = predict_demand_future_enhanced(
        df_std,
        xgb,
        list(feature_cols_xgb),
        price_preds,
        pred_dates,
    )

    price_forecast = [
        {"date": pd.Timestamp(d).date().isoformat(), "price": float(p)}
        for d, p in zip(pred_dates, price_preds)
    ]
    demand_forecast = [
        {"date": pd.Timestamp(d).date().isoformat(), "demand": float(v)}
        for d, v in zip(pred_dates, demand_preds)
    ]

    return price_forecast, demand_forecast
