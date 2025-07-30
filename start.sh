#!/bin/bash

# NPD Tracking System Startup Script
echo "🚀 Starting NPD Tracking System..."
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

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MySQL is running (basic check)
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Make sure MySQL is installed and running."
    echo "   The application will try to connect anyway..."
    echo ""
fi

echo "✅ Starting the NPD Tracking System server..."
echo ""
echo "📋 Database Configuration:"
echo "   Host: localhost"
echo "   User: root"
echo "   Password: Akshat04sin@"
echo "   Database: npd_tracking (will be created automatically)"
echo ""
echo "🌐 Once started, access the application at:"
echo "   http://localhost:3000"
echo "   or"
echo "   http://localhost:3000/new_req.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start the server
npm start