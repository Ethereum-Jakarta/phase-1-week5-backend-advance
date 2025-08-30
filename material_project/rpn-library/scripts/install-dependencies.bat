@echo off
REM scripts/install-dependencies.bat

echo Installing root dependencies...
bun install

set services=api-gateway user-service catalog-service borrowing-service review-service notification-service

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