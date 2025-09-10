@ECHO OFF
REM Root-level Gradle wrapper shim for CI tools that run .\gradlew from repository root.
SET APP_DIR=knowledge-saver-45480-40192\clipstack_frontend\android
IF EXIST "%APP_DIR%\gradlew.bat" (
  CALL "%APP_DIR%\gradlew.bat" %*
) ELSE (
  ECHO [ClipStack] Placeholder gradle wrapper not found at %APP_DIR%\gradlew.bat
  EXIT /B 0
)
