@echo off
title Khoi chay He thong Ecommerce - Nguoi mua
echo Dang kiem tra va giai phong cong 5000 va 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

echo Dang khoi chay Backend (Port 5000)...
start cmd /k "cd backend && npm run dev"

echo Dang doi Backend on dinh...
timeout /t 5

echo Dang khoi chay Frontend (Port 3001)...
start cmd /k "cd frontend && npm run dev"

echo Hoan tat! Hay truy cap http://localhost:3001
pause
