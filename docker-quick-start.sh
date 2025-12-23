#!/bin/bash

# SmartLearn Docker Quick Start Script
# This script helps you get started with Docker Compose

set -e

echo "🚀 SmartLearn - Docker Quick Start"
echo "=================================="
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "📖 Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "📖 Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user for action
echo "What would you like to do?"
echo "1. Start services (docker-compose up -d)"
echo "2. Stop services (docker-compose down)"
echo "3. View logs (docker-compose logs -f)"
echo "4. Restart services (docker-compose restart)"
echo "5. Seed database (docker-compose exec app npm run seed)"
echo "6. View status (docker-compose ps)"
echo "7. Access MongoDB shell"
echo "8. Rebuild services (--build)"
echo "9. Clean up (down -v)"
echo ""
read -p "Enter your choice (1-9): " choice

case $choice in
    1)
        echo "📦 Starting services..."
        docker-compose up -d
        echo ""
        echo "✅ Services started!"
        echo "⏳ Waiting for services to be healthy (30-60 seconds)..."
        sleep 5
        docker-compose ps
        echo ""
        echo "🌐 Access the application:"
        echo "   API Docs: http://localhost:3000/api/docs"
        echo "   Dashboard: http://localhost:3000/dashboard.html"
        echo "   Health: http://localhost:3000/health"
        ;;
    2)
        echo "🛑 Stopping services..."
        docker-compose down
        echo "✅ Services stopped!"
        ;;
    3)
        echo "📋 Showing logs (Press Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    4)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo "✅ Services restarted!"
        docker-compose ps
        ;;
    5)
        echo "🌱 Seeding database..."
        docker-compose exec app npm run seed
        echo "✅ Database seeded!"
        ;;
    6)
        echo "📊 Service Status:"
        docker-compose ps
        ;;
    7)
        echo "🗄️  Accessing MongoDB shell..."
        echo "Commands: db.stats(), show collections, exit"
        docker-compose exec mongodb mongosh -u root -p root --authenticationDatabase admin smartlearn
        ;;
    8)
        echo "🏗️  Rebuilding services..."
        docker-compose up -d --build
        echo "✅ Services rebuilt and started!"
        ;;
    9)
        echo "🗑️  Cleaning up (removing containers and volumes)..."
        docker-compose down -v
        echo "✅ Cleanup complete!"
        ;;
    *)
        echo "❌ Invalid choice. Please run again and select 1-9."
        exit 1
        ;;
esac

echo ""
echo "📚 For more information, see DOCKER_GUIDE.md"

