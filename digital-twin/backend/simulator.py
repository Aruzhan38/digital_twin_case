from __future__ import annotations

import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterator


EMA_ALPHA = 0.2


@dataclass
class SimulatorState:
    speed: float = 42.0
    rpm: float = 980.0
    engine_temp: float = 82.0
    oil_temp: float = 74.0
    oil_pressure: float = 4.3
    coolant_temp: float = 81.0
    fuel_level: float = 92.0
    voltage: float = 690.0
    current: float = 260.0
    brake_pressure: float = 7.6


_STATE = SimulatorState()
_PREVIOUS_VALUES: dict[str, float | None] = {
    "engine_temp": None,
    "speed": None,
    "fuel_level": None,
}


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _next_value(current: float, drift: float, minimum: float, maximum: float) -> float:
    updated = current + random.uniform(-drift, drift)
    return _clamp(updated, minimum, maximum)


def _apply_ema(name: str, current_value: float) -> float:
    previous_value = _PREVIOUS_VALUES.get(name)
    if previous_value is None:
        smoothed_value = current_value
    else:
        smoothed_value = EMA_ALPHA * current_value + (1 - EMA_ALPHA) * previous_value

    _PREVIOUS_VALUES[name] = smoothed_value
    return smoothed_value


def generate_simulated_data() -> dict[str, Any]:
    """
    Generate one telemetry snapshot for the digital twin.
    The function is designed to be called once per second by a scheduler,
    loop, background task, or WebSocket broadcaster.
    """
    global _STATE

    speed_target = _clamp(_STATE.speed + random.uniform(-8.0, 8.0), 0.0, 120.0)
    _STATE.speed = _clamp(_STATE.speed + (speed_target - _STATE.speed) * 0.35, 0.0, 120.0)
    target_rpm = 500.0 + (_STATE.speed / 120.0) * 1250.0 + random.uniform(-60.0, 60.0)
    _STATE.rpm = _clamp(_STATE.rpm + (target_rpm - _STATE.rpm) * 0.30, 500.0, 2000.0)

    load_factor = (_STATE.rpm - 500.0) / 1500.0
    target_engine_temp = 74.0 + load_factor * 28.0 + random.uniform(-1.0, 1.0)
    target_oil_temp = 66.0 + load_factor * 24.0 + random.uniform(-1.0, 1.0)
    target_coolant_temp = 75.0 + load_factor * 22.0 + random.uniform(-1.0, 1.0)
    target_oil_pressure = 3.0 + load_factor * 2.1 + random.uniform(-0.2, 0.2)
    target_voltage = 560.0 + load_factor * 260.0 + random.uniform(-12.0, 12.0)
    target_current = 120.0 + load_factor * 560.0 + random.uniform(-20.0, 20.0)
    brake_target = 8.8 - (_STATE.speed / 120.0) * 3.2 + random.uniform(-0.3, 0.3)

    _STATE.engine_temp = _clamp(_STATE.engine_temp + (target_engine_temp - _STATE.engine_temp) * 0.25, 70.0, 110.0)
    _STATE.oil_temp = _clamp(_STATE.oil_temp + (target_oil_temp - _STATE.oil_temp) * 0.25, 60.0, 100.0)
    _STATE.coolant_temp = _clamp(_STATE.coolant_temp + (target_coolant_temp - _STATE.coolant_temp) * 0.25, 70.0, 105.0)
    _STATE.oil_pressure = _clamp(_STATE.oil_pressure + (target_oil_pressure - _STATE.oil_pressure) * 0.30, 2.0, 6.0)
    _STATE.voltage = _clamp(_STATE.voltage + (target_voltage - _STATE.voltage) * 0.35, 500.0, 900.0)
    _STATE.current = _clamp(_STATE.current + (target_current - _STATE.current) * 0.35, 100.0, 800.0)
    _STATE.brake_pressure = _clamp(_STATE.brake_pressure + (brake_target - _STATE.brake_pressure) * 0.30, 3.0, 10.0)
    _STATE.fuel_level = _clamp(_STATE.fuel_level - random.uniform(0.05, 0.18), 10.0, 100.0)

    if random.random() < 0.10:
        scenario = random.choice(["overheat", "oil_drop", "low_fuel", "brake_issue"])
        if scenario == "overheat":
            _STATE.engine_temp = _clamp(_STATE.engine_temp + random.uniform(5.0, 10.0), 70.0, 110.0)
            _STATE.coolant_temp = _clamp(_STATE.coolant_temp + random.uniform(3.0, 8.0), 70.0, 105.0)
        elif scenario == "oil_drop":
            _STATE.oil_pressure = _clamp(_STATE.oil_pressure - random.uniform(1.4, 2.5), 0.5, 6.0)
        elif scenario == "low_fuel":
            _STATE.fuel_level = _clamp(_STATE.fuel_level - random.uniform(4.0, 9.0), 10.0, 100.0)
        else:
            _STATE.brake_pressure = _clamp(_STATE.brake_pressure - random.uniform(1.3, 2.4), 3.0, 10.0)

    alert = any(
        [
            _STATE.engine_temp > 100.0,
            _STATE.oil_pressure < 2.0,
            _STATE.fuel_level < 20.0,
            _STATE.brake_pressure < 4.0,
        ]
    )

    speed = round(_STATE.speed, 1)
    engine_temp = round(_STATE.engine_temp, 1)
    fuel_level = round(_STATE.fuel_level, 1)

    speed_smoothed = round(_apply_ema("speed", speed), 1)
    engine_temp_smoothed = round(_apply_ema("engine_temp", engine_temp), 1)
    fuel_level_smoothed = round(_apply_ema("fuel_level", fuel_level), 1)

    return {
        "speed": speed,
        "speed_smoothed": speed_smoothed,
        "rpm": round(_STATE.rpm),
        "engine_temp": engine_temp,
        "engine_temp_smoothed": engine_temp_smoothed,
        "oil_temp": round(_STATE.oil_temp, 1),
        "oil_pressure": round(_STATE.oil_pressure, 2),
        "coolant_temp": round(_STATE.coolant_temp, 1),
        "fuel_level": fuel_level,
        "fuel_level_smoothed": fuel_level_smoothed,
        "voltage": round(_STATE.voltage, 1),
        "current": round(_STATE.current, 1),
        "brake_pressure": round(_STATE.brake_pressure, 2),
        "alert": alert,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def generate_data() -> dict[str, Any]:
    return generate_simulated_data()


def stream_simulated_data(interval_seconds: float = 1.0) -> Iterator[dict[str, Any]]:
    while True:
        yield generate_simulated_data()
        time.sleep(interval_seconds)
