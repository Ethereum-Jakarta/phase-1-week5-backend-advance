@echo off
REM scripts/start-services.bat

echo Stopping any existing PM2 processes...
pm2 stop all
pm2 delete all

echo Starting services...

echo Starting API Gateway...
pm2 start ecosystem.config.js --only api-gateway
timeout /t 2

echo Starting User Service...
pm2 start ecosystem.config.js --only user-service
timeout /t 2

echo Starting Catalog Service...
pm2 start ecosystem.config.js --only catalog-service
timeout /t 2

echo Starting Borrowing Service...
pm2 start ecosystem.config.js --only borrowing-service
timeout /t 2

echo Starting Review Service...
pm2 start ecosystem.config.js --only review-service
timeout /t 2

echo Starting Notification Service...
pm2 start ecosystem.config.js --only notification-service

echo All services started!
echo Showing logs...
pm2 logs