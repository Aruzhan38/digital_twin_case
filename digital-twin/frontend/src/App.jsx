import React, { useEffect, useRef, useState } from "react";

import Dashboard from "./components/Dashboard.jsx";
import { connectWebSocket } from "./services/websocket";

const HISTORY_LIMIT = 30;

export default function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [eventsPerSecond, setEventsPerSecond] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const messageCounterRef = useRef(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setEventsPerSecond(messageCounterRef.current);
      messageCounterRef.current = 0;
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const socket = connectWebSocket(
      (incomingData) => {
        console.log(incomingData);
        messageCounterRef.current += 1;
        setTotalMessages((count) => count + 1);
        setData(incomingData);
        setHistory((currentHistory) => {
          const nextHistory = [...currentHistory, incomingData];
          return nextHistory.slice(-HISTORY_LIMIT);
        });
      },
      setConnectionStatus
    );

    return () => {
      socket.close();
    };
  }, []);

  return (
    <Dashboard
      connectionStatus={connectionStatus}
      data={data}
      eventsPerSecond={eventsPerSecond}
      history={history}
      totalMessages={totalMessages}
    />
  );
}
