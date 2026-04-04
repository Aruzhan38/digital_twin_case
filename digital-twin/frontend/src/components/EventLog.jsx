import React from "react";

const TYPE_STYLES = {
  critical: {
    color: "#ef4444",
    icon: "🔴",
    background: "rgba(127, 29, 29, 0.32)",
  },
  warning: {
    color: "#f59e0b",
    icon: "🟡",
    background: "rgba(120, 53, 15, 0.28)",
  },
  info: {
    color: "#38bdf8",
    icon: "🔵",
    background: "rgba(30, 64, 175, 0.24)",
  },
};

export default function EventLog({ events }) {
  const visibleEvents = Array.isArray(events) ? events.slice(0, 8) : [];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>СОБЫТИЯ</h2>
      {visibleEvents.length > 0 ? (
        <div style={styles.list}>
          {visibleEvents.map((event, index) => {
            const style = TYPE_STYLES[event.type] || TYPE_STYLES.info;

            return (
              <div key={`${event.timestamp}-${event.message}-${index}`} style={{ ...styles.item, backgroundColor: style.background }}>
                <span style={styles.time}>{event.timestamp}</span>
                <span style={{ ...styles.icon, color: style.color }}>{style.icon}</span>
                <span style={styles.message}>{event.message}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.emptyText}>Событий пока нет</p>
      )}
    </section>
  );
}

const styles = {
  card: {
    width: "100%",
    minHeight: 0,
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 27, 0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(2, 6, 23, 0.32)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "0.92rem",
    letterSpacing: "0.1em",
    color: "#e2e8f0",
  },
  list: {
    display: "grid",
    gap: "8px",
    overflowY: "auto",
    paddingRight: "4px",
    maxHeight: "220px",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "68px 22px minmax(0, 1fr)",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "10px",
  },
  time: {
    color: "#cbd5e1",
    fontSize: "0.78rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  icon: {
    lineHeight: 1,
  },
  message: {
    color: "#e2e8f0",
    fontSize: "0.84rem",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
  },
};
