from fastapi import FastAPI
from pydantic import BaseModel
from app.predictor import predict_top3
from app.serial_reader import read_sensor_once
from fastapi.responses import StreamingResponse, HTMLResponse
from app.streamer import stream_generator


app = FastAPI(title="Paddy Fertilizer Recommendation API")

# ✅ Manual JSON input request
class PredictionRequest(BaseModel):
    soil_temp: float
    soil_moisture: float
    air_temp: float
    air_humidity: float
    growth_stage: str
    purpose: str

# ✅ Live request (only stage + purpose)
class LivePredictionRequest(BaseModel):
    growth_stage: str
    purpose: str


@app.get("/")
def home():
    return {"message": "✅ API is running! Go to /docs for testing."}


# ✅ Mode 1: Manual JSON prediction
@app.post("/predict")
def predict_manual(req: PredictionRequest):
    sensor_data = {
        "soil_temp": req.soil_temp,
        "soil_moisture": req.soil_moisture,
        "air_temp": req.air_temp,
        "air_humidity": req.air_humidity
    }

    results = predict_top3(sensor_data, req.growth_stage, req.purpose)

    return {
        "mode": "manual",
        "sensor_data": sensor_data,
        "predictions": results
    }


# Mode 2: Live ESP32 prediction
@app.post("/predict-live")
def predict_live(req: LivePredictionRequest):
    sensor_data = read_sensor_once()

    results = predict_top3(sensor_data, req.growth_stage, req.purpose)

    return {
        "mode": "live",
        "sensor_data": sensor_data,
        "predictions": results
    }

@app.get("/stream-live")
def stream_live(growth_stage: str, purpose: str):
    return StreamingResponse(
        stream_generator(growth_stage, purpose),
        media_type="text/event-stream"
    )

@app.get("/stream-page")
def stream_page():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Live Fertilizer Stream</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h2 { color: darkgreen; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px;}
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f4f4f4; }
            .box { background: #f9f9f9; padding: 15px; border-radius: 8px; }
        </style>
    </head>
    <body>
        <h2>🌾 Live Sensor Based Fertilizer Recommendation</h2>

        <div class="box">
            <label>Growth Stage:</label>
            <input type="text" id="stage" value="Tillering">
            <label>Purpose:</label>
            <input type="text" id="purpose" value="Nitrogen and sulphur supply">
            <button onclick="startStream()">Start Stream</button>
        </div>

        <h3>📡 Live Sensor Data</h3>
        <pre id="sensor"></pre>

        <h3>✅ Predictions</h3>
        <table id="predTable">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Fertilizer</th>
                    <th>Quantity</th>
                    <th>Yield</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <script>
            let eventSource;

            function startStream() {
                const stage = document.getElementById("stage").value;
                const purpose = document.getElementById("purpose").value;

                if(eventSource) eventSource.close();

                eventSource = new EventSource(`/stream-live?growth_stage=${stage}&purpose=${purpose}`);

                eventSource.onmessage = function(event) {
                    const data = JSON.parse(event.data);

                    document.getElementById("sensor").textContent =
                        JSON.stringify(data.sensor_data, null, 2);

                    const tbody = document.querySelector("#predTable tbody");
                    tbody.innerHTML = "";

                    data.predictions.forEach(p => {
                        const row = `<tr>
                            <td>${p.Rank}</td>
                            <td>${p["Recommended Fertilizer"]}</td>
                            <td>${p["Quantity (kg/acre)"]}</td>
                            <td>${p["Predicted Yield (ton/ha)"]}</td>
                            <td>${p["Confidence (%)"]}</td>
                        </tr>`;
                        tbody.innerHTML += row;
                    });
                };
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
