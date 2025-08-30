@echo off
REM scripts/migrate-all.bat

set services=user-service catalog-service borrowing-service review-service notification-service

for %%s in (%services%) do (
    echo Processing %%s...
    cd ./services/%%s
    
    REM Delete existing migration files if directory exists
    if exist "src\migrations" (
        echo Removing existing migration files in src/migrations...
        del /q "src\migrations\*"
    )
    
    echo Generating new schema...
    bun run db:generate
    
    echo Pushing migrations...
    bun run db:migrate
    
    cd ../..
    echo Completed %%s migrations
    echo ------------------------
)

echo All migrations completed!