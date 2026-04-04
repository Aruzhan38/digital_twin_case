from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from health import calculate_health
from simulator import generate_data
from storage import add_system_event, get_events, save


logger = logging.getLogger(__name__)
MODE = "normal"
_LATEST_PAYLOAD: dict[str, Any] | None = None
_PREVIOUS_STATE: dict[str, Any] = {
    "engine_temp_level": None,
    "fuel_empty": None,
    "speed_stopped": None,
}


def _stream_interval(mode: str | None = None) -> float:
    active_mode = mode or MODE
    return 0.1 if active_mode == "highload" else 1.0


def _build_event(message: str, event_type: str, timestamp: str) -> dict[str, str]:
    return {
        "message": message,
        "type": event_type,
        "timestamp": timestamp[11:19] if "T" in timestamp else timestamp,
    }


def _generate_system_events(telemetry: dict[str, Any]) -> None:
    timestamp = telemetry["timestamp"]
    fuel_level = float(telemetry.get("fuel_level", 0))
    engine_temp = float(telemetry.get("engine_temp_smoothed", telemetry.get("engine_temp", 0)))
    speed = float(telemetry.get("speed_smoothed", telemetry.get("speed", 0)))

    fuel_empty = fuel_level <= 0
    if fuel_empty and _PREVIOUS_STATE["fuel_empty"] is not True:
        add_system_event(_build_event("Топливо закончилось", "critical", timestamp))
    _PREVIOUS_STATE["fuel_empty"] = fuel_empty

    if engine_temp > 105:
        engine_temp_level = "critical"
    elif engine_temp > 95:
        engine_temp_level = "warning"
    else:
        engine_temp_level = "normal"

    previous_level = _PREVIOUS_STATE["engine_temp_level"]
    if engine_temp_level == "warning" and previous_level not in {"warning", "critical"}:
        add_system_event(_build_event("Рост температуры двигателя", "warning", timestamp))
    if engine_temp_level == "critical" and previous_level != "critical":
        add_system_event(_build_event("Критический перегрев двигателя", "critical", timestamp))
    _PREVIOUS_STATE["engine_temp_level"] = engine_temp_level

    speed_stopped = speed <= 0.5
    if speed_stopped and _PREVIOUS_STATE["speed_stopped"] is False:
        add_system_event(_build_event("Поезд остановлен", "info", timestamp))
    _PREVIOUS_STATE["speed_stopped"] = speed_stopped


def generate_payload(store: bool = True) -> dict[str, Any]:
    telemetry = generate_data()
    health_info = calculate_health(telemetry)
    _generate_system_events(telemetry)

    payload: dict[str, Any] = {
        "timestamp": telemetry["timestamp"],
        "mode": MODE,
        "telemetry": telemetry,
        "health": {
            key: value
            for key, value in health_info.items()
            if key != "system_status"
        },
        "system_status": health_info["system_status"],
        "events": get_events(limit=10),
    }

    if store:
        save(payload)

    return payload


def refresh_latest_payload(store: bool = True) -> dict[str, Any]:
    global _LATEST_PAYLOAD
    _LATEST_PAYLOAD = generate_payload(store=store)
    return _LATEST_PAYLOAD


def get_latest_payload() -> dict[str, Any] | None:
    return _LATEST_PAYLOAD


def set_mode(mode: str) -> str:
    global MODE
    MODE = mode
    logger.info("Streaming mode changed to %s", MODE)
    return MODE


def get_mode() -> str:
    return MODE


async def websocket_handler(websocket: WebSocket, load_mode: str | None = None) -> None:
    await websocket.accept()
    logger.info("WebSocket client connected")

    while True:
        active_mode = load_mode or MODE
        sleep_seconds = _stream_interval(active_mode)

        try:
            payload = get_latest_payload() or refresh_latest_payload(store=False)
            await websocket.send_json(payload)
            await asyncio.sleep(sleep_seconds)
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected")
            break
        except asyncio.CancelledError:
            logger.info("WebSocket streaming task cancelled")
            raise
        except Exception as exc:
            logger.exception("Telemetry streaming error: %s", exc)
            await asyncio.sleep(sleep_seconds)


async def handle_websocket_connection(
    websocket: WebSocket,
    load_mode: str | None = None,
) -> None:
    await websocket_handler(websocket, load_mode=load_mode)
