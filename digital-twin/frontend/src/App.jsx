import React, { useEffect, useRef, useState } from "react";

import Dashboard from "./components/Dashboard.jsx";
import { connectWebSocket } from "./services/websocket";

const HISTORY_LIMIT = 300;

function normalizePayload(payload) {
  if (!payload) {
    return null;
  }

  if (!payload.telemetry) {
    return payload;
  }

  return {
    ...payload.telemetry,
    ...payload.health,
    system_status: payload.system_status,
    events: payload.events || [],
    timestamp: payload.timestamp || payload.telemetry.timestamp,
    mode: payload.mode,
  };
}

export default function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [eventsPerSecond, setEventsPerSecond] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
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
      (incomingPayload, nextLatencyMs = 0) => {
        const normalizedFrame = normalizePayload(incomingPayload);

        if (!normalizedFrame) {
          return;
        }

        messageCounterRef.current += 1;
        setTotalMessages((count) => count + 1);
        setLatencyMs(nextLatencyMs);
        setData(normalizedFrame);
        setHistory((currentHistory) => {
          const nextHistory = [...currentHistory, normalizedFrame];
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
      latencyMs={latencyMs}
      totalMessages={totalMessages}
    />
  );
}
