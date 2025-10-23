#!/bin/bash

# Bar National P&L Analysis Ultimate Edition - Quick Start Script
# This script helps you get started with the Dockerized application

echo "🚀 Bar National P&L Analysis Ultimate Edition - Quick Start"
echo "=========================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if containers are already running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Some containers are already running."
    echo "   Stopping existing containers..."
    docker-compose down
    echo ""
fi

echo "🔧 Starting Bar National P&L Analysis Ultimate Edition..."
echo "   This may take a few minutes on first run..."
echo ""

# Start the application
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 Application started successfully!"
    echo ""
    echo "📱 Access your application:"
    echo "   Web App: http://localhost:3000"
    echo "   MongoDB: localhost:27017"
    echo ""
    echo "📊 Available features:"
    echo "   • Daily Input Forms"
    echo "   • Calendar View"
    echo "   • Financial Reports"
    echo "   • 🔮 NEW: Financial Forecasting"
    echo ""
    echo "🛠️  Useful commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop app:      docker-compose down"
    echo "   Restart:       docker-compose restart"
    echo "   Clean up:      docker-compose down -v"
    echo ""
    echo "📚 Documentation:"
    echo "   README.md      - Complete guide"
    echo "   DOCKER_GUIDE.md - Docker specific instructions"
    echo ""
    
    # Open browser (if on macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🌐 Opening application in browser..."
        open http://localhost:3000
    fi
    
else
    echo ""
    echo "❌ Failed to start application. Checking logs..."
    echo ""
    docker-compose logs
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if ports 3000 and 27017 are available"
    echo "   2. Try: docker-compose down && docker-compose up --build"
    echo "   3. Check logs: docker-compose logs -f"
    echo ""
fi
