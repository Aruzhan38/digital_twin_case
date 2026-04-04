from __future__ import annotations

import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Iterator

from pydantic import BaseModel, ConfigDict, Field


EMA_ALPHA = 0.2


@dataclass
class SimulatorState:
    speed: float = 48.0
    rpm: float = 1120.0
    engine_temp: float = 84.0
    oil_temp: float = 76.0
    oil_pressure: float = 4.2
    coolant_temp: float = 80.0
    fuel_level: float = 88.0
    voltage: float = 705.0
    current: float = 240.0
    brake_pressure: float = 7.3


class TelemetryPoint(BaseModel):
    model_config = ConfigDict(extra="forbid")

    speed: float = Field(ge=0, le=160)
    fuel_level: float = Field(ge=0, le=100)
    temperature_engine: float = Field(ge=0, le=160)
    temperature_oil: float = Field(ge=0, le=150)
    pressure_brake: float = Field(ge=0, le=12)
    voltage: float = Field(ge=0, le=1000)
    current: float = Field(ge=0, le=1200)
    rpm: int = Field(ge=0, le=4000)
    alert: bool
    timestamp: str
    coolant_temp: float = Field(ge=0, le=150)
    oil_pressure: float = Field(ge=0, le=10)
    anomaly: str | None = None
    speed_smoothed: float = Field(ge=0, le=160)
    engine_temp_smoothed: float = Field(ge=0, le=160)
    fuel_level_smoothed: float = Field(ge=0, le=100)
    engine_temp: float = Field(ge=0, le=160)
    oil_temp: float = Field(ge=0, le=150)
    brake_pressure: float = Field(ge=0, le=12)
    engine_state: str


_STATE = SimulatorState()
_PREVIOUS_VALUES: dict[str, float | None] = {
    "engine_temp": None,
    "speed": None,
    "fuel_level": None,
}
_LAST_TIMESTAMP: str | None = None


def _dump_model(model: BaseModel) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _apply_ema(name: str, current_value: float) -> float:
    previous_value = _PREVIOUS_VALUES.get(name)
    if previous_value is None:
        smoothed_value = current_value
    else:
        smoothed_value = EMA_ALPHA * current_value + (1 - EMA_ALPHA) * previous_value

    _PREVIOUS_VALUES[name] = smoothed_value
    return smoothed_value


def _next_timestamp() -> str:
    global _LAST_TIMESTAMP

    current_time = datetime.now(timezone.utc)
    timestamp = current_time.isoformat()

    if _LAST_TIMESTAMP == timestamp:
        timestamp = (current_time + timedelta(milliseconds=1)).isoformat()

    _LAST_TIMESTAMP = timestamp
    return timestamp


def _apply_noise(value: float, noise: float) -> float:
    return value + random.uniform(-noise, noise)


def _apply_anomaly() -> str | None:
    global _STATE

    if random.random() >= 0.08:
        return None

    anomaly = random.choice(["engine_spike", "fuel_drop", "brake_drop", "electrical_surge"])

    if anomaly == "engine_spike":
        _STATE.engine_temp = _clamp(_STATE.engine_temp + random.uniform(7.0, 14.0), 60.0, 125.0)
        _STATE.oil_temp = _clamp(_STATE.oil_temp + random.uniform(5.0, 10.0), 55.0, 120.0)
        _STATE.coolant_temp = _clamp(_STATE.coolant_temp + random.uniform(4.0, 9.0), 60.0, 120.0)
    elif anomaly == "fuel_drop":
        _STATE.fuel_level = _clamp(_STATE.fuel_level - random.uniform(3.0, 8.0), 0.0, 100.0)
    elif anomaly == "brake_drop":
        _STATE.brake_pressure = _clamp(_STATE.brake_pressure - random.uniform(1.2, 2.4), 0.8, 10.0)
        _STATE.oil_pressure = _clamp(_STATE.oil_pressure - random.uniform(0.6, 1.8), 0.5, 7.0)
    else:
        _STATE.voltage = _clamp(_STATE.voltage + random.uniform(40.0, 90.0), 450.0, 920.0)
        _STATE.current = _clamp(_STATE.current + random.uniform(50.0, 120.0), 80.0, 950.0)

    return anomaly


def generate_simulated_data() -> dict[str, Any]:
    global _STATE

    speed_target = _clamp(_STATE.speed + random.uniform(-10.0, 10.0), 0.0, 120.0)

    if _STATE.fuel_level <= 0:
        speed_target = 0.0

    if _STATE.engine_temp >= 105.0:
        speed_target = min(speed_target, max(_STATE.speed - 6.0, 18.0))
    elif _STATE.engine_temp >= 95.0:
        speed_target = min(speed_target, max(_STATE.speed - 3.0, 28.0))

    _STATE.speed = _clamp(_STATE.speed + (speed_target - _STATE.speed) * 0.32, 0.0, 120.0)

    if _STATE.fuel_level <= 0:
        _STATE.speed = max(_STATE.speed - 5.0, 0.0)

    target_rpm = 520.0 + (_STATE.speed / 120.0) * 1440.0 + random.uniform(-80.0, 80.0)
    if _STATE.fuel_level <= 0 or _STATE.speed <= 0:
        target_rpm = 420.0 + random.uniform(-30.0, 30.0)

    _STATE.rpm = _clamp(_STATE.rpm + (target_rpm - _STATE.rpm) * 0.28, 450.0, 2400.0)

    load_factor = (_STATE.rpm - 450.0) / 1950.0
    _STATE.engine_temp = _clamp(
        _STATE.engine_temp + (_apply_noise(76.0 + load_factor * 27.0, 1.5) - _STATE.engine_temp) * 0.24,
        65.0,
        120.0,
    )
    _STATE.oil_temp = _clamp(
        _STATE.oil_temp + (_apply_noise(68.0 + load_factor * 24.0, 1.3) - _STATE.oil_temp) * 0.24,
        55.0,
        115.0,
    )
    _STATE.coolant_temp = _clamp(
        _STATE.coolant_temp + (_apply_noise(73.0 + load_factor * 22.0, 1.0) - _STATE.coolant_temp) * 0.24,
        60.0,
        115.0,
    )
    _STATE.oil_pressure = _clamp(
        _STATE.oil_pressure + (_apply_noise(3.2 + load_factor * 2.1, 0.2) - _STATE.oil_pressure) * 0.26,
        1.0,
        7.0,
    )
    _STATE.brake_pressure = _clamp(
        _STATE.brake_pressure + (_apply_noise(8.7 - (_STATE.speed / 120.0) * 3.4, 0.25) - _STATE.brake_pressure) * 0.28,
        2.0,
        10.0,
    )
    _STATE.voltage = _clamp(
        _STATE.voltage + (_apply_noise(575.0 + load_factor * 240.0, 12.0) - _STATE.voltage) * 0.32,
        450.0,
        900.0,
    )
    _STATE.current = _clamp(
        _STATE.current + (_apply_noise(150.0 + load_factor * 480.0, 24.0) - _STATE.current) * 0.30,
        80.0,
        900.0,
    )
    _STATE.fuel_level = _clamp(_STATE.fuel_level - random.uniform(0.05, 0.16), 0.0, 100.0)

    anomaly = _apply_anomaly()

    if _STATE.fuel_level <= 0:
        _STATE.speed = max(_STATE.speed - 5.0, 0.0)
        _STATE.rpm = _clamp(_STATE.rpm - random.uniform(120.0, 240.0), 450.0, 1200.0)

    speed = round(_STATE.speed, 1)
    engine_temp = round(_STATE.engine_temp, 1)
    fuel_level = round(_STATE.fuel_level, 1)
    engine_state = "stopped" if fuel_level <= 0 or speed <= 0.5 else "running"

    alert = any(
        [
            _STATE.engine_temp > 102.0,
            _STATE.oil_pressure < 1.8,
            _STATE.brake_pressure < 3.8,
            _STATE.fuel_level <= 0 or _STATE.fuel_level < 15.0,
            anomaly == "electrical_surge",
        ]
    )

    telemetry = TelemetryPoint(
        speed=speed,
        fuel_level=fuel_level,
        temperature_engine=engine_temp,
        temperature_oil=round(_STATE.oil_temp, 1),
        pressure_brake=round(_STATE.brake_pressure, 2),
        voltage=round(_STATE.voltage, 1),
        current=round(_STATE.current, 1),
        rpm=round(_STATE.rpm),
        alert=alert,
        timestamp=_next_timestamp(),
        coolant_temp=round(_STATE.coolant_temp, 1),
        oil_pressure=round(_STATE.oil_pressure, 2),
        anomaly=anomaly,
        speed_smoothed=round(_apply_ema("speed", speed), 1),
        engine_temp_smoothed=round(_apply_ema("engine_temp", engine_temp), 1),
        fuel_level_smoothed=round(_apply_ema("fuel_level", fuel_level), 1),
        engine_temp=engine_temp,
        oil_temp=round(_STATE.oil_temp, 1),
        brake_pressure=round(_STATE.brake_pressure, 2),
        engine_state=engine_state,
    )

    return _dump_model(telemetry)


def generate_data() -> dict[str, Any]:
    return generate_simulated_data()


def stream_simulated_data(interval_seconds: float = 1.0) -> Iterator[dict[str, Any]]:
    while True:
        yield generate_simulated_data()
        time.sleep(interval_seconds)
