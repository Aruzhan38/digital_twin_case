import { useEffect, useState } from "react";

import Dashboard from "./components/Dashboard.jsx";
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

  return <Dashboard data={data} />;
}
