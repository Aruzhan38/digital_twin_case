from threading import Lock

history = []
_lock = Lock()
_MAX_HISTORY = 300


def add_event(event: dict) -> None:
    with _lock:
        history.append(event)
        overflow = len(history) - _MAX_HISTORY
        if overflow > 0:
            del history[:overflow]


def get_history() -> list:
    with _lock:
        return history.copy()
