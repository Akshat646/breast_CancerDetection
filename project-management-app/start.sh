#!/bin/bash

# Project Management System Startup Script
echo "🚀 Starting Project Management System..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+ and try again."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL and try again."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the service using this port or change the port in configuration."
        return 1
    fi
    return 0
}

echo "📋 Checking prerequisites..."

# Check if ports are available
if ! check_port 3001; then
    echo "Backend port 3001 is occupied."
    exit 1
fi

if ! check_port 3000; then
    echo "Frontend port 3000 is occupied."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Setup database
echo "🗄️  Setting up database..."
if mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS project_management;" 2>/dev/null; then
    echo "✅ Database created successfully"
    mysql -u root -p project_management < database/schema.sql 2>/dev/null && echo "✅ Database schema loaded"
else
    echo "❌ Failed to setup database. Please ensure MySQL is running and you have proper credentials."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "✅ All dependencies installed!"

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend started successfully on port 3001"
else
    echo "❌ Failed to start backend"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 10

echo ""
echo "🎉 Project Management System is now running!"
echo "========================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait