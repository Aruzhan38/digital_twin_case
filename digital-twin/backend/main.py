from __future__ import annotations

import asyncio
import csv
import logging
from contextlib import suppress
from io import StringIO

from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from storage import get_history
from websocket import (
    get_latest_payload,
    get_mode,
    refresh_latest_payload,
    set_mode,
    websocket_handler,
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("digital-twin.backend")

app = FastAPI(title="Digital Twin Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def telemetry_producer() -> None:
    while True:
        payload = refresh_latest_payload(store=True)
        logger.info("Telemetry snapshot stored at %s", payload["timestamp"])
        await asyncio.sleep(0.1 if get_mode() == "highload" else 1.0)


@app.on_event("startup")
async def startup_event() -> None:
    refresh_latest_payload(store=True)
    app.state.telemetry_task = asyncio.create_task(telemetry_producer())
    logger.info("Background telemetry producer started")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    telemetry_task = getattr(app.state, "telemetry_task", None)
    if telemetry_task is None:
        return

    telemetry_task.cancel()
    with suppress(asyncio.CancelledError):
        await telemetry_task
    logger.info("Background telemetry producer stopped")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Backend is running"}


@app.get("/healthcheck")
def healthcheck() -> dict[str, object]:
    latest = get_latest_payload()
    return {
        "status": "ok",
        "mode": get_mode(),
        "latest_timestamp": latest["timestamp"] if latest else None,
        "history_size": len(get_history()),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket_handler(websocket)


@app.get("/history")
def history(range_minutes: int = Query(default=5, ge=1, le=10)) -> list[dict]:
    return get_history(range_minutes=range_minutes)


@app.get("/export")
def export_report(range_minutes: int = Query(default=5, ge=1, le=10)) -> Response:
    rows = get_history(range_minutes=range_minutes)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "timestamp",
        "speed",
        "engine_temp",
        "fuel_level",
        "brake_pressure",
        "voltage",
        "rpm",
        "health",
        "status",
    ])

    for row in rows:
        telemetry = row.get("telemetry", {})
        health = row.get("health", {})
        writer.writerow(
            [
                row.get("timestamp", telemetry.get("timestamp", "")),
                telemetry.get("speed", ""),
                telemetry.get("engine_temp", telemetry.get("temperature_engine", "")),
                telemetry.get("fuel_level", ""),
                telemetry.get("brake_pressure", telemetry.get("pressure_brake", "")),
                telemetry.get("voltage", ""),
                telemetry.get("rpm", ""),
                health.get("health", ""),
                health.get("status", ""),
            ]
        )

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="report.csv"'},
    )


@app.get("/mode/{mode}")
def update_mode(mode: str) -> dict[str, str]:
    if mode not in {"normal", "highload"}:
        logger.warning("Rejected mode update: %s", mode)
        return {"mode": get_mode(), "message": "Invalid mode"}

    active_mode = set_mode(mode)
    logger.info("Mode updated to %s", active_mode)
    return {"mode": active_mode, "message": f"Mode set to {active_mode}"}
