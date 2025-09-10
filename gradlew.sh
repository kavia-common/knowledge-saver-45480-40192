#!/usr/bin/env sh
# CI shim to satisfy tools that invoke a Gradle wrapper from the workspace root.
APP_DIR="knowledge-saver-45480-40192/clipstack_frontend/android"
if [ -x "$APP_DIR/gradlew" ]; then
  exec "$APP_DIR/gradlew" "$@"
fi
echo "[ClipStack] Expo managed workflow: no native project generated. Use 'npm run prebuild:android' or EAS Build."
exit 0
