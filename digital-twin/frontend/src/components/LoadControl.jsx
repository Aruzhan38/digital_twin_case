import React from "react";

const MODE_URL = "http://127.0.0.1:8000/mode";

export default function LoadControl({
  eventsPerSecond,
  mode,
  modeLoading,
  onModeRequest,
  onModeResolved,
  totalMessages,
}) {
  const isHighLoad = mode === "highload";

  async function handleClick(nextMode) {
    onModeRequest(nextMode);

    try {
      const response = await fetch(`${MODE_URL}/${nextMode}`);

      if (!response.ok) {
        throw new Error(`Mode update failed with status ${response.status}`);
      }

      const payload = await response.json();
      onModeResolved(payload.mode);
    } catch (error) {
      console.error("Mode update failed:", error);
      onModeResolved(mode);
    }
  }

  return (
    <section
      style={{
        ...styles.card,
        ...(isHighLoad ? styles.highLoadCard : null),
      }}
    >
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Load Control</h2>
          <p style={styles.modeText}>
            Mode: {isHighLoad ? "HIGH LOAD" : "NORMAL"}
          </p>
        </div>
        {isHighLoad ? <span style={styles.badge}>HIGH LOAD ACTIVE</span> : null}
      </div>

      <div style={styles.actions}>
        <button
          onClick={() => handleClick("normal")}
          style={styles.normalButton}
          disabled={modeLoading}
        >
          Normal Mode
        </button>
        <button
          onClick={() => handleClick("highload")}
          style={styles.highLoadButton}
          disabled={modeLoading}
        >
          High Load Mode
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>
            {isHighLoad ? "🚀 HIGH LOAD MODE" : "🟢 NORMAL MODE"}
          </p>
          <p style={styles.statValue}>{eventsPerSecond}</p>
          <p style={styles.statCaption}>Events/sec</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Messages received</p>
          <p style={styles.statValue}>{totalMessages}</p>
          <p style={styles.statCaption}>Total messages</p>
        </div>
      </div>
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
  highLoadCard: {
    border: "2px solid #f97316",
    boxShadow: "0 16px 36px rgba(249, 115, 22, 0.16)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
  },
  modeText: {
    margin: "6px 0 0",
    color: "#52606d",
    fontWeight: 600,
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#ffedd5",
    color: "#c2410c",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  normalButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#0f766e",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  highLoadButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#ea580c",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  statCard: {
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
  },
  statLabel: {
    margin: "0 0 8px",
    color: "#334155",
    fontWeight: 700,
  },
  statValue: {
    margin: "0 0 4px",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  statCaption: {
    margin: 0,
    color: "#64748b",
  },
};
