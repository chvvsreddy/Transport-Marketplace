#!/bin/bash

# Development Setup Script for Goodseva Transport Marketplace
# This script automates the setup process for the development environment

set -e

echo "🚀 Setting up Goodseva Transport Marketplace Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✓"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "Please review and update the .env file with your configuration"
    else
        print_status ".env file exists ✓"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans || true
}

# Build and start containers
start_containers() {
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
}

# Wait for database to be ready
wait_for_database() {
    print_status "Waiting for database to be ready..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U postgres -d goodseva > /dev/null 2>&1; then
            print_status "Database is ready ✓"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_error "Database failed to start after $max_attempts attempts"
    return 1
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose exec server npx prisma migrate dev --name init || true
    docker-compose exec server npx prisma generate
    print_status "Database migrations completed ✓"
}

# Seed database
seed_database() {
    print_status "Seeding database with initial data..."
    docker-compose exec server npm run seed || true
    print_status "Database seeding completed ✓"
}

# Display service status
show_status() {
    echo ""
    print_status "Development environment is ready! 🎉"
    echo ""
    echo "📋 Services:"
    echo "  • Client (Next.js):     http://localhost:3000"
    echo "  • Server (Express):     http://localhost:3001"
    echo "  • Database (PostgreSQL): localhost:5432"
    echo "  • Redis:                localhost:6379"
    echo ""
    echo "🔧 Useful commands:"
    echo "  • View logs:           docker-compose logs -f"
    echo "  • Stop services:       docker-compose down"
    echo "  • Restart services:    docker-compose restart"
    echo "  • Access database:     docker-compose exec postgres psql -U postgres -d goodseva"
    echo "  • Access server shell: docker-compose exec server sh"
    echo "  • Access client shell: docker-compose exec client sh"
    echo ""
}

# Main execution
main() {
    cd "$(dirname "$0")/.."
    
    print_status "Starting setup process..."
    
    check_docker
    check_env_file
    stop_containers
    start_containers
    wait_for_database
    run_migrations
    seed_database
    show_status
    
    print_status "Setup completed successfully! 🚀"
}

# Run main function
main "$@"