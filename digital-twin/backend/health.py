from typing import Any


def calculate_health_index(metrics: dict[str, Any]) -> dict[str, Any]:
    health = 100
    reasons: list[str] = []
    recommendations: list[str] = []

    def add_issue(
        condition: bool,
        penalty: int,
        reason: str,
        recommendation: str,
    ) -> None:
        nonlocal health
        if not condition:
            return

        health -= penalty

        if reason not in reasons:
            reasons.append(reason)

        if recommendation not in recommendations:
            recommendations.append(recommendation)

    engine_temp = metrics.get("engine_temp", 0)
    oil_temp = metrics.get("oil_temp", 0)
    oil_pressure = metrics.get("oil_pressure", 0)
    coolant_temp = metrics.get("coolant_temp", 0)
    fuel_level = metrics.get("fuel_level", 0)
    voltage = metrics.get("voltage", 0)
    current = metrics.get("current", 0)
    brake_pressure = metrics.get("brake_pressure", 0)
    rpm = metrics.get("rpm", 0)

    add_issue(
        engine_temp > 100,
        25,
        "Engine overheating",
        "Reduce engine load",
    )
    add_issue(
        coolant_temp > 100,
        15,
        "Coolant overheating",
        "Inspect cooling system",
    )
    add_issue(
        oil_pressure < 2,
        25,
        "Low oil pressure",
        "Check oil system",
    )
    add_issue(
        oil_temp > 95,
        10,
        "High oil temperature",
        "Inspect oil cooling performance",
    )

    if fuel_level < 10:
        add_issue(
            True,
            30,
            "Critical fuel level",
            "Refuel immediately",
        )
    elif fuel_level < 20:
        add_issue(
            True,
            20,
            "Low fuel",
            "Refuel soon",
        )

    add_issue(
        brake_pressure < 4,
        20,
        "Brake system issue",
        "Inspect brake system",
    )
    add_issue(
        voltage < 550,
        10,
        "Low voltage",
        "Check electrical supply",
    )
    add_issue(
        current > 700,
        10,
        "High current load",
        "Reduce auxiliary electrical load",
    )
    add_issue(
        rpm > 1800,
        10,
        "High engine load",
        "Reduce throttle and monitor engine load",
    )

    health = max(0, health)

    if health >= 80:
        status = "normal"
    elif health >= 50:
        status = "warning"
    else:
        status = "critical"

    return {
        "health": health,
        "status": status,
        "reasons": reasons,
        "recommendations": recommendations,
    }


def calculate_health(metrics: dict[str, Any]) -> dict[str, Any]:
    return calculate_health_index(metrics)
