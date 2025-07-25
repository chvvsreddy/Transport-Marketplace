# Goodseva Transport Marketplace

A modern logistics platform connecting shippers and drivers for efficient transport management. Built with Next.js and Express.js for scalable load management, real-time bidding, and trip tracking.

## 🚀 Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Ant Design
**Backend:** Express.js 5.1.0, Node.js, TypeScript, Prisma ORM
**Database:** PostgreSQL 17, Redis 7
**DevOps:** Docker, Docker Compose

## ⚡ Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Git

### One-Command Setup
```bash
make setup
```

This command will:
- Set up environment variables
- Build and start all services
- Run database migrations
- Seed test data
- Display service URLs

### Access Points
- **Client (Frontend):** http://localhost:3000
- **Server (API):** http://localhost:3001
- **Database:** localhost:5432
- **Redis:** localhost:6379

## 📁 Project Structure

```
Transport-Marketplace/
├── client/          # Next.js frontend application
├── server/          # Express.js backend API
├── deployment/      # Docker configuration files
└── Makefile        # Development automation commands
```

## 🛠️ Development Commands

```bash
# Setup and start
make setup          # Complete project setup
make up            # Start all services
make down          # Stop all services

# Database operations
make db-seed       # Load test data
make db-migrate    # Run migrations
make db-reset      # Reset database

# Development tools
make logs          # View all logs
make status        # Check service status
make clean         # Clean Docker environment
```

## 👥 User Types

- **Company Shipper** - Businesses posting bulk loads
- **Individual Shipper** - Individuals posting occasional loads
- **Logistics Company** - Companies managing multiple trucks
- **Individual Driver** - Independent truck drivers
- **Admin** - System administrators

## 🔧 Core Features

- **Load Management** - Post and manage transport loads
- **Real-time Bidding** - Drivers bid on available loads
- **Trip Tracking** - Live tracking of ongoing trips
- **Multi-role Authentication** - JWT-based secure access
- **Payment Processing** - Integrated payment system
- **Notifications** - Real-time updates via Socket.io
- **Dashboard Analytics** - Performance metrics and insights

## 🔧 Environment Setup

1. Copy environment template:
   ```bash
   cp deployment/.env.example deployment/.env
   ```

2. Edit environment variables if needed:
   ```bash
   nano deployment/.env
   ```

3. Docker handles all dependencies automatically

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM managing:
- Users (with role-based access)
- Loads and load management
- Bidding system
- Trip and vehicle tracking
- Orders and payments
- Notifications

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| Client | 3000 | Next.js frontend |
| Server | 3001 | Express.js API |
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache and sessions |

## 🔍 Troubleshooting

- **Port conflicts:** Check if ports 3000, 3001, 5432, 6379 are available
- **Database issues:** Run `make db-status` to check connection
- **Build problems:** Run `make clean` and `make setup` again
- **Permission errors:** Ensure Docker daemon is running

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following existing code style
4. Test with `make up`
5. Submit pull request

---

For detailed Docker configuration and advanced setup, see [deployment/README.md](deployment/README.md)
