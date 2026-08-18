@echo off
start "Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"
start "Backend" powershell -NoExit -Command "cd '%~dp0backend'; npm run dev"