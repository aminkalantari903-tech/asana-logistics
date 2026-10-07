@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js 22.5+ is required: https://nodejs.org & pause & exit /b 1)
node scripts/restore.js || (pause & exit /b 1)
start "" http://localhost:8080
node --experimental-sqlite --no-warnings server.js
pause
