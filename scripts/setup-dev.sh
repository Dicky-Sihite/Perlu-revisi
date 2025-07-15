#!/bin/bash

echo "Setting up OpenMusic API v3 development environment..."

# Install main application dependencies
echo "Installing main application dependencies..."
npm install

# Setup consumer application
echo "Setting up consumer application..."
cd consumer
npm install
cd ..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p src/api/uploads/file/images

# Setup database
echo "Setting up database..."
npm run migrate:up

# Start development services
echo "Starting development services..."
if command -v docker &> /dev/null; then
    docker-compose up -d
fi

echo "Development environment setup complete!"
echo "You can now run:"
echo "  npm run dev          # Start main application in development mode"
echo "  npm run start        # Start main application in production mode"
echo "  cd consumer && npm start  # Start consumer application"