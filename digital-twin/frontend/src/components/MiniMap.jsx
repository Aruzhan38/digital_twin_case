import React, { useEffect, useState } from "react";

const POSITION_FACTOR = 0.035;
const SPEED_LIMIT = 80;

export default function MiniMap({ speed, timestamp }) {
  const [position, setPosition] = useState(0);
  const numericSpeed = Number(speed || 0);
  const isOverspeed = numericSpeed > SPEED_LIMIT;

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    setPosition((currentPosition) => {
      const nextPosition = currentPosition + Number(speed || 0) * POSITION_FACTOR;
      return nextPosition >= 100 ? nextPosition % 100 : nextPosition;
    });
  }, [speed, timestamp]);

  return (
    <section style={{ ...styles.card, ...(isOverspeed ? styles.warningCard : null) }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>КАРТА УЧАСТКА ПУТИ</h2>
          <p style={styles.subtitle}>Текущее движение поезда</p>
        </div>
        <div style={styles.speedWrap}>
          <p style={styles.speedText}>{speed ?? "--"} км/ч</p>
          <p style={{ ...styles.limitText, ...(isOverspeed ? styles.limitDanger : null) }}>
            Ограничение: {SPEED_LIMIT} км/ч
          </p>
        </div>
      </div>

      <div style={styles.labels}>
        <span>СТАРТ</span>
        <span>ТЕКУЩЕЕ ПОЛОЖЕНИЕ</span>
        <span>КОНЕЦ</span>
      </div>

      <div style={styles.trackWrap}>
        <div style={styles.speedLimitLow}>40</div>
        <div style={styles.track}>
          <div style={styles.speedZone} />
          <div style={styles.warningZone}>
            <span style={styles.warningIcon}>⚠</span>
          </div>
        </div>
        <div style={styles.speedLimitHigh}>90</div>
        <div style={{ ...styles.train, left: `${position}%` }} />
      </div>
      {isOverspeed ? <p style={styles.warningText}>Превышение скорости</p> : null}
    </section>
  );
}

const styles = {
  card: {
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "12px",
    borderRadius: "20px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    boxShadow: "0 16px 40px rgba(2, 6, 23, 0.28)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  warningCard: {
    border: "1px solid rgba(239, 68, 68, 0.28)",
    boxShadow: "0 0 24px rgba(239, 68, 68, 0.18)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "0.76rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  speedText: {
    margin: 0,
    color: "#38bdf8",
    fontWeight: 700,
    fontSize: "0.96rem",
    whiteSpace: "nowrap",
  },
  speedWrap: {
    display: "grid",
    justifyItems: "end",
    gap: "2px",
  },
  limitText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
  },
  limitDanger: {
    color: "#f87171",
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
    color: "#64748b",
    fontSize: "0.68rem",
    letterSpacing: "0.06em",
    overflow: "hidden",
  },
  trackWrap: {
    position: "relative",
    height: "36px",
    display: "flex",
    alignItems: "center",
  },
  track: {
    flex: 1,
    height: "10px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #334155 0%, #64748b 100%)",
    position: "relative",
    overflow: "hidden",
  },
  speedZone: {
    position: "absolute",
    inset: 0,
    width: "22%",
    background: "rgba(248, 250, 252, 0.18)",
  },
  warningZone: {
    position: "absolute",
    left: "56%",
    width: "12%",
    top: 0,
    bottom: 0,
    background: "rgba(239, 68, 68, 0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  warningIcon: {
    fontSize: "0.78rem",
    lineHeight: 1,
  },
  speedLimitLow: {
    marginRight: "10px",
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  speedLimitHigh: {
    marginLeft: "10px",
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  train: {
    position: "absolute",
    top: "50%",
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    backgroundColor: "#38bdf8",
    border: "3px solid #0f172a",
    boxShadow: "0 0 0 6px rgba(56, 189, 248, 0.16), 0 6px 16px rgba(14, 165, 233, 0.35)",
    transform: "translate(-50%, -50%)",
  },
  warningText: {
    margin: "8px 0 0",
    color: "#f87171",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
};
