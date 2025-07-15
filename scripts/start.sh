#!/bin/bash

echo "Starting OpenMusic API v3..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "Starting Docker services..."
    docker-compose up -d
    
    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10
fi

# Run database migrations
echo "Running database migrations..."
npm run migrate:up

# Start the main application
echo "Starting main application..."
npm start