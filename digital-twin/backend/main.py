import asyncio
from contextlib import suppress

from fastapi import FastAPI, WebSocket

from storage import get_history
from websocket import generate_payload, websocket_handler


# Run with: uvicorn main:app --reload
app = FastAPI(title="Digital Twin Backend")


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
