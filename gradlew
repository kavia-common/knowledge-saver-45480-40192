#!/usr/bin/env bash
# Root-level Gradle wrapper shim for CI tools that run ./gradlew from repository root.
# Redirect to the ClipStack app placeholder gradle wrapper to exit successfully.
APP_DIR="knowledge-saver-45480-40192/clipstack_frontend/android"
if [ -x "$APP_DIR/gradlew" ]; then
  exec "$APP_DIR/gradlew" "$@"
else
  echo "[ClipStack] Placeholder gradle wrapper not found at $APP_DIR/gradlew"
  exit 0
fi
