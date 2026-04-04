from __future__ import annotations

import os
from collections import deque
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any


_RETENTION_SECONDS = int(os.getenv("HISTORY_RETENTION_SECONDS", "600"))
history: deque[dict[str, Any]] = deque()
_lock = Lock()


def _parse_timestamp(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.now(timezone.utc)


def _event_timestamp(event: dict[str, Any]) -> str | None:
    if "timestamp" in event:
        return event.get("timestamp")

    telemetry = event.get("telemetry") or {}
    return telemetry.get("timestamp") or event.get("generated_at")


def _trim_history_locked(reference_time: datetime | None = None) -> None:
    cutoff = (reference_time or datetime.now(timezone.utc)) - timedelta(seconds=_RETENTION_SECONDS)

    while history:
        oldest = history[0]
        if _parse_timestamp(_event_timestamp(oldest)) >= cutoff:
            break
        history.popleft()


def add_event(event: dict[str, Any]) -> None:
    timestamp = _event_timestamp(event)

    with _lock:
        # Ignore duplicated events with the same timestamp to keep replay stable.
        if history and _event_timestamp(history[-1]) == timestamp:
            return

        history.append(event)
        _trim_history_locked(_parse_timestamp(timestamp))


def get_history(range_minutes: int | None = None) -> list[dict[str, Any]]:
    with _lock:
        _trim_history_locked()
        items = list(history)

    items.sort(key=lambda item: _parse_timestamp(_event_timestamp(item)))

    if range_minutes is None:
        return items.copy()

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=max(range_minutes, 0))
    return [item for item in items if _parse_timestamp(_event_timestamp(item)) >= cutoff]


def save(event: dict[str, Any]) -> None:
    add_event(event)
