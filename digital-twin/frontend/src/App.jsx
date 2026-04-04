import { useEffect, useState } from "react";

import { connectWebSocket } from "./services/websocket";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = connectWebSocket((incomingData) => {
      console.log(incomingData);
      setData(incomingData);
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <main>
      <h1>Digital Twin Dashboard</h1>
      <p>WebSocket: ws://localhost:8000/ws</p>
      <p>Health: {data?.health ?? "--"}</p>
      <p>Speed: {data?.speed ?? "--"}</p>
      <p>Engine Temp: {data?.engine_temp ?? "--"}</p>
      <p>Fuel Level: {data?.fuel_level ?? "--"}</p>
    </main>
  );
}
