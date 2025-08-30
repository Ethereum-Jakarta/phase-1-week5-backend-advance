@echo off
REM scripts/start-services.bat

echo Stopping any existing PM2 processes...
pm2 stop all
pm2 delete all

echo Starting services...

@REM echo Starting API Gateway...
@REM pm2 start ecosystem.config.js --only api-gateway
@REM timeout /t 2

echo Starting User Service...
@REM pm2 start ecosystem.config.js --only users-service
@REM @REM timeout /t 4

@REM echo Starting Theaters Service...
@REM pm2 start ecosystem.config.js --only theaters-service
@REM @REM timeout /t 4

@REM echo Starting Reservations Service...
@REM pm2 start ecosystem.config.js --only reservations-service
@REM @REM timeout /t 4

@REM echo Starting Movie Service...
@REM pm2 start ecosystem.config.js --only movie-service
@REM @REM timeout /t 4

@REM echo Starting Tickets Service...
@REM pm2 start ecosystem.config.js --only tickets-service

pm2 start ecosystem.config.js

echo All services started!
echo Showing logs...
pm2 logs