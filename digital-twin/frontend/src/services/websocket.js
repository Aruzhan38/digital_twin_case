const WEBSOCKET_URL = "ws://127.0.0.1:8000/ws";

export function connectWebSocket(onDataCallback) {
  const socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log(`WebSocket connected: ${WEBSOCKET_URL}`);
  };

  socket.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      onDataCallback(parsedData);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
}
