from typing import Any


def calculate_health_index(metrics: dict[str, Any]) -> dict[str, Any]:
    health = 100
    reasons: list[str] = []
    recommendations: list[str] = []
    factor_impacts: dict[str, int] = {}
    alerts: list[dict[str, str]] = []
    alert_groups: dict[str, list[str]] = {
        "critical": [],
        "warning": [],
        "normal": [],
    }

    def add_alert(message: str, severity: str) -> None:
        for existing_alert in alerts:
            if existing_alert["message"] == message and existing_alert["severity"] == severity:
                return

        alerts.append({"message": message, "severity": severity})
        alert_groups[severity].append(message)

    def add_issue(
        condition: bool,
        penalty: int,
        reason: str,
        recommendation: str,
        factor_name: str,
        severity: str = "warning",
    ) -> None:
        nonlocal health
        if not condition:
            return

        health -= penalty
        factor_impacts[factor_name] = factor_impacts.get(factor_name, 0) - penalty

        if reason not in reasons:
            reasons.append(reason)

        if recommendation not in recommendations:
            recommendations.append(recommendation)

        add_alert(reason, severity)

    engine_temp = metrics.get("engine_temp_smoothed", metrics.get("engine_temp", 0))
    oil_temp = metrics.get("oil_temp", 0)
    oil_pressure = metrics.get("oil_pressure", 0)
    coolant_temp = metrics.get("coolant_temp", 0)
    fuel_level = metrics.get("fuel_level_smoothed", metrics.get("fuel_level", 0))
    voltage = metrics.get("voltage", 0)
    current = metrics.get("current", 0)
    brake_pressure = metrics.get("brake_pressure", 0)
    rpm = metrics.get("rpm", 0)
    speed = metrics.get("speed_smoothed", metrics.get("speed", 0))

    add_issue(
        engine_temp > 100,
        25,
        "Engine overheating",
        "Reduce engine load",
        "Engine temperature",
        "critical",
    )
    add_issue(
        coolant_temp > 100,
        15,
        "Coolant overheating",
        "Inspect cooling system",
        "Coolant temperature",
        "critical",
    )
    add_issue(
        oil_pressure < 2,
        25,
        "Low oil pressure",
        "Check oil system",
        "Pressure",
        "critical",
    )
    add_issue(
        oil_temp > 95,
        10,
        "High oil temperature",
        "Inspect oil cooling performance",
        "Oil temperature",
        "warning",
    )

    if fuel_level < 10:
        add_issue(
            True,
            30,
            "Critical fuel level",
            "Refuel immediately",
            "Fuel level",
            "critical",
        )
    elif fuel_level < 20:
        add_issue(
            True,
            20,
            "Low fuel",
            "Refuel soon",
            "Fuel level",
            "warning",
        )

    add_issue(
        brake_pressure < 4,
        20,
        "Brake system issue",
        "Inspect brake system",
        "Brake pressure",
        "critical",
    )
    add_issue(
        voltage < 550,
        10,
        "Low voltage",
        "Check electrical supply",
        "Voltage",
        "warning",
    )
    add_issue(
        current > 700,
        10,
        "High current load",
        "Reduce auxiliary electrical load",
        "Current load",
        "warning",
    )
    add_issue(
        rpm > 1800,
        10,
        "High engine load",
        "Reduce throttle and monitor engine load",
        "Engine load",
        "warning",
    )

    # Add explainable alert priorities without changing the core health score rules.
    if 85 <= engine_temp <= 100:
        add_alert("Engine temperature rising", "warning")

    if 20 <= fuel_level < 30:
        add_alert("Low fuel level", "warning")

    if oil_pressure > 5.5:
        add_alert("High oil pressure", "critical")

    if 2 <= oil_pressure < 3:
        add_alert("Oil pressure below optimal range", "warning")

    if metrics.get("alert"):
        add_alert("Critical system alert", "critical")

    health = max(0, health)
    factors = [
        {"name": name, "impact": impact}
        for name, impact in factor_impacts.items()
        if impact != 0
    ]
    # Show the strongest health contributors first.
    factors.sort(key=lambda factor: abs(factor["impact"]), reverse=True)
    factors = factors[:5]

    if health >= 80:
        status = "normal"
    elif health >= 50:
        status = "warning"
    else:
        status = "critical"

    if not alerts:
        add_alert("System stable", "normal")

    system_status = {
        "engine": {
            "status": "critical" if engine_temp > 100 else "warning" if engine_temp >= 85 else "normal",
            "message": "Overheating" if engine_temp > 100 else "Rising temperature" if engine_temp >= 85 else "Normal",
        },
        "fuel": {
            "status": "critical" if fuel_level < 20 else "warning" if fuel_level < 40 else "normal",
            "message": "Critical" if fuel_level < 20 else "Low" if fuel_level < 40 else "Normal",
        },
        "speed": {
            "status": "warning" if speed > 100 else "normal",
            "message": "High" if speed > 100 else "Normal",
        },
    }

    return {
        "health": health,
        "status": status,
        "reasons": reasons,
        "recommendations": recommendations,
        "factors": factors,
        "alerts": alerts,
        "alert_groups": alert_groups,
        "system_status": system_status,
    }


def calculate_health(metrics: dict[str, Any]) -> dict[str, Any]:
    return calculate_health_index(metrics)
