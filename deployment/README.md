# Goodseva Transport Marketplace - Docker Development Setup

This directory contains all the Docker configuration files and scripts needed to run the Goodseva Transport Marketplace application in a development environment.

## 📁 Directory Structure

```
deployment/
├── docker-compose.yml          # Main Docker Compose configuration
├── docker-compose.dev.yml      # Development-specific overrides
├── .env.example               # Environment variables template
├── client.Dockerfile          # Next.js client container
├── server.Dockerfile          # Express.js server container
├── scripts/
│   ├── dev-setup.sh           # Automated development setup
│   └── db-init.sh             # Database initialization script
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Git

### One-Command Setup

```bash
cd deployment
./scripts/dev-setup.sh
```

This script will:
- Check Docker installation
- Create `.env` file from template
- Build and start all services
- Run database migrations
- Seed the database with initial data
- Display service URLs and helpful commands

### Manual Setup

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit environment variables** (optional):
   ```bash
   nano .env
   ```

3. **Build and start services**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

4. **Run database migrations** (in another terminal):
   ```bash
   docker-compose exec server npx prisma migrate dev --name init
   docker-compose exec server npx prisma generate
   ```

5. **Seed the database**:
   ```bash
   docker-compose exec server npm run seed
   ```

## 🔧 Services

| Service | URL | Purpose |
|---------|-----|---------|
| Client | http://localhost:3000 | Next.js frontend application |
| Server | http://localhost:3001 | Express.js REST API |
| Database | localhost:5432 | PostgreSQL 17 database |
| Redis | localhost:6379 | Redis cache and session store |

## 🛠️ Development Commands

### Container Management

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart server

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
```

### Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d goodseva

# Run migrations
docker-compose exec server npx prisma migrate dev

# Generate Prisma client
docker-compose exec server npx prisma generate

# Seed database
docker-compose exec server npm run seed

# Reset database
docker-compose exec server npx prisma migrate reset
```

### Development Tools

```bash
# Access server shell
docker-compose exec server sh

# Access client shell
docker-compose exec client sh

# Install new npm package in server
docker-compose exec server npm install <package-name>

# Install new npm package in client
docker-compose exec client npm install <package-name>
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Check if ports 3000, 3001, 5432, or 6379 are already in use
   - Modify ports in `docker-compose.yml` if needed

2. **Database connection issues**:
   ```bash
   # Check database status
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **File permission issues**:
   ```bash
   # Fix permissions for scripts
   chmod +x scripts/*.sh
   ```

4. **Build cache issues**:
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   
   # Remove all containers and volumes
   docker-compose down -v
   docker system prune -a
   ```

### Development Hot Reloading

Both client and server support hot reloading:

- **Client**: Next.js with Turbopack automatically reloads on file changes
- **Server**: Nodemon restarts the server when TypeScript files change

### Environment Variables

Key environment variables you might need to modify:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/goodseva

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Security
JWT_SECRET=your-jwt-secret-key
```

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Get detailed health status
docker inspect $(docker-compose ps -q postgres) | grep -A 10 "Health"
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View logs with timestamps
docker-compose logs -f -t

# View logs for last 100 lines
docker-compose logs --tail=100
```

## 🔐 Security Notes

- Default passwords are used in development
- Change all default credentials for production
- The `.env` file contains sensitive information - never commit it to version control
- Use strong passwords and secrets in production

## 🤝 Contributing

When making changes to the Docker setup:

1. Test changes locally
2. Update documentation if needed
3. Consider backward compatibility
4. Test on different operating systems if possible

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Node.js Docker Hub](https://hub.docker.com/_/node)