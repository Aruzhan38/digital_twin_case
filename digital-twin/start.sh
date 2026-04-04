#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

command -v python3 >/dev/null 2>&1 || {
  echo "python3 is required but not installed."
  exit 1
}

command -v pip3 >/dev/null 2>&1 || {
  echo "pip3 is required but not installed."
  exit 1
}

command -v node >/dev/null 2>&1 || {
  echo "node is required but not installed."
  exit 1
}

command -v npm >/dev/null 2>&1 || {
  echo "npm is required but not installed."
  exit 1
}

if ! python3 -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  echo "Installing backend dependencies..."
  cd "$BACKEND_DIR"
  pip3 install -r requirements.txt
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$FRONTEND_DIR"
  npm install
fi

echo "Starting backend on http://127.0.0.1:8000"
cd "$BACKEND_DIR"
uvicorn main:app --reload &
BACKEND_PID=$!

echo "Starting frontend on http://127.0.0.1:5173"
cd "$FRONTEND_DIR"
npm run dev
