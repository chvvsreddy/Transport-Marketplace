#!/bin/bash

# Database Initialization Script for Goodseva Transport Marketplace
# This script runs inside the PostgreSQL container during initialization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[DB-INIT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[DB-INIT]${NC} $1"
}

print_error() {
    echo -e "${RED}[DB-INIT]${NC} $1"
}

# Database configuration
DB_NAME="${POSTGRES_DB:-goodseva}"
DB_USER="${POSTGRES_USER:-postgres}"

print_status "Initializing database: $DB_NAME"

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE $DB_NAME'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOSQL

print_status "Database $DB_NAME created or already exists"

# Create extensions if needed
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_NAME" <<-EOSQL
    -- Enable UUID generation
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable PostGIS if needed for location features
    -- CREATE EXTENSION IF NOT EXISTS postgis;
    
    -- Enable pg_trgm for text search
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    
    -- Enable unaccent for text search
    CREATE EXTENSION IF NOT EXISTS unaccent;
EOSQL

print_status "Database extensions installed"

# Create a test connection to verify everything is working
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_NAME" <<-EOSQL
    SELECT 'Database initialization completed successfully!' as status;
EOSQL

print_status "Database initialization completed successfully!"