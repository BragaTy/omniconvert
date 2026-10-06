@echo off
title OmniConvert - Conversor Universal de Arquivos
cd /d "%~dp0"
echo ========================================================
echo  Iniciando OmniConvert (Conversor Universal de Arquivos)
echo ========================================================
echo  Abrindo o servidor local...
echo.
start http://localhost:5173
call npm run dev -- --port 5173
pause
