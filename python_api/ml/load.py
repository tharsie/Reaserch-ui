import pandas as pd


def load_dataset(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    if "Date" not in df.columns:
        raise ValueError("Dataset must contain a 'Date' column.")

    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").reset_index(drop=True)
    return df
