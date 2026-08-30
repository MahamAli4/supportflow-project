@echo off
echo =========================================================
echo 🚀 SUPPORTFLOW DOCKER MULTI-CONTAINER LAUNCHER
echo =========================================================
echo.
echo Starting MongoDB, Backend API, and Frontend Nginx Containers...
echo.

docker-compose up --build -d

echo.
echo =========================================================
echo ✅ SUPPORTFLOW DOCKER CONTAINERS RUNNING!
echo.
echo 🌐 Frontend Application:  http://localhost
echo 📡 Backend REST API:       http://localhost:5000/api
echo 🍃 MongoDB Database:      mongodb://localhost:27017/supportflow
echo =========================================================
pause
