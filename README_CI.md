# CI Notes for ClipStack (Expo Managed)

Some CI analyzers automatically try to run `./gradlew` from various directories.
This repository uses the Expo managed workflow, so a native Android project is not
generated until you run:

  npm run prebuild:android

To avoid false CI failures, placeholder Gradle wrapper shims are included:
- ./gradlew (root)
- knowledge-saver-45480-40192/gradlew.sh (workspace root)
- knowledge-saver-45480-40192/clipstack_frontend/gradlew (app folder)
- knowledge-saver-45480-40192/clipstack_frontend/android/gradlew (android placeholder)

For real native builds, generate the native project or use EAS Build.
