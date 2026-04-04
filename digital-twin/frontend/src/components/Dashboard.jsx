import React, { useMemo, useState } from "react";

import Alerts from "./Alerts.jsx";
import Charts from "./Charts.jsx";
import ConnectionStatus from "./ConnectionStatus.jsx";
import ExportButton from "./ExportButton.jsx";
import HealthFactors from "./HealthFactors.jsx";
import HealthIndex from "./HealthIndex.jsx";
import LoadControl from "./LoadControl.jsx";
import MiniMap from "./MiniMap.jsx";
import Recommendations from "./Recommendations.jsx";
import Replay from "./Replay.jsx";
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
    <section style={{ ...styles.compactCard, ...(accent ? { borderColor: accent } : null) }}>
      <p style={styles.compactTitle}>{title}</p>
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

export default function Dashboard({
  connectionStatus,
  data,
  eventsPerSecond,
  history,
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
    return source.slice(-24);
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
    system_status: systemStatus,
    timestamp,
    voltage,
  } = activeData;

  const translatedAlerts = translateAlertGroups(alertGroups);
  const translatedSystemStatus = translateSystemStatus(systemStatus);

  return (
    <section style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.topBar}>
          <div>
            <p style={styles.kicker}>ЛОКОМОТИВНЫЙ МОНИТОРИНГ</p>
            <h1 style={styles.title}>КАБИНА</h1>
          </div>
          <div style={styles.topRight}>
            <ExportButton />
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        <main style={styles.layout}>
          <section style={styles.topRow}>
            <div style={styles.panelBox}>
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
            <div style={styles.healthBox}>
              <HealthIndex health={health} status={status || statusCode} />
            </div>
            <div style={styles.panelBox}>
              <SystemStatus systemStatus={translatedSystemStatus} />
            </div>
          </section>

          <section style={styles.middleRow}>
            <div style={styles.telemetryColumn}>
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
                  {metricRow("Уровень", fuelLevel, "%", fuelLevel < 20 ? "#ef4444" : fuelLevel < 40 ? "#f59e0b" : "#22c55e")}
                  {progressBar(fuelLevel, "linear-gradient(90deg, #22c55e 0%, #f59e0b 70%, #ef4444 100%)")}
                  {metricRow("Напряжение", voltage, "В")}
                </>,
                "rgba(34, 197, 94, 0.34)"
              )}
              {card(
                "ДАВЛЕНИЕ",
                <>
                  {metricRow("Тормоз", brakePressure, "бар", brakePressure < 4 ? "#ef4444" : "#f8fafc")}
                  {metricRow("Масло", oilPressure, "бар", oilPressure < 2 ? "#ef4444" : oilPressure < 3 ? "#f59e0b" : "#f8fafc")}
                </>,
                "rgba(249, 115, 22, 0.34)"
              )}
              {card(
                "ТЕМПЕРАТУРА",
                <>
                  {metricRow("Двигатель", engineTemp, "°C", engineTemp > 100 ? "#ef4444" : engineTemp >= 85 ? "#f59e0b" : "#f8fafc")}
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
                "rgba(168, 85, 247, 0.3)"
              )}
            </div>

            <div style={styles.centerColumn}>
              <MiniMap speed={speed} timestamp={timestamp} />
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
            </div>

            <div style={styles.rightColumn}>
              <Alerts alertGroups={translatedAlerts} />
              <HealthFactors factors={factors} />
              <Recommendations recommendations={recommendations} />
            </div>
          </section>

          <section style={styles.bottomRow}>
            <div style={styles.bottomCharts}>
              <Charts compact data={chartData} />
            </div>
            <div style={styles.bottomReplay}>
              <Replay
                onReplayDataChange={setReplayData}
                onReplayFrameChange={setReplayFrame}
                onReplayModeChange={setIsReplayMode}
                replayActive={isReplayMode}
              />
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 48%, #020617 100%)",
    color: "#f8fafc",
    fontFamily: '"Segoe UI", sans-serif',
    boxSizing: "border-box",
  },
  shell: {
    maxWidth: "1520px",
    width: "100%",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "12px",
    display: "grid",
    gridTemplateRows: "auto auto",
    gap: "12px",
    boxSizing: "border-box",
    overflow: "visible",
  },
  emptyState: {
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px",
    background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 48%, #020617 100%)",
    color: "#f8fafc",
    fontFamily: '"Segoe UI", sans-serif',
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    minHeight: "48px",
    maxWidth: "100%",
    overflow: "hidden",
  },
  kicker: {
    margin: "0 0 4px",
    color: "#64748b",
    letterSpacing: "0.18em",
    fontSize: "0.74rem",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    lineHeight: 1,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    maxWidth: "100%",
    overflow: "hidden",
  },
  emptyText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "1.1rem",
    letterSpacing: "0.08em",
  },
  layout: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto auto auto",
    gap: "12px",
    maxWidth: "100%",
    overflow: "visible",
  },
  topRow: {
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) minmax(340px, 1.1fr) minmax(260px, 1fr)",
    gap: "12px",
    maxWidth: "100%",
    overflow: "visible",
  },
  middleRow: {
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(250px, 0.95fr) minmax(340px, 1.15fr) minmax(300px, 1fr)",
    gap: "12px",
    maxWidth: "100%",
    alignItems: "start",
    overflow: "visible",
  },
  bottomRow: {
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 0.95fr)",
    gap: "12px",
    maxWidth: "100%",
    overflow: "visible",
  },
  bottomCharts: {
    minHeight: 0,
    borderRadius: "22px",
    background: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    padding: "8px 10px",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  bottomReplay: {
    minHeight: 0,
    overflow: "hidden",
  },
  panelBox: {
    minHeight: 0,
    maxWidth: "100%",
    overflow: "hidden",
  },
  healthBox: {
    minHeight: 0,
    display: "grid",
    alignItems: "center",
    maxWidth: "100%",
    overflow: "hidden",
  },
  telemetryColumn: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "repeat(5, minmax(82px, auto))",
    gap: "8px",
    maxWidth: "100%",
    overflow: "visible",
  },
  centerColumn: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "minmax(220px, auto) auto",
    gap: "8px",
    maxWidth: "100%",
    overflow: "visible",
  },
  rightColumn: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "minmax(220px, auto) auto auto",
    gap: "8px",
    overflow: "visible",
    maxWidth: "100%",
  },
  compactCard: {
    minHeight: 0,
    height: "100%",
    maxWidth: "100%",
    padding: "8px 10px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.95) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    boxShadow: "0 14px 30px rgba(2, 6, 23, 0.26)",
    overflow: "visible",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  compactTitle: {
    margin: "0 0 6px",
    color: "#94a3b8",
    letterSpacing: "0.12em",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bigValue: {
    marginBottom: "6px",
    fontSize: "1.8rem",
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bigUnit: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  metricRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "4px",
    minWidth: 0,
  },
  metricLabel: {
    color: "#cbd5e1",
    fontSize: "0.8rem",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  metricValue: {
    fontSize: "0.92rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metricUnit: {
    fontSize: "0.66rem",
    color: "#94a3b8",
  },
  progressTrack: {
    width: "100%",
    height: "9px",
    borderRadius: "999px",
    backgroundColor: "rgba(51, 65, 85, 0.9)",
    overflow: "hidden",
    marginBottom: "6px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
  },
  signalStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "8px",
    maxWidth: "100%",
  },
  signalCell: {
    padding: "8px 10px",
    borderRadius: "14px",
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  signalLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#64748b",
    fontSize: "0.66rem",
    letterSpacing: "0.12em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  signalValue: {
    color: "#f8fafc",
    fontSize: "0.86rem",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
