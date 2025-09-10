This project uses the Expo managed workflow. The native Android project is not checked in by default.

To generate locally:
  npm run prebuild:android

Then build:
  npm run native:android

CI Notes:
- Some CI analyzers try to run ./gradlew even without a native project. We include a no-op gradle wrapper that exits 0 to avoid false failures.
- Prefer EAS Build for real native builds.

This placeholder exists to inform tools expecting an 'android' directory.
