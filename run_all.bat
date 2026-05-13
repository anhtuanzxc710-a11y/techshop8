@echo off
title Khoi chay He thong Ecommerce - Tat ca
echo Dang kiem tra va giai phong cong 5001, 3001, 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

echo Dang khoi chay Backend (Port 5001)...
start cmd /k "cd backend && npm run dev"

echo Dang doi Backend on dinh...
timeout /t 5

echo Dang khoi chay Buyer Frontend (Port 3001)...
start cmd /k "cd frontend && npm run dev"

echo Dang khoi chay Admin Frontend (Port 5173)...
start cmd /k "cd admin && npm run dev"

echo Hoan tat! 
echo Truy cap Nguoi mua: http://localhost:3001
echo Truy cap Admin: http://localhost:5173
pause
