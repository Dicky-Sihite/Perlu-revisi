#!/bin/bash

echo "Starting OpenMusic API Consumer..."

# Navigate to consumer directory
cd consumer

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing consumer dependencies..."
    npm install
fi

# Start the consumer
echo "Starting consumer application..."
npm start