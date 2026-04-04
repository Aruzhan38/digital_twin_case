export function connectWebSocket(url = "ws://localhost:8000/ws") {
  const socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    console.log("Received message:", event.data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
}
