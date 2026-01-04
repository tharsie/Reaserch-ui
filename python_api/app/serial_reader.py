import serial
import time

PORT = "COM3"
BAUDRATE = 115200

def read_sensor_once():
    sensor_data = {}

    ser = serial.Serial(PORT, BAUDRATE, timeout=1)
    time.sleep(2)  # Allow ESP32 to reset

    required = ["soil_temp", "soil_moisture", "air_temp", "air_humidity"]

    print("📡 Waiting for ESP32 sensor readings...")

    while True:
        raw = ser.readline()
        if not raw:
            continue

        try:
            line = raw.decode("utf-8").strip()
        except:
            continue

        print("Serial:", line)

        # Parse lines
        if "DS18B20 Temperature" in line:
            sensor_data["soil_temp"] = float(line.split(":")[1].replace("°C", "").strip())

        elif "Soil Moisture Value" in line:
            raw_value = float(line.split(":")[1].strip())
            sensor_data["soil_moisture"] = (raw_value / 4095) * 100

        elif "DHT11 Temperature" in line:
            sensor_data["air_temp"] = float(line.split(":")[1].replace("°C", "").strip())

        elif "DHT11 Humidity" in line:
            sensor_data["air_humidity"] = float(line.split(":")[1].replace("%", "").strip())

        # If we collected all required values
        if all(k in sensor_data for k in required):
            ser.close()
            return sensor_data
