const WEBSOCKET_URL = "ws://127.0.0.1:8000/ws";
const RECONNECT_DELAY_MS = 3000;

export function connectWebSocket(onDataCallback, onStatusChange) {
  let socket = null;
  let reconnectTimeoutId = null;
  let isManuallyClosed = false;

  function clearReconnectTimeout() {
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = null;
    }
  }

  function scheduleReconnect() {
    if (isManuallyClosed || reconnectTimeoutId) {
      return;
    }

    onStatusChange?.("connecting");
    reconnectTimeoutId = window.setTimeout(() => {
      reconnectTimeoutId = null;
      connect();
    }, RECONNECT_DELAY_MS);
  }

  function connect() {
    clearReconnectTimeout();
    onStatusChange?.("connecting");
    socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log(`WebSocket connected: ${WEBSOCKET_URL}`);
      onStatusChange?.("connected");
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
      onStatusChange?.("disconnected");
      scheduleReconnect();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      onStatusChange?.("disconnected");
    };
  }

  connect();

  return {
    close() {
      isManuallyClosed = true;
      clearReconnectTimeout();
      socket?.close();
    },
  };
}
