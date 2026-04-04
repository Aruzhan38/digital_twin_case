import asyncio
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from health import calculate_health
from simulator import generate_data
from storage import save


logger = logging.getLogger(__name__)


async def websocket_handler(websocket: WebSocket, load_mode: str = "normal") -> None:
    await websocket.accept()

    sleep_seconds = 0.1 if load_mode == "highload" else 1.0

    while True:
        try:
            telemetry = generate_data()
            health_info = calculate_health(telemetry)

            payload: dict[str, Any] = {
                **telemetry,
                **health_info,
            }

            save(payload)
            await websocket.send_json(payload)
            await asyncio.sleep(sleep_seconds)
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected")
            break
        except Exception as exc:
            logger.exception("Telemetry streaming error: %s", exc)
            await asyncio.sleep(sleep_seconds)


async def handle_websocket_connection(
    websocket: WebSocket,
    load_mode: str = "normal",
) -> None:
    await websocket_handler(websocket, load_mode=load_mode)
