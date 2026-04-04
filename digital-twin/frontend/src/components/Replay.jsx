import React, { useEffect, useMemo, useState } from "react";

const HISTORY_URL = "http://127.0.0.1:8000/history?range_minutes=5";
const PLAYBACK_INTERVAL_MS = 750;

function normalizePayload(payload) {
  if (!payload?.telemetry) {
    return payload;
  }

  return {
    ...payload.telemetry,
    ...payload.health,
    system_status: payload.system_status,
    timestamp: payload.timestamp || payload.telemetry.timestamp,
    mode: payload.mode,
  };
}

function formatTimestamp(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export default function Replay({
  onReplayDataChange,
  onReplayFrameChange,
  onReplayModeChange,
  replayActive,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replayData, setReplayData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentData = replayData[currentIndex] || null;
  const replayTimeline = useMemo(
    () => replayData.slice(0, currentIndex + 1),
    [currentIndex, replayData]
  );

  useEffect(() => {
    if (!replayActive || !isPlaying || replayData.length === 0) {
      return undefined;
    }

    if (currentIndex >= replayData.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, replayData.length - 1));
    }, PLAYBACK_INTERVAL_MS);

    return () => window.clearTimeout(timerId);
  }, [currentIndex, isPlaying, replayActive, replayData]);

  useEffect(() => {
    if (!replayActive || replayData.length === 0) {
      return;
    }

    onReplayDataChange(replayTimeline);
    onReplayFrameChange(currentData);
  }, [
    currentData,
    onReplayDataChange,
    onReplayFrameChange,
    replayActive,
    replayTimeline,
    replayData.length,
  ]);

  async function handleReplayMode() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(HISTORY_URL);

      if (!response.ok) {
        throw new Error(`Replay request failed with status ${response.status}`);
      }

      const history = await response.json();
      const normalizedHistory = Array.isArray(history) ? history.map(normalizePayload).filter(Boolean) : [];

      if (normalizedHistory.length === 0) {
        throw new Error("Replay history is empty");
      }

      setReplayData(normalizedHistory);
      setCurrentIndex(0);
      setIsPlaying(false);
      onReplayModeChange(true);
      onReplayDataChange(normalizedHistory.slice(0, 1));
      onReplayFrameChange(normalizedHistory[0]);
    } catch (fetchError) {
      console.error("Replay fetch failed:", fetchError);
      setError("История недоступна");
    } finally {
      setLoading(false);
    }
  }

  function handlePlay() {
    if (replayData.length === 0) {
      return;
    }

    if (currentIndex >= replayData.length - 1) {
      setCurrentIndex(0);
    }

    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleReset() {
    setIsPlaying(false);
    setCurrentIndex(0);
  }

  function handleLiveMode() {
    setIsPlaying(false);
    setReplayData([]);
    setCurrentIndex(0);
    setError("");
    onReplayModeChange(false);
    onReplayDataChange([]);
    onReplayFrameChange(null);
  }

  function handleSliderChange(event) {
    setIsPlaying(false);
    setCurrentIndex(Number(event.target.value));
  }

  return (
    <section style={{ ...styles.card, ...(replayActive ? styles.activeCard : null) }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>ПОВТОР МАРШРУТА</h2>
          <p style={styles.subtitle}>История движения за последние 5 минут</p>
        </div>
        <span style={{ ...styles.modeBadge, ...(replayActive ? styles.modeBadgeActive : null) }}>
          {replayActive ? "РЕЖИМ: ПОВТОР" : "РЕЖИМ: ОНЛАЙН"}
        </span>
      </div>

      <div style={styles.replayControls}>
        <button onClick={handleReplayMode} style={styles.primaryButton} disabled={loading}>
          {loading ? "ЗАГРУЗКА..." : "ЗАГРУЗИТЬ"}
        </button>
        <button onClick={handleLiveMode} style={styles.secondaryButton}>
          ЖИВОЙ
        </button>
        <button onClick={handlePlay} style={styles.secondaryButton} disabled={!replayActive || replayData.length === 0}>
          ПУСК
        </button>
        <button onClick={handlePause} style={styles.secondaryButton} disabled={!replayActive || replayData.length === 0 || !isPlaying}>
          ПАУЗА
        </button>
        <button onClick={handleReset} style={styles.secondaryButton} disabled={!replayActive || replayData.length === 0}>
          СБРОС
        </button>
      </div>

      {replayActive ? (
        <div style={styles.timeline}>
          <input
            type="range"
            min="0"
            max={Math.max(replayData.length - 1, 0)}
            value={Math.min(currentIndex, Math.max(replayData.length - 1, 0))}
            onChange={handleSliderChange}
            style={styles.slider}
          />
          <div style={styles.timelineMeta}>
            <span>Кадр {replayData.length === 0 ? 0 : currentIndex + 1} / {replayData.length}</span>
            <span>{formatTimestamp(currentData?.timestamp)}</span>
          </div>
        </div>
      ) : null}

      {replayActive ? <p style={styles.replayBadge}>РЕЖИМ ПОВТОРА</p> : null}

      <p style={styles.statusText}>
        {replayActive
          ? isPlaying
            ? "История воспроизводится"
            : "История поставлена на паузу"
          : "Поток реального времени"}
      </p>
      {error ? <p style={styles.errorText}>{error}</p> : null}
    </section>
  );
}

const styles = {
  card: {
    width: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, rgba(14, 20, 34, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(2, 6, 23, 0.32)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
  },
  activeCard: {
    border: "1px solid rgba(56, 189, 248, 0.35)",
    boxShadow: "0 18px 34px rgba(37, 99, 235, 0.16)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "0.92rem",
    letterSpacing: "0.14em",
    color: "#e2e8f0",
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "0.76rem",
  },
  modeBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    color: "#cbd5e1",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  },
  modeBadgeActive: {
    backgroundColor: "rgba(37, 99, 235, 0.18)",
    color: "#93c5fd",
  },
  replayControls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },
  primaryButton: {
    border: "1px solid rgba(56, 189, 248, 0.35)",
    borderRadius: "12px",
    padding: "8px 12px",
    backgroundColor: "rgba(37, 99, 235, 0.18)",
    color: "#e0f2fe",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "12px",
    padding: "8px 12px",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    color: "#e2e8f0",
    fontWeight: 700,
    cursor: "pointer",
  },
  timeline: {
    minHeight: 0,
    overflow: "hidden",
  },
  slider: {
    width: "100%",
    margin: "0 0 8px",
    accentColor: "#38bdf8",
  },
  timelineMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#94a3b8",
    fontSize: "0.78rem",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  replayBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#7dd3fc",
    fontWeight: 700,
  },
  statusText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  errorText: {
    margin: "12px 0 0",
    color: "#f87171",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
