#!/bin/bash

echo "🚀 Starting Release Process Chatbot..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install client dependencies if they don't exist
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Build the React app
echo "🔨 Building React application..."
cd client && npm run build && cd ..

# Check if build was successful
if [ ! -f "client/build/index.html" ]; then
    echo "❌ Error: React build failed. Please check the build output above."
    exit 1
fi

echo "✅ React app built successfully!"

# Start the server
echo "🌐 Starting server..."
npm start
