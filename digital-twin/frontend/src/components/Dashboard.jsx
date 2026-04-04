import React, { useMemo, useState } from "react";

import Alerts from "./Alerts.jsx";
import Charts from "./Charts.jsx";
import ConnectionStatus from "./ConnectionStatus.jsx";
import ExportButton from "./ExportButton.jsx";
import HealthFactors from "./HealthFactors.jsx";
import HealthIndex from "./HealthIndex.jsx";
import LoadControl from "./LoadControl.jsx";
import MiniMap from "./MiniMap.jsx";
import Recommendations from "./Recommendations.jsx";
import Replay from "./Replay.jsx";
import SystemStatus from "./SystemStatus.jsx";

export default function Dashboard({
  connectionStatus,
  data,
  eventsPerSecond,
  history,
  totalMessages,
}) {
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [mode, setMode] = useState("normal");
  const [modeLoading, setModeLoading] = useState(false);
  const [replayData, setReplayData] = useState([]);
  const [replayFrame, setReplayFrame] = useState(null);

  const chartData = useMemo(() => {
    if (isReplayMode) {
      return replayData.slice(-30);
    }

    return history;
  }, [history, isReplayMode, replayData]);

  const activeData = isReplayMode ? replayFrame : data;

  if (!activeData) {
    return (
      <section style={styles.emptyState}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Digital Twin Dashboard</h1>
          <ConnectionStatus status={connectionStatus} />
        </div>
        {connectionStatus === "disconnected" ? (
          <p style={styles.connectionWarning}>No connection to server</p>
        ) : null}
        {isReplayMode ? <p style={styles.replayTag}>Replay Mode</p> : null}
        <p style={styles.emptyText}>Waiting for data...</p>
      </section>
    );
  }

  const {
    health,
    status,
    speed,
    engine_temp: engineTemp,
    fuel_level: fuelLevel,
    alert_groups: alertGroups,
    factors,
    rpm,
    recommendations,
    system_status: systemStatus,
  } = activeData;

  return (
    <section style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.title}>Digital Twin Dashboard</h1>
        <div style={styles.topActions}>
          <ExportButton />
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>
      {connectionStatus === "disconnected" ? (
        <p style={styles.connectionWarning}>No connection to server</p>
      ) : null}
      {isReplayMode ? <p style={styles.replayTag}>Replay Mode</p> : null}
      <HealthIndex health={health} status={status} />
      <LoadControl
        eventsPerSecond={eventsPerSecond}
        mode={mode}
        modeLoading={modeLoading}
        onModeRequest={(nextMode) => {
          setModeLoading(true);
          setMode(nextMode);
        }}
        onModeResolved={(nextMode) => {
          setMode(nextMode);
          setModeLoading(false);
        }}
        totalMessages={totalMessages}
      />
      <MiniMap speed={speed} timestamp={activeData.timestamp} />
      <SystemStatus systemStatus={systemStatus} />
      <Alerts alertGroups={alertGroups} />
      <HealthFactors factors={factors} />

      <div style={styles.telemetryGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Speed</p>
          <p style={styles.metricValue}>{speed}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Engine Temp</p>
          <p style={styles.metricValue}>{engineTemp}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Fuel Level</p>
          <p style={styles.metricValue}>{fuelLevel}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>RPM</p>
          <p style={styles.metricValue}>{rpm}</p>
        </div>
      </div>

      <Replay
        onReplayDataChange={setReplayData}
        onReplayFrameChange={setReplayFrame}
        onReplayModeChange={setIsReplayMode}
        replayActive={isReplayMode}
      />
      <div
        style={
          connectionStatus === "disconnected" && !isReplayMode
            ? styles.chartsDisabled
            : undefined
        }
      >
        <Charts data={chartData} />
      </div>

      <div style={styles.infoGrid}>
        <Recommendations recommendations={recommendations} />
      </div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "linear-gradient(180deg, #f5f7fa 0%, #e4ecf3 100%)",
    color: "#1a202c",
    fontFamily: '"Segoe UI", sans-serif',
  },
  emptyState: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "linear-gradient(180deg, #f5f7fa 0%, #e4ecf3 100%)",
    color: "#1a202c",
    fontFamily: '"Segoe UI", sans-serif',
    padding: "24px",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
  },
  topBar: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  emptyText: {
    margin: 0,
    fontSize: "1.1rem",
  },
  replayTag: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "10px 14px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    textAlign: "center",
  },
  connectionWarning: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 600,
    textAlign: "center",
  },
  telemetryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
    maxWidth: "960px",
    marginInline: "auto",
  },
  metricCard: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },
  metricLabel: {
    margin: "0 0 8px",
    color: "#4a5568",
    fontSize: "0.95rem",
  },
  metricValue: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 600,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  chartsDisabled: {
    opacity: 0.65,
  },
};
