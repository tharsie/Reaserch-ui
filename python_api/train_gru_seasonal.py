from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import numpy as np


def _build_feature_frame(df_mm):
    """Build the feature frame used for GRU training.

    Keeps backward-compatibility with existing inputs, and adds:
    - date/seasonality features derived from Date
    - Price_GRU_pred (lagged actual price during training)
    """

    # Import from predictor to ensure training/inference feature engineering matches.
    from .predictor import _add_price_momentum, _add_rolling_and_seasonal

    df_work = df_mm.copy()
    df_work["Price_GRU_pred"] = df_work["Paddy_Price_LKR_per_kg"]

    df_work = _add_rolling_and_seasonal(df_work)
    df_work = _add_price_momentum(df_work)

    # Training uses historical rows only; forward/back fill is fine.
    df_work = df_work.ffill().bfill().fillna(0)
    return df_work


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a GRU price model with seasonality/date features.",
    )
    parser.add_argument(
        "--data",
        default=None,
        help="Path to CSV dataset.",
    )
    parser.add_argument(
        "--models-dir",
        default=None,
        help="Directory to write trained artifacts.",
    )
    parser.add_argument("--window-size", type=int, default=21)
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    from .core.paths import get_default_dataset_path, get_models_dir

    models_dir = Path(args.models_dir) if args.models_dir else get_models_dir()
    models_dir.mkdir(parents=True, exist_ok=True)

    from tensorflow import keras

    from .ml.featureeng import create_lstm_sequences
    from .ml.load import load_dataset
    from .ml.pre_process import load_artifacts, preprocess_for_inference

    data_path = str(args.data) if args.data else str(get_default_dataset_path())
    df = load_dataset(data_path)
    label_encoders, scalers = load_artifacts(str(models_dir))
    _, df_mm, _ = preprocess_for_inference(df, label_encoders=label_encoders, scalers=scalers)

    df_feat = _build_feature_frame(df_mm)

    # Base features used by your current model:
    base_features = [
        "Region",
        "Rainfall_mm",
        "Temperature_C",
        "Sentiment_Score",
        "News_Sentiment",
    ]

    # Add date-driven features so future dates can influence predictions.
    seasonal_features = [
        "month_sin",
        "month_cos",
        "dow_sin",
        "dow_cos",
        "doy_sin",
        "doy_cos",
        "year_progress",
        "is_weekend",
    ]

    # NOTE: Do not include Price_GRU_pred as a direct input feature.
    # Including it often lets the network learn a near-identity mapping
    # (predict tomorrow == today), producing flat forecasts that do not
    # change with future dates even when seasonality features are present.
    feature_cols = base_features + seasonal_features

    missing = [c for c in feature_cols if c not in df_feat.columns]
    if missing:
        raise RuntimeError(f"Missing expected feature columns: {missing}")

    X, y = create_lstm_sequences(
        df_feat,
        feature_cols,
        target_col="Paddy_Price_LKR_per_kg",
        window_size=int(args.window_size),
    )

    if len(X) < 50:
        raise RuntimeError(
            f"Not enough sequences to train (got {len(X)}). "
            "Increase dataset size or reduce --window-size."
        )

    # Time-based split
    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]

    model = keras.Sequential(
        [
            keras.layers.Input(shape=(X.shape[1], X.shape[2])),
            keras.layers.GRU(64),
            keras.layers.Dense(32, activation="relu"),
            keras.layers.Dense(1),
        ]
    )
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=1e-3), loss="mse")

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=6,
            restore_best_weights=True,
        )
    ]

    model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=int(args.epochs),
        batch_size=int(args.batch_size),
        verbose=1,
        shuffle=False,
    )

    # Save artifacts without overwriting the existing ones.
    model_path = models_dir / "gru_price_model_seasonal.h5"
    cols_path = models_dir / "gru_feature_columns_seasonal.joblib"
    info_path = models_dir / "training_info_seasonal.joblib"

    model.save(str(model_path), include_optimizer=False)
    joblib.dump(feature_cols, str(cols_path))
    joblib.dump({"window_size": int(args.window_size), "feature_count": int(len(feature_cols))}, str(info_path))

    # Minimal training summary
    y_hat = model.predict(X_val, verbose=0).reshape(-1)
    rmse = float(np.sqrt(np.mean((y_hat - y_val.reshape(-1)) ** 2)))
    print(f"Saved: {model_path.name}, {cols_path.name}, {info_path.name}")
    print(f"Val RMSE: {rmse:.4f}")


if __name__ == "__main__":
    main()
