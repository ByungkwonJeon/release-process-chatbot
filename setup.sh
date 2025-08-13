#!/bin/bash

# Release Process Chatbot Setup Script
echo "🚀 Setting up Release Process Chatbot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run setup

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before starting the application."
else
    echo "✅ .env file found"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm start        - Start production server"
echo ""
