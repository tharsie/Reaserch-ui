import numpy as np


def create_lstm_sequences(
    df_mm,
    feature_cols,
    target_col: str = "Paddy_Price_LKR_per_kg",
    window_size: int = 14,
):
    values = df_mm[feature_cols].values
    target = df_mm[target_col].values
    X, y = [], []
    for i in range(window_size, len(df_mm)):
        X.append(values[i - window_size : i])
        y.append(target[i])
    X = np.array(X)
    y = np.array(y)
    return X, y


def create_tabular_dataset(
    df_std,
    feature_cols,
    target_col: str = "Demand_Tons",
):
    X = df_std[feature_cols].values
    y = df_std[target_col].values
    return X, y
