from __future__ import annotations

import json
import time
from typing import Dict, Iterator, Optional

import serial
from serial.serialutil import SerialException


def read_npk_once(
    port: str = "COM7",
    baudrate: int = 115200,
    timeout: float = 1.0,
    *,
    max_wait_seconds: float = 5.0,
) -> Dict[str, float]:
    """Reads a single NPK set from a serial stream.

    Expects lines containing keywords 'Nitrogen', 'Phosphorus', 'Potassium' and values like:
    "Nitrogen: 42".
    """

    required = {
        "Nitrogen": "nitrogenN",
        "Phosphorus": "phosphorusP",
        "Potassium": "potassiumK",
    }

    values: Dict[str, float] = {}

    try:
        ser = serial.Serial(port, baudrate, timeout=timeout)
    except SerialException as e:
        raise RuntimeError(f"Cannot open serial port {port} @ {baudrate}: {e}") from e
    time.sleep(2)

    try:
        started = time.time()
        while True:
            if max_wait_seconds is not None and max_wait_seconds > 0:
                if (time.time() - started) >= max_wait_seconds:
                    raise TimeoutError(
                        "Timed out waiting for full NPK reading from serial. "
                        f"Have: {values}. Expected keys: {list(required.values())}"
                    )

            raw = ser.readline()
            if not raw:
                continue

            line = raw.decode(errors="ignore").strip()
            for key, out_key in required.items():
                if key in line and ":" in line:
                    try:
                        values[out_key] = float(line.split(":", 1)[1].strip())
                    except Exception:
                        pass

            if len(values) == len(required):
                return values
    finally:
        try:
            ser.close()
        except Exception:
            pass


def stream_npk(
    port: str = "COM7",
    baudrate: int = 115200,
    timeout: float = 1.0,
    interval: float = 0.25,
    heartbeat_interval: float = 1.0,
) -> Iterator[str]:
    """Continuously reads NPK values from serial and yields SSE events.

    Emits one event each time a full set of N/P/K values is observed.
    """

    required = {
        "Nitrogen": "nitrogenN",
        "Phosphorus": "phosphorusP",
        "Potassium": "potassiumK",
    }

    values: Dict[str, float] = {}
    last_emit_at: Optional[float] = None
    last_heartbeat_at: Optional[float] = None

    ser = None
    try:
        try:
            ser = serial.Serial(port, baudrate, timeout=timeout)
        except SerialException as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e), 'port': port, 'baudrate': baudrate})}\n\n"
            return

        time.sleep(2)

        yield f"event: ready\ndata: {json.dumps({'status': 'connected', 'port': port, 'baudrate': baudrate})}\n\n"
        last_heartbeat_at = time.time()

        while True:
            raw = ser.readline() if ser else b""
            if raw:
                line = raw.decode(errors="ignore").strip()
                for key, out_key in required.items():
                    if key in line and ":" in line:
                        try:
                            values[out_key] = float(line.split(":", 1)[1].strip())
                        except Exception:
                            pass

            now = time.time()
            if (
                heartbeat_interval is not None
                and heartbeat_interval > 0
                and (last_heartbeat_at is None or (now - last_heartbeat_at) >= heartbeat_interval)
            ):
                yield f"event: heartbeat\ndata: {json.dumps({'status': 'waiting', 'port': port, 'baudrate': baudrate, 'partial': dict(values), 'timestamp': now})}\n\n"
                last_heartbeat_at = now

            if len(values) == len(required):
                if last_emit_at is None or (now - last_emit_at) >= interval:
                    payload = {"reading": dict(values), "timestamp": now, "port": port, "baudrate": baudrate}
                    yield f"data: {json.dumps(payload)}\n\n"
                    last_emit_at = now
                    values = {}

            time.sleep(interval)
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e), 'port': port, 'baudrate': baudrate})}\n\n"
        return
    finally:
        try:
            if ser is not None:
                ser.close()
        except Exception:
            pass


def stream_serial_raw(
    port: str = "COM7",
    baudrate: int = 115200,
    timeout: float = 1.0,
    interval: float = 0.1,
    heartbeat_interval: float = 1.0,
) -> Iterator[str]:
    """Continuously streams raw serial lines as SSE events.

    Mirrors the user's SerialMonitor output style: timestamp + raw bytes + decoded text.
    """

    required = {
        "Nitrogen": "nitrogenN",
        "Phosphorus": "phosphorusP",
        "Potassium": "potassiumK",
    }

    last_npk: Dict[str, float] = {}

    ser = None
    try:
        try:
            ser = serial.Serial(port, baudrate, timeout=timeout)
        except SerialException as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e), 'port': port, 'baudrate': baudrate})}\n\n"
            return

        time.sleep(2)

        yield f"event: ready\ndata: {json.dumps({'status': 'connected', 'port': port, 'baudrate': baudrate})}\n\n"
        last_heartbeat_at: Optional[float] = time.time()

        while True:
            raw = ser.readline() if ser else b""
            if raw:
                try:
                    decoded = raw.decode("utf-8").strip()
                except UnicodeDecodeError:
                    decoded = raw.decode(errors="ignore").strip()

                # Best-effort NPK extraction from decoded text.
                for key, out_key in required.items():
                    if key in decoded and ":" in decoded:
                        try:
                            last_npk[out_key] = float(decoded.split(":", 1)[1].strip())
                        except Exception:
                            pass

                payload = {
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "port": port,
                    "baudrate": baudrate,
                    "npk": dict(last_npk) if last_npk else None,
                    "rawHex": raw.hex(),
                    "decoded": decoded,
                }
                yield f"data: {json.dumps(payload)}\n\n"

            now = time.time()
            if (
                heartbeat_interval is not None
                and heartbeat_interval > 0
                and (last_heartbeat_at is None or (now - last_heartbeat_at) >= heartbeat_interval)
            ):
                yield f"event: heartbeat\ndata: {json.dumps({'status': 'waiting', 'port': port, 'baudrate': baudrate, 'timestamp': now})}\n\n"
                last_heartbeat_at = now

            time.sleep(interval)
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e), 'port': port, 'baudrate': baudrate})}\n\n"
        return
    finally:
        try:
            if ser is not None:
                ser.close()
        except Exception:
            pass
