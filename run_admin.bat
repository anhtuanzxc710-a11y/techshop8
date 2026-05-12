@echo off
title Khoi chay He thong Ecommerce - Admin
echo Dang kiem tra va giai phong cong 5000 va 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

echo Dang khoi chay Backend (Port 5000)...
start cmd /k "cd backend && npm run dev"

echo Dang doi Backend on dinh...
timeout /t 5

echo Dang khoi chay Admin Frontend (Port 5173)...
start cmd /k "cd admin && npm run dev"

echo Hoan tat! Hay truy cap http://localhost:5173
pause
