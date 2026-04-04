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
    <section style={{ ...styles.card, ...(isHighLoad ? styles.highLoadCard : null) }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>РЕЖИМ НАГРУЗКИ</h2>
          <p style={styles.modeText}>Режим: {isHighLoad ? "ВЫСОКАЯ НАГРУЗКА" : "НОРМАЛЬНЫЙ"}</p>
        </div>
        {isHighLoad ? <span style={styles.badge}>ВЫСОКАЯ НАГРУЗКА</span> : null}
      </div>

      <div style={styles.actions}>
        <button onClick={() => handleClick("normal")} style={styles.normalButton} disabled={modeLoading}>
          НОРМАЛЬНЫЙ РЕЖИМ
        </button>
        <button onClick={() => handleClick("highload")} style={styles.highLoadButton} disabled={modeLoading}>
          ВЫСОКАЯ НАГРУЗКА
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>{isHighLoad ? "🚀 ВЫСОКАЯ НАГРУЗКА" : "🟢 НОРМАЛЬНЫЙ РЕЖИМ"}</p>
          <p style={styles.statValue}>{eventsPerSecond}</p>
          <p style={styles.statCaption}>СОБЫТИЙ / СЕК</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>ПРИНЯТО СООБЩЕНИЙ</p>
          <p style={styles.statValue}>{totalMessages}</p>
          <p style={styles.statCaption}>ВСЕГО ПАКЕТОВ</p>
        </div>
      </div>
    </section>
  );
}

const styles = {
  card: {
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "12px",
    borderRadius: "18px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  highLoadCard: {
    border: "1px solid rgba(249, 115, 22, 0.5)",
    boxShadow: "0 20px 42px rgba(194, 65, 12, 0.18)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "10px",
    overflow: "hidden",
  },
  title: {
    margin: 0,
    fontSize: "0.88rem",
    letterSpacing: "0.08em",
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  modeText: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(249, 115, 22, 0.14)",
    color: "#fb923c",
    fontWeight: 700,
    fontSize: "0.76rem",
  },
  actions: {
    display: "flex",
    gap: "10px",
    width: "100%",
    flexWrap: "nowrap",
    marginBottom: "10px",
  },
  normalButton: {
    flex: 1,
    border: "1px solid rgba(34, 197, 94, 0.35)",
    borderRadius: "12px",
    padding: "10px 12px",
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    color: "#dcfce7",
    fontWeight: 700,
    fontSize: "12px",
    textAlign: "center",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  highLoadButton: {
    flex: 1,
    border: "1px solid rgba(249, 115, 22, 0.4)",
    borderRadius: "12px",
    padding: "10px 12px",
    backgroundColor: "rgba(249, 115, 22, 0.18)",
    color: "#ffedd5",
    fontWeight: 700,
    fontSize: "12px",
    textAlign: "center",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
  },
  statCard: {
    padding: "10px",
    borderRadius: "14px",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    overflow: "hidden",
  },
  statLabel: {
    margin: "0 0 6px",
    color: "#cbd5e1",
    fontWeight: 700,
    fontSize: "0.74rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statValue: {
    margin: "0 0 2px",
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#f8fafc",
  },
  statCaption: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.68rem",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
