#!/bin/bash
# scripts/install-dependencies.sh

echo "Installing root dependencies..."
bun install

services=("api-gateway" "user-service" "catalog-service" "borrowing-service" "review-service" "notification-service")

for service in "${services[@]}"
do
    echo "Installing dependencies for $service..."
    cd "services/$service"
    bun install
    cd ../..
done

echo "Creating .env file from example..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

echo "All dependencies installed!"
echo "Please update your .env file with proper values before starting the services."