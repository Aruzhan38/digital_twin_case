from threading import Lock


# Store recent telemetry events in memory.
history = []
_lock = Lock()
_MAX_HISTORY = 300


def add_event(event: dict) -> None:
    # Append the new event and keep only the latest 300 items.
    with _lock:
        history.append(event)
        overflow = len(history) - _MAX_HISTORY
        if overflow > 0:
            del history[:overflow]


def get_history() -> list:
    # Return a shallow copy in chronological order.
    with _lock:
        return history.copy()
