import asyncio
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from health import calculate_health
from simulator import generate_data
from storage import save


logger = logging.getLogger(__name__)
MODE = "normal"


def generate_payload() -> dict[str, Any]:
    telemetry = generate_data()
    health_info = calculate_health(telemetry)

    payload: dict[str, Any] = {
        **telemetry,
        **health_info,
    }

    print(f"[generator] generated telemetry at {payload['timestamp']}")
    save(payload)
    return payload


def set_mode(mode: str) -> str:
    global MODE
    MODE = mode
    return MODE


def get_mode() -> str:
    return MODE


async def websocket_handler(websocket: WebSocket, load_mode: str | None = None) -> None:
    await websocket.accept()
    print("[websocket] client connected")

    while True:
        try:
            active_mode = load_mode or MODE
            sleep_seconds = 0.1 if active_mode == "highload" else 1.0
            payload = generate_payload()
            await websocket.send_json(payload)
            print(f"[websocket] streamed telemetry at {payload['timestamp']}")
            await asyncio.sleep(sleep_seconds)
        except WebSocketDisconnect:
            print("[websocket] client disconnected")
            logger.info("WebSocket client disconnected")
            break
        except asyncio.CancelledError:
            print("[websocket] streaming task cancelled")
            raise
        except Exception as exc:
            logger.exception("Telemetry streaming error: %s", exc)
            await asyncio.sleep(sleep_seconds)


async def handle_websocket_connection(
    websocket: WebSocket,
    load_mode: str | None = None,
) -> None:
    await websocket_handler(websocket, load_mode=load_mode)
