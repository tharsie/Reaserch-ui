from fastapi import Body, FastAPI
from pydantic import BaseModel
from app.predictor import predict_top3
from app.serial_reader import read_sensor_once
from fastapi.responses import StreamingResponse, HTMLResponse
from app.streamer import stream_generator
from fastapi import HTTPException

from api.schemas import ForecastRequest, HealthResponse
from app.pricedemand_service import forecast_price_and_demand
from app.npk_serial_reader import read_npk_once, stream_npk, stream_serial_raw
import os


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


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok")


@app.post("/api/forecasting")
def forecasting(
    req: ForecastRequest = Body(
        ...,
        examples={
            "default": {
                "summary": "Example request",
                "value": {"region": "North", "horizonDays": 7},
            }
        },
    )
):
    nitrogen_n = req.nitrogenN
    phosphorus_p = req.phosphorusP
    potassium_k = req.potassiumK

    # If UI didn't provide NPK, try reading once from the sensor.
    if nitrogen_n is None or phosphorus_p is None or potassium_k is None:
        port = os.environ.get("NPK_PORT", "COM7")
        baudrate = int(os.environ.get("NPK_BAUDRATE", "115200"))
        try:
            reading = read_npk_once(port=port, baudrate=baudrate, timeout=1.0, max_wait_seconds=5.0)
            nitrogen_n = float(reading["nitrogenN"])
            phosphorus_p = float(reading["phosphorusP"])
            potassium_k = float(reading["potassiumK"])
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=(
                    "NPK sensor reading required for this forecast but could not be obtained. "
                    "Ensure the NPK sensor is connected and no other app is using the COM port (e.g., Arduino Serial Monitor). "
                    f"Tried port={port} baudrate={baudrate}. Error: {e}"
                ),
            )

    try:
        price_forecast, demand_forecast = forecast_price_and_demand(
            region=req.region,
            horizon_days=req.horizonDays,
            start_date=req.startDate,
            nitrogen_n=nitrogen_n,
            phosphorus_p=phosphorus_p,
            potassium_k=potassium_k,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {e}")

    return {
        "filters": {
            "region": req.region,
            "horizonDays": req.horizonDays,
            "startDate": (req.startDate.isoformat() if req.startDate else None),
            "nitrogenN": nitrogen_n,
            "phosphorusP": phosphorus_p,
            "potassiumK": potassium_k,
        },
        "priceForecast": price_forecast,
        "demandForecast": demand_forecast,
        "sentiment": None,
    }


@app.get("/api/npk")
def npk(port: str = "COM7", baudrate: int = 115200):
    """Optional helper endpoint to read one NPK sample from the serial sensor."""
    try:
        reading = read_npk_once(port=port, baudrate=baudrate)
        return {"source": "serial", "port": port, "baudrate": baudrate, "reading": reading}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read NPK sensor: {e}")


@app.get("/api/npk/stream")
def npk_stream(port: str = "COM7", baudrate: int = 115200, interval: float = 0.25):
    """Streams NPK readings continuously using Server-Sent Events (SSE)."""
    try:
        return StreamingResponse(
            stream_npk(port=port, baudrate=baudrate, interval=interval),
            media_type="text/event-stream",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream NPK sensor: {e}")


@app.get("/api/npk/raw-stream")
def npk_raw_stream(port: str = "COM7", baudrate: int = 115200, interval: float = 0.1):
    """Streams raw serial lines continuously using Server-Sent Events (SSE)."""
    try:
        return StreamingResponse(
            stream_serial_raw(port=port, baudrate=baudrate, interval=interval),
            media_type="text/event-stream",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream raw serial data: {e}")


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


@app.get("/npk-page")
def npk_page():
    html_content = r"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Live NPK Serial Stream</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h2 { color: darkgreen; }
            table { border-collapse: collapse; width: 100%; margin-top: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f4f4f4; }
            .box { background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
            input { padding: 6px 8px; }
            button { padding: 6px 10px; }
            pre { background: #0b1020; color: #e6e6e6; padding: 12px; border-radius: 8px; overflow: auto; max-height: 340px; }
        </style>
    </head>
    <body>
        <h2>🌿 Live NPK Sensor Stream</h2>

        <div class="box">
            <div class="row">
                <label>Port:</label>
                <input type="text" id="port" value="COM7">

                <label>Baudrate:</label>
                <input type="number" id="baudrate" value="115200">

                <label>Interval (s):</label>
                <input type="number" id="interval" value="0.1" step="0.1" min="0.01">

                <button onclick="startStream()">Start Stream</button>
                <button onclick="stopStream()">Stop</button>
            </div>

            <div style="margin-top:10px;">
                <strong>Status:</strong> <span id="status">idle</span>
            </div>
        </div>

        <h3>🧪 Latest NPK (parsed)</h3>
        <table>
            <thead>
                <tr>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td id="nVal">-</td>
                    <td id="pVal">-</td>
                    <td id="kVal">-</td>
                    <td id="npkTs">-</td>
                </tr>
            </tbody>
        </table>

        <h3>📟 Serial Monitor (raw)</h3>
        <pre id="log"></pre>

        <script>
            let eventSource;

            function appendLog(line) {
                const el = document.getElementById('log');
                el.textContent = line + "\n" + el.textContent;
            }

            function setStatus(text) {
                document.getElementById('status').textContent = text;
            }

            function stopStream() {
                if (eventSource) {
                    eventSource.close();
                    eventSource = null;
                }
                setStatus('stopped');
            }

            function startStream() {
                const port = document.getElementById('port').value;
                const baudrate = document.getElementById('baudrate').value;
                const interval = document.getElementById('interval').value;

                stopStream();
                setStatus('connecting...');

                const url = `/api/npk/raw-stream?port=${encodeURIComponent(port)}&baudrate=${encodeURIComponent(baudrate)}&interval=${encodeURIComponent(interval)}`;
                eventSource = new EventSource(url);

                eventSource.onopen = () => setStatus('connected');
                eventSource.onerror = () => setStatus('error / disconnected');

                eventSource.addEventListener('ready', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        setStatus(`connected (${data.port} @ ${data.baudrate})`);
                        appendLog(`[READY] ${new Date().toISOString()} ${event.data}`);
                    } catch {
                        appendLog(`[READY] ${new Date().toISOString()} ${event.data}`);
                    }
                });

                eventSource.addEventListener('heartbeat', (event) => {
                    // Keep-alive info; optional to print.
                    // appendLog(`[HEARTBEAT] ${new Date().toISOString()} ${event.data}`);
                });

                eventSource.addEventListener('error', (event) => {
                    appendLog(`[ERROR] ${new Date().toISOString()} ${event.data}`);
                });

                eventSource.onmessage = (event) => {
                    let payload;
                    try {
                        payload = JSON.parse(event.data);
                    } catch {
                        appendLog(`[DATA] ${new Date().toISOString()} ${event.data}`);
                        return;
                    }

                    const ts = payload.timestamp || new Date().toISOString();
                    const rawHex = payload.rawHex || '';
                    const decoded = payload.decoded || '';

                    appendLog(
                        `Timestamp : ${ts}\n` +
                        `Raw Hex   : ${rawHex}\n` +
                        `Decoded   : ${decoded}\n` +
                        `---`
                    );

                    if (payload.npk) {
                        if (payload.npk.nitrogenN !== undefined) document.getElementById('nVal').textContent = payload.npk.nitrogenN;
                        if (payload.npk.phosphorusP !== undefined) document.getElementById('pVal').textContent = payload.npk.phosphorusP;
                        if (payload.npk.potassiumK !== undefined) document.getElementById('kVal').textContent = payload.npk.potassiumK;
                        document.getElementById('npkTs').textContent = ts;
                    }
                };
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
