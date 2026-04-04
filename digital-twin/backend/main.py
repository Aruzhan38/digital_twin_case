from fastapi import FastAPI, WebSocket

from storage import get_history
from websocket import websocket_handler


# Run with: uvicorn main:app --reload
app = FastAPI(title="Digital Twin Backend")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Backend is running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket_handler(websocket)


@app.get("/history")
def history() -> list:
    return get_history()
