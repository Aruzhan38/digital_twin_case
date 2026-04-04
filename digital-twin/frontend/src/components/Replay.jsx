import React, { useEffect, useMemo, useState } from "react";

const HISTORY_URL = "http://127.0.0.1:8000/history";
const PLAYBACK_INTERVAL_MS = 750;

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
      if (!Array.isArray(history) || history.length === 0) {
        throw new Error("Replay history is empty");
      }

      setReplayData(history);
      setCurrentIndex(0);
      setIsPlaying(false);
      onReplayModeChange(true);
      onReplayDataChange(history.slice(0, 1));
      onReplayFrameChange(history[0]);
    } catch (fetchError) {
      console.error("Replay fetch failed:", fetchError);
      setError("Replay data unavailable");
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
    <section style={styles.card}>
      <h2 style={styles.title}>Replay Controls</h2>
      <div style={styles.actions}>
        <button
          onClick={handleReplayMode}
          style={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Replay Mode"}
        </button>
        <button onClick={handleLiveMode} style={styles.secondaryButton}>
          Live Mode
        </button>
      </div>

      <div style={styles.actions}>
        <button
          onClick={handlePlay}
          style={styles.secondaryButton}
          disabled={!replayActive || replayData.length === 0}
        >
          Play ▶
        </button>
        <button
          onClick={handlePause}
          style={styles.secondaryButton}
          disabled={!replayActive || replayData.length === 0 || !isPlaying}
        >
          Pause ⏸
        </button>
        <button
          onClick={handleReset}
          style={styles.secondaryButton}
          disabled={!replayActive || replayData.length === 0}
        >
          Reset ⏮
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
            <span>
              Frame {replayData.length === 0 ? 0 : currentIndex + 1} / {replayData.length}
            </span>
            <span>{formatTimestamp(currentData?.timestamp)}</span>
          </div>
        </div>
      ) : null}

      {replayActive ? <p style={styles.replayBadge}>Replay Mode</p> : null}

      <p style={styles.statusText}>
        {replayActive
          ? isPlaying
            ? "Replay playback is running"
            : "Replay is paused"
          : "Live telemetry is shown in charts"}
      </p>
      {replayActive ? (
        <p style={styles.helperText}>
          Drag the timeline to inspect a specific timestamp.
        </p>
      ) : null}
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
  timeline: {
    marginBottom: "12px",
  },
  slider: {
    width: "100%",
    margin: "0 0 8px",
  },
  timelineMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#52606d",
    fontSize: "0.92rem",
    flexWrap: "wrap",
  },
  replayBadge: {
    display: "inline-block",
    margin: "0 0 12px",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
  },
  statusText: {
    margin: 0,
    color: "#52606d",
  },
  helperText: {
    margin: "8px 0 0",
    color: "#52606d",
    fontSize: "0.92rem",
  },
  errorText: {
    margin: "12px 0 0",
    color: "#dc2626",
  },
};
