#!/bin/bash

# SmartLearn UI - Quick Start Script
# This script sets up and runs SmartLearn with the web interface

echo "🚀 SmartLearn UI - Quick Start"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if MongoDB is running
echo "⏳ Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB not running on localhost:27017"
    echo "Starting MongoDB with Docker..."
    docker run -d -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=root \
        -e MONGO_INITDB_ROOT_PASSWORD=root \
        --name smartlearn-mongodb \
        mongo:5.0 2>/dev/null && \
    echo "✅ MongoDB started successfully" || \
    echo "ℹ️  MongoDB container may already be running"
else
    echo "✅ MongoDB is running"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🎉 Starting SmartLearn server..."
echo ""
echo "=========================================="
echo "🌐 Open your browser and navigate to:"
echo "=========================================="
echo ""
echo "   📍 http://localhost:3000"
echo ""
echo "Available pages:"
echo "   🏠 Home:              http://localhost:3000/"
echo "   📊 Dashboard:         http://localhost:3000/dashboard.html"
echo "   📚 Materials:         http://localhost:3000/materials.html"
echo "   🎓 Courses:           http://localhost:3000/courses.html"
echo "   📖 API Documentation: http://localhost:3000/api/docs"
echo ""
echo "Test Credentials:"
echo "   Admin:   admin@hnue.edu.vn / Admin@123456"
echo "   Teacher: teacher@hnue.edu.vn / Teacher@123456"
echo "   Student: student001@student.hnue.edu.vn / Student@123456"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

# Run the server
npm start

