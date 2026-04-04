import React, { useEffect, useMemo, useRef, useState } from "react";

const POSITION_FACTOR = 0.035;
const SPEED_LIMIT = 40;
const MAP_DISTANCE = 100;
const START_X = 24;
const END_X = 376;
const TRACK_Y = 84;
const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 160;
const DANGER_START = 58;
const DANGER_END = 72;
const STATION_DISTANCE = 3.2;
const SCALE_MARKERS = [0, 22, 40, 75, 100];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function positionToX(position) {
  const progress = clamp(position, 0, MAP_DISTANCE) / MAP_DISTANCE;
  return START_X + progress * (END_X - START_X);
}

function getTrackY(position) {
  if (position >= 22 && position <= 40) {
    const loopProgress = (position - 22) / 18;
    return TRACK_Y - Math.sin(loopProgress * Math.PI) * 20;
  }

  if (position >= 40 && position <= 58) {
    const loopProgress = (position - 40) / 18;
    return TRACK_Y + Math.sin(loopProgress * Math.PI) * 20;
  }

  return TRACK_Y;
}

export default function MiniMap({ speed, timestamp }) {
  const [position, setPosition] = useState(18);
  const [mapWidth, setMapWidth] = useState(VIEWBOX_WIDTH);
  const mapFrameRef = useRef(null);
  const numericSpeed = Number(speed || 0);
  const isOverspeed = numericSpeed > SPEED_LIMIT;

  useEffect(() => {
    const element = mapFrameRef.current;

    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      setMapWidth(element.clientWidth || VIEWBOX_WIDTH);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    setPosition((currentPosition) => {
      if (numericSpeed <= 0) {
        return currentPosition;
      }

      const nextPosition = currentPosition + numericSpeed * POSITION_FACTOR;
      return nextPosition >= MAP_DISTANCE ? nextPosition % MAP_DISTANCE : nextPosition;
    });
  }, [numericSpeed, timestamp]);

  const clampedPosition = clamp(position, 0, MAP_DISTANCE);
  const trainX = useMemo(() => {
    const progress = clampedPosition / MAP_DISTANCE;
    const horizontalPadding = 24;
    const usableWidth = Math.max(mapWidth - horizontalPadding * 2, 0);
    return horizontalPadding + progress * usableWidth;
  }, [clampedPosition, mapWidth]);
  const trainY = useMemo(() => clamp(getTrackY(clampedPosition), 26, 134), [clampedPosition]);
  const inDangerZone = clampedPosition >= DANGER_START && clampedPosition <= DANGER_END;

  return (
    <section style={{ ...styles.card, ...(isOverspeed || inDangerZone ? styles.warningCard : null) }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>СХЕМА ПУТИ</h2>
          <p style={styles.subtitle}>Оперативная железнодорожная схема участка</p>
        </div>

        <div style={{ ...styles.limitCard, ...(isOverspeed ? styles.limitCardWarning : null) }}>
          <span style={styles.limitLabel}>ОГРАНИЧЕНИЕ</span>
          <strong style={styles.limitValue}>40 км/ч</strong>
        </div>
      </div>

      <div ref={mapFrameRef} style={styles.mapFrame}>
        <div style={styles.stationLabel}>
          <strong style={styles.stationTitle}>СТ. ЗАВОДСКАЯ</strong>
          <span style={styles.stationMeta}>{STATION_DISTANCE} км</span>
        </div>

        <svg
          width="100%"
          height="160"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          style={styles.scheme}
          role="img"
          aria-label="Railway track map"
        >
          <defs>
            <linearGradient id="trackGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#d1d5db" />
            </linearGradient>
            <linearGradient id="dangerFill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(248, 113, 113, 0.18)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.32)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="transparent" />

          <rect
            x={positionToX(DANGER_START)}
            y="44"
            width={positionToX(DANGER_END) - positionToX(DANGER_START)}
            height="64"
            rx="8"
            fill="url(#dangerFill)"
          />

          <line
            x1={positionToX(DANGER_START)}
            y1="36"
            x2={positionToX(DANGER_START)}
            y2="126"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1={positionToX(DANGER_END)}
            y1="36"
            x2={positionToX(DANGER_END)}
            y2="126"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <path
            d={`M ${START_X} ${TRACK_Y} H ${END_X}`}
            stroke="url(#trackGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d={`M ${positionToX(22)} ${TRACK_Y} C ${positionToX(26)} 48, ${positionToX(36)} 48, ${positionToX(40)} ${TRACK_Y}`}
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${positionToX(22)} ${TRACK_Y} C ${positionToX(26)} 120, ${positionToX(36)} 120, ${positionToX(40)} ${TRACK_Y}`}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${positionToX(40)} ${TRACK_Y} C ${positionToX(44)} 48, ${positionToX(54)} 48, ${positionToX(58)} ${TRACK_Y}`}
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${positionToX(40)} ${TRACK_Y} C ${positionToX(44)} 120, ${positionToX(54)} 120, ${positionToX(58)} ${TRACK_Y}`}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          <line
            x1={positionToX(DANGER_START)}
            y1={TRACK_Y}
            x2={positionToX(DANGER_END)}
            y2={TRACK_Y}
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <text x={positionToX(DANGER_START) + 6} y="28" style={svgStyles.dangerText}>⚠ ОПАСНАЯ ЗОНА</text>

          {SCALE_MARKERS.map((marker) => {
            const x = positionToX(marker);
            return (
              <g key={marker}>
                <line x1={x} y1="132" x2={x} y2="140" stroke="#94a3b8" strokeWidth="1.5" />
                <text x={x} y="153" textAnchor={marker === 0 ? "start" : marker === 100 ? "end" : "middle"} style={svgStyles.scaleLabel}>
                  {marker === 100 ? "100 км" : marker}
                </text>
              </g>
            );
          })}

        </svg>

        <div
          style={{
            ...styles.train,
            left: `${clamp(trainX, 11, Math.max(mapWidth - 11, 11))}px`,
            top: `${trainY}px`,
            transition:
              numericSpeed > 0
                ? "left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                : "left 0.2s linear, top 0.2s linear",
          }}
        >
          <div style={styles.trainGlow} />
          <div style={styles.trainCore} />
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.statusRow}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>ПОЗИЦИЯ</span>
            <strong style={styles.metricValue}>{clampedPosition.toFixed(1)} км</strong>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>СКОРОСТЬ</span>
            <strong style={{ ...styles.metricValue, color: isOverspeed ? "#fca5a5" : "#7dd3fc" }}>
              {numericSpeed || 0} км/ч
            </strong>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>УЧАСТОК</span>
            <strong style={styles.metricValue}>{inDangerZone ? "КОНТРОЛЬ" : "НОРМА"}</strong>
          </div>
        </div>

        {isOverspeed ? <p style={styles.warningText}>Превышение скорости</p> : null}
      </div>
    </section>
  );
}

const svgStyles = {
  dangerText: {
    fill: "#fca5a5",
    fontSize: "10px",
    letterSpacing: "0.12em",
    fontWeight: 700,
  },
  scaleLabel: {
    fill: "#94a3b8",
    fontSize: "9px",
    letterSpacing: "0.1em",
    fontWeight: 600,
  },
};

const styles = {
  card: {
    width: "100%",
    minHeight: 0,
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, rgba(12, 19, 31, 0.98) 0%, rgba(8, 13, 24, 1) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(2, 6, 23, 0.34)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  warningCard: {
    border: "1px solid rgba(239, 68, 68, 0.32)",
    boxShadow: "0 18px 42px rgba(127, 29, 29, 0.26)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "0.95rem",
    letterSpacing: "0.14em",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "0.78rem",
  },
  limitCard: {
    minWidth: "126px",
    padding: "10px 12px",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    border: "1px solid rgba(239, 68, 68, 0.24)",
    display: "grid",
    gap: "4px",
  },
  limitCardWarning: {
    boxShadow: "0 0 18px rgba(239, 68, 68, 0.2)",
  },
  limitLabel: {
    color: "#fca5a5",
    fontSize: "0.66rem",
    letterSpacing: "0.14em",
  },
  limitValue: {
    color: "#fecaca",
    fontSize: "1rem",
    fontWeight: 800,
  },
  mapFrame: {
    position: "relative",
    width: "100%",
    borderRadius: "16px",
    background:
      "linear-gradient(180deg, rgba(2, 6, 23, 0.94) 0%, rgba(15, 23, 42, 0.72) 100%), repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.04) 0, rgba(148, 163, 184, 0.04) 1px, transparent 1px, transparent 22px)",
    border: "1px solid rgba(71, 85, 105, 0.54)",
    overflow: "hidden",
  },
  scheme: {
    display: "block",
  },
  stationLabel: {
    position: "absolute",
    top: "16px",
    left: "16px",
    zIndex: 2,
    display: "grid",
    gap: "4px",
    padding: "8px 10px",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.86)",
    border: "1px solid rgba(96, 165, 250, 0.16)",
  },
  stationTitle: {
    color: "#e5eefc",
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    fontWeight: 700,
  },
  stationMeta: {
    color: "#93c5fd",
    fontSize: "0.72rem",
    letterSpacing: "0.08em",
    fontWeight: 600,
  },
  train: {
    position: "absolute",
    width: "22px",
    height: "22px",
    pointerEvents: "none",
    willChange: "transform",
    transform: "translate(-50%, -50%)",
    zIndex: 3,
  },
  trainGlow: {
    position: "absolute",
    inset: "0",
    borderRadius: "999px",
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    boxShadow: "0 0 14px rgba(59, 130, 246, 0.35)",
  },
  trainCore: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    backgroundColor: "#3B82F6",
    border: "2px solid #dbeafe",
    transform: "translate(-50%, -50%)",
  },
  footer: {
    display: "grid",
    gap: "10px",
  },
  statusRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },
  metricCard: {
    padding: "10px 12px",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    display: "grid",
    gap: "4px",
    minWidth: 0,
  },
  metricLabel: {
    color: "#64748b",
    fontSize: "0.66rem",
    letterSpacing: "0.14em",
  },
  metricValue: {
    color: "#e2e8f0",
    fontSize: "0.86rem",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  warningText: {
    margin: 0,
    color: "#fca5a5",
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
};
