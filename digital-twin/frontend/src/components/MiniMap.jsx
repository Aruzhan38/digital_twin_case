import React, { useEffect, useState } from "react";

const POSITION_FACTOR = 0.035;

export default function MiniMap({ speed, timestamp }) {
  const [position, setPosition] = useState(0);

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
    <section style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Mini Map</h2>
        <p style={styles.speedText}>Speed: {speed ?? "--"}</p>
      </div>

      <div style={styles.labels}>
        <span>Start</span>
        <span>Current</span>
        <span>End</span>
      </div>

      <div style={styles.trackWrap}>
        <div style={styles.track} />
        <div
          style={{
            ...styles.train,
            left: `${position}%`,
          }}
        />
      </div>
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "960px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
  },
  speedText: {
    margin: 0,
    color: "#52606d",
    fontWeight: 600,
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  trackWrap: {
    position: "relative",
    height: "34px",
    display: "flex",
    alignItems: "center",
  },
  track: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%)",
  },
  train: {
    position: "absolute",
    top: "50%",
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    backgroundColor: "#2563eb",
    border: "3px solid #ffffff",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
    transform: "translate(-50%, -50%)",
  },
};
