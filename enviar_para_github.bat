@echo off
title Enviar OmniConvert Studio para o GitHub
cd /d "%~dp0"
echo ========================================================
echo  Enviando OmniConvert Studio (com correcoes do Pages)
echo ========================================================
echo.
git push origin main
echo.
echo ========================================================
echo  Concluido! Acesse https://bragaty.github.io/omniconvert/
echo ========================================================
pause
