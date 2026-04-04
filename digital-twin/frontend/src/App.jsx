import React, { useEffect, useState } from "react";

import Dashboard from "./components/Dashboard.jsx";
import { connectWebSocket } from "./services/websocket";

const HISTORY_LIMIT = 30;

export default function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const socket = connectWebSocket((incomingData) => {
      console.log(incomingData);
      setData(incomingData);
      setHistory((currentHistory) => {
        const nextHistory = [...currentHistory, incomingData];
        return nextHistory.slice(-HISTORY_LIMIT);
      });
    });

    return () => {
      socket.close();
    };
  }, []);

  return <Dashboard data={data} history={history} />;
}
