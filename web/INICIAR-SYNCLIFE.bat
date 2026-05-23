@echo off
echo Iniciando SyncLife...
cd /d "%~dp0"
echo Diretorio: %CD%
echo.
npm run dev
pause
