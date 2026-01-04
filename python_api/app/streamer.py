import json
import time
from app.serial_reader import read_sensor_once
from app.predictor import predict_top3


def stream_generator(growth_stage, purpose, interval=2):
    """
    Generates live prediction results continuously every interval seconds.
    """
    while True:
        try:
            sensor_data = read_sensor_once()
            predictions = predict_top3(sensor_data, growth_stage, purpose)

            payload = {
                "sensor_data": sensor_data,
                "predictions": predictions,
                "timestamp": time.time(),
            }

            # SSE format: "data: ....\n\n"
            yield f"data: {json.dumps(payload)}\n\n"
        except Exception as e:
            # Don't crash the server if the serial port isn't available.
            payload = {"error": str(e), "timestamp": time.time()}
            yield f"event: error\ndata: {json.dumps(payload)}\n\n"
            time.sleep(interval)
            continue

        time.sleep(interval)
