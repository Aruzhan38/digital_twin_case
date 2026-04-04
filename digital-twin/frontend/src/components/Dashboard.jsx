import React, { useMemo, useState } from "react";

import Alerts from "./Alerts.jsx";
import Charts from "./Charts.jsx";
import ConnectionStatus from "./ConnectionStatus.jsx";
import EventLog from "./EventLog.jsx";
import ExportButton from "./ExportButton.jsx";
import HealthFactors from "./HealthFactors.jsx";
import HealthIndex from "./HealthIndex.jsx";
import LoadControl from "./LoadControl.jsx";
import MiniMap from "./MiniMap.jsx";
import Recommendations from "./Recommendations.jsx";
import Replay from "./Replay.jsx";
import SystemMetrics from "./SystemMetrics.jsx";
import SystemStatus from "./SystemStatus.jsx";

const TEXT_MAP = {
  Overheating: "Перегрев",
  "Rising temperature": "Рост температуры",
  Normal: "Норма",
  Low: "Низкий уровень",
  Critical: "Критично",
  High: "Повышена",
  "System stable": "Система стабильна",
  "Engine overheating": "Перегрев двигателя",
  "Engine temperature rising": "Рост температуры двигателя",
  "Coolant overheating": "Перегрев охлаждения",
  "Critical fuel level": "Критический уровень топлива",
  "Low fuel level": "Низкий уровень топлива",
  "Pressure out of range": "Давление вне диапазона",
  "Pressure below optimal range": "Пониженное давление",
  "Critical system alert": "Критический системный сигнал",
  "Low voltage": "Низкое напряжение",
  "High traction load": "Высокая тяговая нагрузка",
  "Electrical surge detected": "Скачок напряжения",
  "Fuel drop detected": "Провал топлива",
  "Brake pressure fluctuation": "Просадка тормозного давления",
  "Thermal spike detected": "Температурный всплеск",
  "Топливо закончилось": "Топливо закончилось",
  "Критический уровень топлива": "Критический уровень топлива",
  "Низкий уровень топлива": "Низкий уровень топлива",
  "Перегрев двигателя": "Перегрев двигателя",
  "Температура двигателя растёт": "Температура двигателя растёт",
  "Перегрев системы охлаждения": "Перегрев системы охлаждения",
  "Проблема с давлением": "Проблема с давлением",
  "Давление ниже нормы": "Давление ниже нормы",
  "Критический системный сигнал": "Критический системный сигнал",
  "Скачок напряжения": "Скачок напряжения",
  "Резкое падение топлива": "Резкое падение топлива",
  "Падение тормозного давления": "Падение тормозного давления",
  "Температурный всплеск": "Температурный всплеск",
  "Система стабильна": "Система стабильна",
};

function translateText(value) {
  return TEXT_MAP[value] || value;
}

function translateAlertGroups(groups) {
  return {
    critical: (groups?.critical || []).map(translateText),
    warning: (groups?.warning || []).map(translateText),
    normal: (groups?.normal || []).map(translateText),
  };
}

function translateSystemStatus(statusMap) {
  if (!statusMap) {
    return statusMap;
  }

  return Object.fromEntries(
    Object.entries(statusMap).map(([key, value]) => [
      key,
      { ...value, message: translateText(value?.message) },
    ])
  );
}

function card(title, children, accent) {
  return (
    <section style={{ ...styles.metricCard, ...(accent ? { borderColor: accent } : null) }}>
      <p style={styles.metricCardTitle}>{title}</p>
      {children}
    </section>
  );
}

function metricRow(label, value, unit, color) {
  return (
    <div style={styles.metricRow}>
      <span style={styles.metricLabel}>{label}</span>
      <span style={{ ...styles.metricValue, color: color || "#f8fafc" }}>
        {value}
        {unit ? <small style={styles.metricUnit}> {unit}</small> : null}
      </span>
    </div>
  );
}

function progressBar(value, color) {
  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          width: `${Math.max(0, Math.min(value, 100))}%`,
          background: color,
        }}
      />
    </div>
  );
}

function getFuelAccentColor(fuelLevel) {
  if (fuelLevel < 10) {
    return "#ef4444";
  }

  if (fuelLevel < 30) {
    return "#f97316";
  }

  if (fuelLevel <= 60) {
    return "#eab308";
  }

  return "#22c55e";
}

function fuelProgressBar(fuelLevel) {
  const normalizedFuel = Math.max(0, Math.min(Number(fuelLevel) || 0, 100));
  const isCriticalFuel = normalizedFuel < 10;

  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          width: `${normalizedFuel}%`,
          background:
            normalizedFuel > 60
              ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
              : normalizedFuel >= 30
                ? "linear-gradient(90deg, #fde047 0%, #eab308 100%)"
                : "linear-gradient(90deg, #fb7185 0%, #dc2626 100%)",
          ...(isCriticalFuel ? styles.criticalFuelFill : null),
        }}
      />
    </div>
  );
}

export default function Dashboard({
  connectionStatus,
  data,
  eventsPerSecond,
  history,
  latencyMs,
  totalMessages,
}) {
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [mode, setMode] = useState("normal");
  const [modeLoading, setModeLoading] = useState(false);
  const [replayData, setReplayData] = useState([]);
  const [replayFrame, setReplayFrame] = useState(null);

  const activeData = isReplayMode ? replayFrame : data;
  const chartData = useMemo(() => {
    const source = isReplayMode ? replayData : history;
    return source.slice(-60);
  }, [history, isReplayMode, replayData]);

  if (!activeData) {
    return (
      <section style={styles.emptyState}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.kicker}>ЛОКОМОТИВНЫЙ МОНИТОРИНГ</p>
            <h1 style={styles.title}>КАБИНА</h1>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>
        <p style={styles.emptyText}>ОЖИДАНИЕ ТЕЛЕМЕТРИИ</p>
      </section>
    );
  }

  const {
    health,
    status,
    status_code: statusCode,
    speed,
    engine_temp: engineTemp,
    fuel_level: fuelLevel,
    alert_groups: alertGroups,
    brake_pressure: brakePressure,
    current,
    coolant_temp: coolantTemp,
    factors,
    oil_pressure: oilPressure,
    oil_temp: oilTemp,
    rpm,
    recommendations,
    events,
    system_status: systemStatus,
    timestamp,
    voltage,
  } = activeData;

  const translatedAlerts = translateAlertGroups(alertGroups);
  const translatedSystemStatus = translateSystemStatus(systemStatus);

  return (
    <section style={styles.page}>
      <style>
        {`
          @keyframes fuelCriticalPulse {
            0% { opacity: 0.78; box-shadow: 0 0 8px rgba(239, 68, 68, 0.35); }
            50% { opacity: 1; box-shadow: 0 0 16px rgba(239, 68, 68, 0.7); }
            100% { opacity: 0.78; box-shadow: 0 0 8px rgba(239, 68, 68, 0.35); }
          }
        `}
      </style>
      <div style={styles.shell}>
        <header style={styles.topBar}>
          <div>
            <p style={styles.kicker}>ЛОКОМОТИВНЫЙ МОНИТОРИНГ</p>
            <h1 style={styles.title}>КАБИНА</h1>
          </div>
          <div style={styles.topRight}>
            <SystemMetrics eventsPerSecond={eventsPerSecond} latencyMs={latencyMs} />
            <ExportButton />
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        <main style={styles.dashboardGrid}>
          <div style={styles.gridCell}>
            <LoadControl
              eventsPerSecond={eventsPerSecond}
              mode={mode}
              modeLoading={modeLoading}
              onModeRequest={(nextMode) => {
                setModeLoading(true);
                setMode(nextMode);
              }}
              onModeResolved={(nextMode) => {
                setMode(nextMode);
                setModeLoading(false);
              }}
              totalMessages={totalMessages}
            />
          </div>

          <div style={styles.gridCell}>
            <section style={styles.healthPanel}>
              <HealthIndex health={health} status={status || statusCode} />
              <div style={styles.healthFactorsWrap}>
                <HealthFactors factors={factors} />
              </div>
            </section>
          </div>

          <div style={styles.gridCell}>
            <SystemStatus systemStatus={translatedSystemStatus} />
          </div>

          <div style={styles.gridCell}>
            <section style={styles.telemetryColumn}>
              {card(
                "СКОРОСТЬ",
                <>
                  {metricRow("Текущая скорость", speed, "км/ч", "#38bdf8")}
                  {progressBar((speed / 120) * 100, "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)")}
                </>,
                "rgba(56, 189, 248, 0.34)"
              )}
              {card(
                "ТОПЛИВО",
                <>
                  {metricRow(
                    "Уровень",
                    fuelLevel,
                    "%",
                    getFuelAccentColor(fuelLevel)
                  )}
                  {fuelProgressBar(fuelLevel)}
                  {metricRow("Напряжение", voltage, "В")}
                </>,
                "rgba(34, 197, 94, 0.34)"
              )}
              {card(
                "ДАВЛЕНИЕ",
                <>
                  {metricRow("Тормоз", brakePressure, "бар", brakePressure < 4 ? "#ef4444" : "#f8fafc")}
                  {metricRow(
                    "Масло",
                    oilPressure,
                    "бар",
                    oilPressure < 2 ? "#ef4444" : oilPressure < 3 ? "#f59e0b" : "#f8fafc"
                  )}
                </>,
                "rgba(249, 115, 22, 0.34)"
              )}
              {card(
                "ТЕМПЕРАТУРА",
                <>
                  {metricRow(
                    "Двигатель",
                    engineTemp,
                    "°C",
                    engineTemp > 100 ? "#ef4444" : engineTemp >= 85 ? "#f59e0b" : "#f8fafc"
                  )}
                  {metricRow("Охлаждение", coolantTemp, "°C")}
                  {metricRow("Масло", oilTemp, "°C")}
                </>,
                "rgba(239, 68, 68, 0.34)"
              )}
              {card(
                "ЭЛЕКТРИКА",
                <>
                  {metricRow("Ток", current, "А")}
                  {metricRow("Напряжение", voltage, "В")}
                  {metricRow("Обороты", rpm, "об/мин")}
                </>,
                "rgba(59, 130, 246, 0.34)"
              )}
            </section>
          </div>

          <div style={styles.gridCell}>
            <section style={styles.centerColumn}>
              <MiniMap speed={speed} timestamp={timestamp} />
              <Replay
                onReplayDataChange={setReplayData}
                onReplayFrameChange={setReplayFrame}
                onReplayModeChange={setIsReplayMode}
                replayActive={isReplayMode}
              />
              <div style={styles.signalStrip}>
                <div style={styles.signalCell}>
                  <span style={styles.signalLabel}>ВРЕМЯ</span>
                  <strong style={styles.signalValue}>
                    {new Date(timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </strong>
                </div>
                <div style={styles.signalCell}>
                  <span style={styles.signalLabel}>РЕЖИМ</span>
                  <strong style={styles.signalValue}>{isReplayMode ? "ПОВТОР" : "РЕАЛЬНОЕ ВРЕМЯ"}</strong>
                </div>
                <div style={styles.signalCell}>
                  <span style={styles.signalLabel}>СОСТОЯНИЕ</span>
                  <strong style={styles.signalValue}>{status || statusCode || "Норма"}</strong>
                </div>
              </div>
            </section>
          </div>

          <div style={styles.gridCell}>
            <section style={styles.sideColumn}>
              <div style={styles.sidePanel}>
                <Alerts alertGroups={translatedAlerts} />
              </div>
              <div style={styles.sidePanel}>
                <Recommendations recommendations={recommendations} />
              </div>
            </section>
          </div>

          <div style={{ ...styles.gridCell, gridColumn: "1 / -1" }}>
            <div style={styles.trendsPanel}>
              <Charts compact data={chartData} />
            </div>
          </div>

          <div style={{ ...styles.gridCell, gridColumn: "1 / -1" }}>
            <EventLog events={events} />
          </div>
        </main>
      </div>
    </section>
  );
}

const surface = {
  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 27, 0.98) 100%)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "18px",
  boxShadow: "0 18px 40px rgba(2, 6, 23, 0.32)",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top, rgba(30, 41, 59, 0.9) 0%, rgba(8, 15, 28, 0.98) 46%, rgba(2, 6, 23, 1) 100%)",
    color: "#f8fafc",
    fontFamily: '"Segoe UI", sans-serif',
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  shell: {
    maxWidth: "1520px",
    width: "100%",
    margin: "0 auto",
    padding: "16px",
    boxSizing: "border-box",
  },
  emptyState: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px",
    background:
      "radial-gradient(circle at top, rgba(30, 41, 59, 0.9) 0%, rgba(8, 15, 28, 0.98) 46%, rgba(2, 6, 23, 1) 100%)",
    color: "#f8fafc",
    fontFamily: '"Segoe UI", sans-serif',
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 4px",
    color: "#64748b",
    letterSpacing: "0.2em",
    fontSize: "0.74rem",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    lineHeight: 1,
    letterSpacing: "0.08em",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
  },
  emptyText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "1.1rem",
    letterSpacing: "0.08em",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    gridTemplateRows: "auto auto 180px auto",
    gap: "16px",
    alignItems: "stretch",
  },
  gridCell: {
    minWidth: 0,
    minHeight: 0,
    display: "flex",
  },
  healthPanel: {
    ...surface,
    width: "100%",
    padding: "16px",
    display: "grid",
    gridTemplateRows: "minmax(0, 1fr) auto",
    gap: "16px",
    minHeight: "100%",
    boxSizing: "border-box",
  },
  healthFactorsWrap: {
    minHeight: 0,
  },
  telemetryColumn: {
    width: "100%",
    display: "grid",
    gridTemplateRows: "repeat(5, minmax(0, 1fr))",
    gap: "16px",
    minHeight: "100%",
  },
  centerColumn: {
    width: "100%",
    display: "grid",
    gridTemplateRows: "minmax(280px, 1fr) auto auto",
    gap: "16px",
    minHeight: "100%",
  },
  sideColumn: {
    width: "100%",
    display: "grid",
    gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "16px",
    minHeight: "100%",
  },
  sidePanel: {
    minWidth: 0,
    minHeight: 0,
    display: "flex",
  },
  trendsPanel: {
    ...surface,
    width: "100%",
    height: "180px",
    padding: "12px 14px",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  metricCard: {
    ...surface,
    width: "100%",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  metricCardTitle: {
    margin: "0 0 8px",
    color: "#94a3b8",
    letterSpacing: "0.12em",
    fontSize: "0.72rem",
    textTransform: "uppercase",
  },
  metricRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "6px",
  },
  metricLabel: {
    color: "#cbd5e1",
    fontSize: "0.82rem",
    fontWeight: 600,
  },
  metricValue: {
    fontSize: "1.05rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  metricUnit: {
    color: "#94a3b8",
    fontSize: "0.76rem",
    fontWeight: 600,
  },
  progressTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
  },
  criticalFuelFill: {
    animation: "fuelCriticalPulse 1.2s infinite",
    boxShadow: "0 0 14px rgba(239, 68, 68, 0.55)",
  },
  signalStrip: {
    ...surface,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
    padding: "14px 16px",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  signalCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },
  signalLabel: {
    color: "#64748b",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
  },
  signalValue: {
    color: "#f8fafc",
    fontSize: "0.94rem",
    letterSpacing: "0.04em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
