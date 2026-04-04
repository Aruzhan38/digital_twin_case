import asyncio
import csv
from contextlib import suppress
from io import StringIO

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from storage import get_history
from websocket import generate_payload, get_mode, set_mode, websocket_handler


# Run with: uvicorn main:app --reload
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
        payload = generate_payload()
        print(f"[background] stored telemetry at {payload['timestamp']}")
        await asyncio.sleep(1.0)


@app.on_event("startup")
async def startup_event() -> None:
    app.state.telemetry_task = asyncio.create_task(telemetry_producer())
    print("[startup] background telemetry producer started")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    telemetry_task = getattr(app.state, "telemetry_task", None)
    if telemetry_task is None:
        return

    telemetry_task.cancel()
    with suppress(asyncio.CancelledError):
        await telemetry_task
    print("[shutdown] background telemetry producer stopped")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Backend is running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket_handler(websocket)


@app.get("/history")
def history() -> list:
    return get_history()


@app.get("/export")
def export_report() -> Response:
    rows = get_history()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["timestamp", "speed", "engine_temp", "fuel_level", "health", "status"])

    for row in rows:
        writer.writerow(
            [
                row.get("timestamp", ""),
                row.get("speed", ""),
                row.get("engine_temp", ""),
                row.get("fuel_level", ""),
                row.get("health", ""),
                row.get("status", ""),
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
        return {"mode": get_mode(), "message": "Invalid mode"}

    active_mode = set_mode(mode)
    return {"mode": active_mode, "message": f"Mode set to {active_mode}"}
