#!/bin/bash

echo "🚀 Starting Release Process Chatbot..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "🌐 Starting both server and client..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3001"
echo ""

# Run both server and client
npm run dev:full
