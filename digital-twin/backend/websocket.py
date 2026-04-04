from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from health import calculate_health
from simulator import generate_data
from storage import save


logger = logging.getLogger(__name__)
MODE = "normal"
_LATEST_PAYLOAD: dict[str, Any] | None = None


def _stream_interval(mode: str | None = None) -> float:
    active_mode = mode or MODE
    return 0.1 if active_mode == "highload" else 1.0


def generate_payload(store: bool = True) -> dict[str, Any]:
    telemetry = generate_data()
    health_info = calculate_health(telemetry)

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
