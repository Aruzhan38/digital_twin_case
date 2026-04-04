import { useState } from "react";

const HISTORY_URL = "http://localhost:8000/history";

export default function Replay({ onReplayData, onReplayExit, replayActive }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReplay() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(HISTORY_URL);

      if (!response.ok) {
        throw new Error(`Replay request failed with status ${response.status}`);
      }

      const replayData = await response.json();
      onReplayData(replayData);
    } catch (fetchError) {
      console.error("Replay fetch failed:", fetchError);
      setError("Replay data unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Replay Mode</h2>
      <div style={styles.actions}>
        <button onClick={handleReplay} style={styles.primaryButton} disabled={loading}>
          {loading ? "Loading..." : "Replay last 5 min"}
        </button>
        {replayActive ? (
          <button onClick={onReplayExit} style={styles.secondaryButton}>
            Return to live
          </button>
        ) : null}
      </div>
      <p style={styles.statusText}>
        {replayActive ? "Replay data is shown in charts" : "Live telemetry is shown in charts"}
      </p>
      {error ? <p style={styles.errorText}>{error}</p> : null}
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "1.2rem",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px",
  },
  primaryButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontWeight: 600,
    cursor: "pointer",
  },
  statusText: {
    margin: 0,
    color: "#52606d",
  },
  errorText: {
    margin: "12px 0 0",
    color: "#dc2626",
  },
};
