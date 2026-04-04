from __future__ import annotations

import os
from typing import Any


ENGINE_TEMP_WARNING = float(os.getenv("ENGINE_TEMP_WARNING", "85"))
ENGINE_TEMP_CRITICAL = float(os.getenv("ENGINE_TEMP_CRITICAL", "100"))
FUEL_WARNING = float(os.getenv("FUEL_WARNING", "30"))
FUEL_CRITICAL = float(os.getenv("FUEL_CRITICAL", "15"))
BRAKE_PRESSURE_WARNING = float(os.getenv("BRAKE_PRESSURE_WARNING", "4.5"))
BRAKE_PRESSURE_CRITICAL = float(os.getenv("BRAKE_PRESSURE_CRITICAL", "3.8"))
HEALTH_WARNING_THRESHOLD = int(os.getenv("HEALTH_WARNING_THRESHOLD", "80"))
HEALTH_CRITICAL_THRESHOLD = int(os.getenv("HEALTH_CRITICAL_THRESHOLD", "50"))


def calculate_health_index(metrics: dict[str, Any]) -> dict[str, Any]:
    health = 100
    reasons: list[str] = []
    recommendations: list[str] = []
    factor_impacts: dict[str, int] = {}
    alerts: list[dict[str, str]] = []
    alert_groups: dict[str, list[str]] = {"critical": [], "warning": [], "normal": [], "info": []}

    engine_temp = float(
        metrics.get("engine_temp_smoothed", metrics.get("temperature_engine", metrics.get("engine_temp", 0)))
    )
    fuel_level = float(metrics.get("fuel_level_smoothed", metrics.get("fuel_level", 0)))
    brake_pressure = float(metrics.get("pressure_brake", metrics.get("brake_pressure", 0)))
    oil_pressure = float(metrics.get("oil_pressure", 0))
    coolant_temp = float(metrics.get("coolant_temp", 0))
    voltage = float(metrics.get("voltage", 0))
    current = float(metrics.get("current", 0))
    rpm = float(metrics.get("rpm", 0))
    speed = float(metrics.get("speed_smoothed", metrics.get("speed", 0)))
    alert_flag = bool(metrics.get("alert", False))
    anomaly = metrics.get("anomaly")
    engine_state = metrics.get("engine_state", "running")
    fuel_refilled = bool(metrics.get("fuel_refilled", False))

    def add_unique(items: list[str], value: str) -> None:
        if value not in items:
            items.append(value)

    def add_alert(message: str, severity: str) -> None:
        if any(item["message"] == message and item["severity"] == severity for item in alerts):
            return

        alerts.append({"message": message, "severity": severity})
        alert_groups[severity].append(message)

    def add_recommendation(value: str) -> None:
        add_unique(recommendations, value)

    def add_penalty(name: str, penalty: int, reason: str, recommendation: str, severity: str) -> None:
        nonlocal health
        health -= penalty
        factor_impacts[name] = factor_impacts.get(name, 0) - penalty
        add_unique(reasons, reason)
        add_recommendation(recommendation)
        add_alert(reason, severity)

    if fuel_level <= 0:
        add_penalty("Топливо", 40, "Топливо закончилось", "Немедленно остановить поезд и заправить", "critical")
    elif fuel_level <= FUEL_CRITICAL:
        add_penalty("Топливо", 20, "Критический уровень топлива", "Заправить топливо", "critical")
    elif fuel_level <= FUEL_WARNING:
        add_penalty("Топливо", 10, "Низкий уровень топлива", "Заправить топливо", "warning")

    if engine_temp >= ENGINE_TEMP_CRITICAL:
        add_penalty("Температура двигателя", 22, "Перегрев двигателя", "Остановить поезд и проверить систему охлаждения", "critical")
    elif engine_temp >= ENGINE_TEMP_WARNING:
        add_penalty("Температура двигателя", 10, "Температура двигателя растёт", "Снизить нагрузку", "warning")

    if coolant_temp >= ENGINE_TEMP_CRITICAL:
        add_penalty("Охлаждение", 10, "Перегрев системы охлаждения", "Проверить систему охлаждения", "critical")

    if brake_pressure <= BRAKE_PRESSURE_CRITICAL or oil_pressure < 1.8:
        add_penalty("Давление", 20, "Проблема с давлением", "Проверить тормозную систему", "critical")
    elif brake_pressure <= BRAKE_PRESSURE_WARNING or oil_pressure < 2.6:
        add_penalty("Давление", 10, "Давление ниже нормы", "Проверить тормозную систему", "warning")

    if alert_flag:
        add_penalty("Сигналы", 15, "Критический системный сигнал", "Проверить систему: обнаружена ошибка", "critical")

    if voltage < 560:
        add_penalty("Электрика", 6, "Низкое напряжение", "Проверить электросистему", "warning")

    if current > 720 or rpm > 1850:
        add_penalty("Нагрузка", 6, "Высокая тяговая нагрузка", "Снизить нагрузку", "warning")

    if engine_state == "stopped" and fuel_level <= 0:
        add_unique(reasons, "Поезд остановлен из-за отсутствия топлива")
        add_recommendation("Немедленно остановить поезд и заправить")

    if fuel_refilled:
        add_alert("Заправка выполнена", "info")
        add_recommendation("Заправка выполнена")

    if anomaly == "electrical_surge":
        add_alert("Скачок напряжения", "critical")
        add_recommendation("Проверить электросистему")
    elif anomaly == "fuel_drop":
        add_alert("Резкое падение топлива", "warning")
        add_recommendation("Заправить топливо")
    elif anomaly == "brake_drop":
        add_alert("Падение тормозного давления", "critical")
        add_recommendation("Проверить тормозную систему")
    elif anomaly == "engine_spike":
        add_alert("Температурный всплеск", "warning")
        add_recommendation("Снизить нагрузку на двигатель")

    # Recommendation rules are applied independently from scoring so operator actions are always explicit.
    if fuel_level < 20:
        add_recommendation("Заправить топливо")
    if fuel_level <= 0:
        add_recommendation("Немедленно остановить поезд и заправить")

    if engine_temp > 90:
        add_recommendation("Снизить нагрузку на двигатель")
    if engine_temp > 100:
        add_recommendation("Остановить поезд и проверить систему охлаждения")

    if brake_pressure < BRAKE_PRESSURE_WARNING or oil_pressure < 2.6:
        add_recommendation("Проверить тормозную систему")

    if voltage < 560 or current > 720:
        add_recommendation("Проверить электросистему")

    if alert_flag or alerts:
        add_recommendation("Проверить систему: обнаружена ошибка")

    if health < HEALTH_CRITICAL_THRESHOLD:
        status = "Критично"
    elif health < HEALTH_WARNING_THRESHOLD:
        status = "Внимание"
    else:
        status = "Норма"

    if not alerts:
        add_alert("Система стабильна", "normal")
    elif not recommendations:
        add_recommendation("Проверить систему")

    health = max(0, min(100, int(round(health))))

    factors = [{"name": name, "impact": impact} for name, impact in factor_impacts.items() if impact != 0]
    factors.sort(key=lambda factor: abs(factor["impact"]), reverse=True)
    factors = factors[:5]
    recommendations = recommendations[:5]

    system_status = {
        "engine": {
            "status": "critical" if engine_temp >= ENGINE_TEMP_CRITICAL else "warning" if engine_temp >= ENGINE_TEMP_WARNING else "normal",
            "state": "stopped" if engine_state == "stopped" else "overheating" if engine_temp >= ENGINE_TEMP_WARNING else "normal",
            "message": "Остановлен" if engine_state == "stopped" else "Перегрев" if engine_temp >= ENGINE_TEMP_CRITICAL else "Внимание" if engine_temp >= ENGINE_TEMP_WARNING else "Норма",
        },
        "fuel": {
            "status": "critical" if fuel_level <= 0 or fuel_level <= FUEL_CRITICAL else "warning" if fuel_level <= FUEL_WARNING else "normal",
            "state": "empty" if fuel_level <= 0 else "low" if fuel_level <= FUEL_WARNING else "normal",
            "message": "Пусто" if fuel_level <= 0 else "Низкий уровень" if fuel_level <= FUEL_WARNING else "Норма",
        },
        "speed": {
            "status": "critical" if fuel_level <= 0 and speed <= 0 else "warning" if speed > 105 else "normal",
            "state": "stopped" if speed <= 0.5 else "high" if speed > 105 else "normal",
            "message": "Остановлен" if speed <= 0.5 else "Высокая" if speed > 105 else "Норма",
        },
    }

    return {
        "health": health,
        "status": status,
        "status_code": "critical" if status == "Критично" else "warning" if status == "Внимание" else "normal",
        "factors": factors,
        "reasons": reasons,
        "recommendations": recommendations,
        "alerts": alerts,
        "alert_groups": alert_groups,
        "system_status": system_status,
    }


def calculate_health(metrics: dict[str, Any]) -> dict[str, Any]:
    return calculate_health_index(metrics)
