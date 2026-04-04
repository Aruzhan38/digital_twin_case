import { useMemo, useState } from "react";

import Alerts from "./Alerts.jsx";
import Charts from "./Charts.jsx";
import HealthIndex from "./HealthIndex.jsx";
import Recommendations from "./Recommendations.jsx";
import Replay from "./Replay.jsx";

const MODE_URL = "http://localhost:8000/mode";

export default function Dashboard({ data, history }) {
  const [replayData, setReplayData] = useState([]);
  const [mode, setMode] = useState("normal");
  const [modeLoading, setModeLoading] = useState(false);

  const chartData = useMemo(() => {
    if (replayData.length > 0) {
      return replayData.slice(-30);
    }

    return history;
  }, [history, replayData]);

  async function handleModeChange(nextMode) {
    setModeLoading(true);

    try {
      const response = await fetch(`${MODE_URL}/${nextMode}`);

      if (!response.ok) {
        throw new Error(`Mode update failed with status ${response.status}`);
      }

      const payload = await response.json();
      setMode(payload.mode);
    } catch (error) {
      console.error("Mode update failed:", error);
    } finally {
      setModeLoading(false);
    }
  }

  if (!data) {
    return (
      <section style={styles.emptyState}>
        <h1 style={styles.title}>Digital Twin Dashboard</h1>
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
    rpm,
    reasons,
    recommendations,
  } = data;

  return (
    <section style={styles.page}>
      <h1 style={styles.title}>Digital Twin Dashboard</h1>
      <HealthIndex health={health} status={status} />

      <div style={styles.controlsCard}>
        <div>
          <h2 style={styles.infoTitle}>Simulation Mode</h2>
          <p style={styles.modeText}>Current mode: {mode}</p>
        </div>
        <div style={styles.modeActions}>
          <button
            onClick={() => handleModeChange("normal")}
            style={styles.modeButton}
            disabled={modeLoading}
          >
            Normal
          </button>
          <button
            onClick={() => handleModeChange("highload")}
            style={styles.modeButton}
            disabled={modeLoading}
          >
            High Load
          </button>
        </div>
      </div>

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
        onReplayData={setReplayData}
        onReplayExit={() => setReplayData([])}
        replayActive={replayData.length > 0}
      />
      <Charts data={chartData} />

      <div style={styles.infoGrid}>
        <Alerts reasons={reasons} />
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
    margin: "0 0 24px",
    textAlign: "center",
    fontSize: "2rem",
  },
  emptyText: {
    margin: 0,
    fontSize: "1.1rem",
  },
  controlsCard: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  modeText: {
    margin: "6px 0 0",
    color: "#52606d",
    textTransform: "capitalize",
  },
  modeActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  modeButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#0f766e",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
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
  infoTitle: {
    margin: 0,
    fontSize: "1.2rem",
  },
};
