# scripts/migrate-all.sh
#!/bin/bash

# Array of services
services=("user-service" "catalog-service" "borrowing-service" "review-service" "notification-service")

# Loop through each service
for service in "${services[@]}"
do
  echo "Migrating $service..."
  cd "./services/$service"
  
  # Generate schema
  echo "Generating schema..."
  bun run db:generate
  
  # Push migrations
  echo "Pushing migrations..."
  bun run db:migrate
  
  cd ../..
  echo "Completed $service migrations"
  echo "------------------------"
done

echo "All migrations completed!"