from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np


def _tomorrow() -> date:
    return date.today() + timedelta(days=1)


def _generate_farmer_recommendation(
    price_preds: List[float],
    demand_preds: List[float],
    *,
    horizon_days: int = 7,
) -> str:
    """Rule-based advice from your GRU+RF script (UI-friendly string)."""

    horizon_days = min(horizon_days, len(price_preds), len(demand_preds))
    if horizon_days <= 1:
        return "Recommendation: MONITOR market (insufficient horizon)."

    p = np.array(price_preds[:horizon_days], dtype=float)
    d = np.array(demand_preds[:horizon_days], dtype=float)

    price_change_pct = ((p[-1] - p[0]) / (p[0] + 1e-9)) * 100
    demand_change_pct = ((d[-1] - d[0]) / (d[0] + 1e-9)) * 100

    if price_change_pct <= -2:
        return "Recommendation: SELL within 1 week (price expected to drop)."
    if price_change_pct >= 2 and demand_change_pct >= 0:
        return "Recommendation: DELAY selling (price expected to rise and demand stable)."
    if demand_change_pct <= -5:
        return "Recommendation: SELL soon (demand expected to drop)."
    return "Recommendation: MONITOR market (no strong signal)."


def _add_rolling_and_seasonal(df):
    import pandas as pd

    df = df.copy()

    for window in [3, 7, 14, 21]:
        df[f"Demand_roll{window}"] = df["Demand_Tons"].rolling(window).mean()
        df[f"Price_roll{window}"] = df["Price_GRU_pred"].rolling(window).mean()
        if "Temperature_C" in df.columns:
            df[f"Temperature_roll{window}"] = df["Temperature_C"].rolling(window).mean()
        if "Rainfall_mm" in df.columns:
            df[f"Rainfall_roll{window}"] = df["Rainfall_mm"].rolling(window).mean()

    df["Demand_roll7_std"] = df["Demand_Tons"].rolling(7).std()
    df["Price_roll7_std"] = df["Price_GRU_pred"].rolling(7).std()

    date_s = pd.to_datetime(df["Date"])
    df["Month"] = date_s.dt.month
    df["Quarter"] = date_s.dt.quarter
    df["day_of_week"] = date_s.dt.dayofweek
    df["day_of_year"] = date_s.dt.dayofyear

    df["month_sin"] = np.sin(2 * np.pi * df["Month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["Month"] / 12)
    df["quarter_sin"] = np.sin(2 * np.pi * df["Quarter"] / 4)
    df["quarter_cos"] = np.cos(2 * np.pi * df["Quarter"] / 4)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    df["doy_sin"] = np.sin(2 * np.pi * df["day_of_year"] / 365)
    df["doy_cos"] = np.cos(2 * np.pi * df["day_of_year"] / 365)
    df["year_progress"] = df["day_of_year"] / 365.0
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    return df


def _add_price_momentum(df):
    df = df.copy()
    price_col = "Price_GRU_pred" if "Price_GRU_pred" in df.columns else "Paddy_Price_LKR_per_kg"
    df["price_diff_1"] = df[price_col].diff()
    df["price_diff_3"] = df[price_col].diff(3)
    df["price_diff_7"] = df[price_col].diff(7)
    df["price_momentum_3"] = df[price_col].pct_change(3)
    df["price_momentum_7"] = df[price_col].pct_change(7)
    df["price_volatility_7"] = df[price_col].rolling(7).std()
    return df


def _add_lag_features(df, target_col: str = "Demand_Tons", n_lags: int = 21):
    df = df.copy()
    for i in range(1, n_lags + 1):
        df[f"{target_col}_lag{i}"] = df[target_col].shift(i)
    return df


def _add_rolling_features(df):
    df = df.copy()
    for w in [3, 7, 14, 21]:
        df[f"Demand_roll{w}"] = df["Demand_Tons"].rolling(w).mean()
        df[f"Price_roll{w}"] = df["Price_GRU_pred"].rolling(w).mean()
    return df


@dataclass
class _Artifacts:
    gru_model: Any
    rf_model: Any
    gru_features: List[str]
    rf_features: List[str]
    window_size: int


_CACHE: Optional[_Artifacts] = None


def reset_cache() -> None:
    global _CACHE
    _CACHE = None


def _load_models(models_dir: Path) -> _Artifacts:
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    import joblib
    from tensorflow.keras.models import load_model

    # Prefer the seasonality-aware model if present; fall back to the original.
    # compile=False avoids issues when saved with different loss/metrics config.
    gru_model_path = models_dir / "gru_price_model_seasonal.h5"
    if not gru_model_path.exists():
        gru_model_path = models_dir / "gru_price_model_final.h5"

    gru_model = load_model(str(gru_model_path), compile=False)
    rf_model = joblib.load(str(models_dir / "rf_demand_model.joblib"))

    gru_cols_path = models_dir / "gru_feature_columns_seasonal.joblib"
    if not gru_cols_path.exists():
        gru_cols_path = models_dir / "gru_feature_columns.joblib"
    gru_features = joblib.load(str(gru_cols_path))
    rf_features = joblib.load(str(models_dir / "rf_feature_columns.joblib"))

    window_size = 21
    training_info_path = models_dir / "training_info_seasonal.joblib"
    if not training_info_path.exists():
        training_info_path = models_dir / "training_info.joblib"

    if training_info_path.exists():
        try:
            training_info = joblib.load(str(training_info_path))
            window_size = int(training_info.get("window_size", window_size))
        except Exception:
            window_size = window_size

    _CACHE = _Artifacts(
        gru_model=gru_model,
        rf_model=rf_model,
        gru_features=list(gru_features),
        rf_features=list(rf_features),
        window_size=window_size,
    )
    return _CACHE


def _predict_future_price_gru(
    df_mm,
    *,
    gru_model,
    gru_features: List[str],
    start_date: date,
    n_days: int,
    window_size: int,
):
    import pandas as pd

    df_work = df_mm.copy()
    df_work["Price_GRU_pred"] = df_work["Paddy_Price_LKR_per_kg"]

    # The user can choose a future start_date beyond the dataset's date range.
    # To make seasonality features meaningful for that chosen future window,
    # re-timestamp the last `window_size` rows so they end at start_date - 1.
    if "Date" in df_work.columns and len(df_work) >= window_size:
        start_ts = pd.Timestamp(start_date)
        hist_end = start_ts - pd.Timedelta(days=1)
        hist_start = hist_end - pd.Timedelta(days=window_size - 1)
        idx0 = len(df_work) - window_size
        df_work.loc[idx0:, "Date"] = pd.date_range(hist_start, hist_end, freq="D")

    # Match the script's sequence:
    # 1) engineer features once
    # 2) build current_data window
    df_work = _add_rolling_and_seasonal(df_work)
    df_work = _add_price_momentum(df_work)
    df_work.fillna(0, inplace=True)

    missing = set(gru_features) - set(df_work.columns)
    if missing:
        raise ValueError(f"Missing GRU features: {sorted(missing)}")

    current_data = df_work[gru_features].values[-window_size:]
    if current_data.shape[0] < window_size:
        raise ValueError(f"Not enough rows for window_size={window_size}.")

    preds: List[float] = []
    dates: List[date] = []
    start_ts = pd.Timestamp(start_date)

    for i in range(n_days):
        x = current_data.reshape(1, window_size, len(gru_features))
        pred_price = float(np.asarray(gru_model.predict(x, verbose=0)).reshape(-1)[0])
        preds.append(pred_price)

        d_ts = start_ts + pd.Timedelta(days=i)
        dates.append(d_ts.date())

        new_row = df_work.iloc[-1].copy()
        new_row["Date"] = d_ts
        new_row["Price_GRU_pred"] = pred_price

        df_work = pd.concat([df_work, pd.DataFrame([new_row])], ignore_index=True)
        df_work = _add_rolling_and_seasonal(df_work)
        df_work = _add_price_momentum(df_work)

        df_work.ffill(inplace=True)
        df_work.bfill(inplace=True)
        df_work.fillna(0, inplace=True)

        current_data = df_work[gru_features].values[-window_size:]

    return preds, dates


def _predict_future_demand_rf(
    df_std,
    *,
    rf_model,
    rf_features: List[str],
    price_preds: List[float],
    start_date: date,
    window_size: int,
):
    import pandas as pd

    # Use recent history window + forecast horizon
    n_days = len(price_preds)
    if n_days <= 0:
        return []

    future_df = df_std.iloc[-(window_size + n_days) :].copy()

    # Align Date for seasonality features to the selected forecast window.
    if "Date" in future_df.columns and len(future_df) == (window_size + n_days):
        start_ts = pd.Timestamp(start_date)
        hist_start = start_ts - pd.Timedelta(days=window_size)
        future_df["Date"] = pd.date_range(hist_start, periods=(window_size + n_days), freq="D")

    # Inject GRU price predictions for forecast horizon
    future_df["Price_GRU_pred"] = np.nan
    future_df.iloc[-n_days:, future_df.columns.get_loc("Price_GRU_pred")] = np.asarray(price_preds, dtype=float)

    # Feature engineering similar to your predict_gru_rf.py
    future_df = _add_lag_features(future_df, "Demand_Tons", 21)
    future_df = _add_rolling_features(future_df)
    future_df = _add_rolling_and_seasonal(future_df)
    future_df = _add_price_momentum(future_df)

    future_df = future_df.bfill().ffill().fillna(0)

    for col in rf_features:
        if col not in future_df.columns:
            future_df[col] = 0

    X = future_df[rf_features].iloc[-n_days:]
    preds = rf_model.predict(X)
    return [float(x) for x in np.asarray(preds).reshape(-1).tolist()]


def forecast(
    *,
    region: str,
    variety: str,
    horizon_days: int,
    start_date: Optional[date],
) -> Dict[str, Any]:
    """Runs GRU (price) + RandomForest (demand) and returns UI-ready JSON."""

    from .core.paths import get_default_dataset_path, get_models_dir

    models_dir = get_models_dir()
    data_path = get_default_dataset_path()

    start = start_date or _tomorrow()
    horizon_days = int(horizon_days)

    # Load dataset + preprocessing
    from .ml.load import load_dataset
    from .ml.pre_process import load_artifacts, preprocess_for_inference

    df = load_dataset(str(data_path))
    # NOTE: The original training/prediction script does not subset by region/variety.
    # We keep the full history here for stability.

    # Load trained models + feature lists
    artifacts = _load_models(models_dir)

    # If the user supplies a start date that falls within the historical dataset,
    # slice the history up to that date so the model window can change.
    # If the slice is too small for the model window, fall back to full history.
    try:
        import pandas as pd

        if start_date is not None and "Date" in df.columns:
            df_dates = pd.to_datetime(df["Date"], errors="coerce")
            mask = df_dates.dt.date < start
            df_candidate = df.loc[mask].copy()
            if len(df_candidate) >= int(artifacts.window_size):
                df = df_candidate
    except Exception:
        # If anything goes wrong, keep the original df.
        pass

    label_encoders, scalers = load_artifacts(str(models_dir))
    df_raw, df_mm, df_std = preprocess_for_inference(df, label_encoders=label_encoders, scalers=scalers)

    # Predict
    price_preds, dates = _predict_future_price_gru(
        df_mm,
        gru_model=artifacts.gru_model,
        gru_features=artifacts.gru_features,
        start_date=start,
        n_days=horizon_days,
        window_size=artifacts.window_size,
    )
    demand_preds = _predict_future_demand_rf(
        df_std,
        rf_model=artifacts.rf_model,
        rf_features=artifacts.rf_features,
        price_preds=price_preds,
        start_date=start,
        window_size=artifacts.window_size,
    )

    advice = _generate_farmer_recommendation(
        price_preds,
        demand_preds,
        horizon_days=min(7, horizon_days),
    )

    # Build response series (shape matches existing UI expectations)
    price_series = []
    demand_series = []
    for i in range(horizon_days):
        d = dates[i]
        key = f"D{i + 1}"
        price_series.append({"t": key, "date": d.isoformat(), "price": round(float(price_preds[i]), 2)})
        demand_series.append({"t": key, "date": d.isoformat(), "demand": round(float(demand_preds[i]), 2)})

    # Keep sentiment lightweight; you can replace this later.
    sentiment_score = int(np.clip(50 + (float(df_raw["Sentiment_Score"].tail(14).mean()) * 50), 0, 100)) if "Sentiment_Score" in df_raw.columns else 62

    return {
        "filters": {"region": region, "variety": variety, "horizonDays": horizon_days},
        "priceForecast": price_series,
        "demandForecast": demand_series,
        "recommendation": advice,
        "sentiment": {
            "score": sentiment_score,
            "drivers": ["Weather", "Market signals"],
            "notes": [
                {
                    "id": "s1",
                    "date": (df_raw["Date"].iloc[-1].date().isoformat() if "Date" in df_raw.columns else start.isoformat()),
                    "text": "Sentiment derived from recent scores.",
                }
            ],
        },
    }
