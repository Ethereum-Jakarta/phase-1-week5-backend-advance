@echo off
REM scripts/install-dependencies.bat

echo Installing root dependencies...
bun install

set services= users-service tickets-service theaters-service reservations-service movie-service

for %%s in (%services%) do (
    echo Installing dependencies for %%s...
    cd services/%%s
    bun install
    cd ../..
)

echo Creating .env file from example...
if not exist .env (
    copy .env.example .env
)

echo All dependencies installed!
echo Please update your .env file with proper values before starting the services.