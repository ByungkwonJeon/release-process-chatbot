# 🚀 Running the Release Process Chatbot

## Quick Start

### Method 1: One Command (Recommended)
```bash
./start.sh
```

### Method 2: Using npm scripts
```bash
npm run dev:full
```

### Method 3: Manual (Two Terminals)

**Terminal 1 - Backend Server:**
```bash
npm start
# or for development with auto-restart:
npm run dev
```

**Terminal 2 - React Frontend:**
```bash
npm run client
```

## 🌐 Access Points

Once running, you can access:

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## 🔧 Available Scripts

- `npm start` - Start backend server only
- `npm run dev` - Start backend with auto-restart
- `npm run client` - Start React frontend only
- `npm run dev:full` - Start both backend and frontend
- `npm run build` - Build React app for production
- `npm run setup` - Install all dependencies

## 🛠️ Development

For development with auto-restart on file changes:
```bash
npm run dev:full
```

This will start:
- Backend server with nodemon (auto-restart on changes)
- React development server with hot reload

## 🚨 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. **Kill existing processes:**
   ```bash
   # Kill processes on port 3000 (React)
   lsof -ti:3000 | xargs kill -9
   
   # Kill processes on port 3001 (Backend)
   lsof -ti:3001 | xargs kill -9
   ```

2. **Or use different ports:**
   ```bash
   # For React (in client directory)
   PORT=3002 npm start
   
   # For Backend (set in .env file)
   PORT=3002 npm start
   ```

### Dependencies Issues
If you encounter dependency issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm install
cd client && npm install && cd ..
```

## 📱 Testing the Application

1. **Open your browser** to http://localhost:3000
2. **Try these commands** in the chatbot:
   - "help" - See all available commands
   - "list environments" - View available environments
   - "start a new release for version 2.1.0" - Start a release
   - "list terraform projects" - View Terraform projects

## 🔍 API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:3001/api/health

# Send a message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "help", "sessionId": "test-session"}'
```

## 🎯 Production Deployment

For production deployment:

```bash
# Build the React app
npm run build

# Start production server
npm start
```

The production server will serve the built React app from the `client/build` directory.
