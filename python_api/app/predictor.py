import pandas as pd
from app.model_loader import clf, reg, scaler, encoders, feature_names, df_master

def predict_top3(sensor_data, growth_stage, purpose):
    if clf is None or reg is None or scaler is None or encoders is None or feature_names is None or df_master is None:
        raise RuntimeError(
            "Fertilizer/yield artifacts are not available. "
            "Ensure models exist under python_api/models/fertilizer_models and python_api/models/yield_models."
        )

    base = {
        "Soil_Temperature (°C)": sensor_data["soil_temp"],
        "Soil_Moisture (%)": sensor_data["soil_moisture"],
        "Air_Temperature (°C)": sensor_data["air_temp"],
        "Air_Humidity (%)": sensor_data["air_humidity"],
        "Paddy_Growth_Stage": encoders["Paddy_Growth_Stage"].transform([growth_stage])[0],
        "Purpose": encoders["Purpose"].transform([purpose])[0],
        "Quantity_kg_per_acre": 25
    }

    temp_df = pd.DataFrame([{**base, "Recommended_Fertilizer": 0}])[feature_names]
    probs = clf.predict_proba(scaler.transform(temp_df))[0]
    top3 = probs.argsort()[-3:][::-1]

    results = []
    for rank, fert_id in enumerate(top3, start=1):
        fert_name = encoders["Recommended_Fertilizer"].inverse_transform([fert_id])[0]

        row_match = df_master[df_master["Recommended_Fertilizer"] == fert_name].iloc[0]
        quantity = row_match["Quantity_kg_per_acre"]
        note = row_match["Sustainability_Note"]

        row = base.copy()
        row["Quantity_kg_per_acre"] = quantity
        row["Recommended_Fertilizer"] = fert_id

        X = pd.DataFrame([row])[feature_names]
        X_scaled = scaler.transform(X)

        yield_pred = reg.predict(X_scaled)[0]

        results.append({
            "Rank": rank,
            "Recommended Fertilizer": fert_name,
            "Quantity (kg/acre)": quantity,
            "Predicted Yield (ton/ha)": round(yield_pred, 2),
            "Confidence (%)": round(probs[fert_id] * 100, 2),
            "Sustainability Note": note
        })

    return results
