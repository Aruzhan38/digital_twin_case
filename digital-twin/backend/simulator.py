from __future__ import annotations

import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterator

@dataclass
class SimulatorState:
    speed: float = 62.0
    temperature: float = 78.0
    fuel: float = 86.0
    pressure: float = 2.4

_STATE = SimulatorState()
def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))

def _next_value(current: float, drift: float, minimum: float, maximum: float) -> float:
    updated = current + random.uniform(-drift, drift)
    return _clamp(updated, minimum, maximum)


def generate_simulated_data() -> dict[str, Any]:
    """
    Generate one telemetry snapshot for the digital twin.
    The function is designed to be called once per second by a scheduler,
    loop, background task, or WebSocket broadcaster.
    """

    global _STATE
    _STATE.speed = _next_value(_STATE.speed, drift=7.0, minimum=0.0, maximum=140.0)
    _STATE.temperature = _next_value(_STATE.temperature, drift=2.5, minimum=55.0, maximum=112.0)
    _STATE.pressure = _next_value(_STATE.pressure, drift=0.12, minimum=1.4, maximum=3.9)
    _STATE.fuel = _clamp(_STATE.fuel - random.uniform(0.1, 0.6), 0.0, 100.0)

    anomaly_roll = random.random()
    alert = "normal"

    if anomaly_roll < 0.08:
        scenario = random.choice(
            [
                "engine_overheat",
                "pressure_drop",
                "fuel_critical",
                "overspeed",
            ]
        )

        if scenario == "engine_overheat":
            _STATE.temperature = _clamp(_STATE.temperature + random.uniform(12.0, 22.0), 55.0, 130.0)
            alert = "critical"
        elif scenario == "pressure_drop":
            _STATE.pressure = _clamp(_STATE.pressure - random.uniform(0.7, 1.2), 0.8, 3.9)
            alert = "warning"
        elif scenario == "fuel_critical":
            _STATE.fuel = _clamp(_STATE.fuel - random.uniform(12.0, 25.0), 0.0, 100.0)
            alert = "critical"
        else:
            _STATE.speed = _clamp(_STATE.speed + random.uniform(20.0, 35.0), 0.0, 160.0)
            alert = "warning"
    else:
        if _STATE.temperature >= 95 or _STATE.fuel <= 18 or _STATE.pressure <= 1.2 or _STATE.speed >= 120:
            alert = "warning"
        if _STATE.temperature >= 108 or _STATE.fuel <= 8 or _STATE.pressure <= 0.95:
            alert = "critical"

    return {
        "speed": round(_STATE.speed, 1),
        "temperature": round(_STATE.temperature, 1),
        "fuel": round(_STATE.fuel, 1),
        "pressure": round(_STATE.pressure, 2),
        "alert": alert,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
def stream_simulated_data(interval_seconds: float = 1.0) -> Iterator[dict[str, Any]]:
    while True:
        yield generate_simulated_data()
        time.sleep(interval_seconds)
