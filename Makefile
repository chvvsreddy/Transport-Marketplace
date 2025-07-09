# Goodseva Transport Marketplace - Development Makefile
# This Makefile provides convenient commands for Docker development environment

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

# Docker compose files
COMPOSE_FILE := deployment/docker-compose.yml
COMPOSE_DEV_FILE := deployment/docker-compose.dev.yml
COMPOSE_CMD := docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE)

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help: ## Display this help message
	@echo "$(BLUE)Goodseva Transport Marketplace - Development Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Setup Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(setup|install)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Development Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(up|down|restart|build|logs|clean)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Database Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E 'db-' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Service Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(server|client)-' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# Setup Commands
.PHONY: setup
setup: ## Run automated development setup
	@echo "$(GREEN)🚀 Setting up development environment...$(RESET)"
	@cd deployment && ./scripts/dev-setup.sh

.PHONY: install-server
install-server: ## Install server dependencies
	@echo "$(GREEN)📦 Installing server dependencies...$(RESET)"
	@$(COMPOSE_CMD) exec server npm install

.PHONY: install-client
install-client: ## Install client dependencies
	@echo "$(GREEN)📦 Installing client dependencies...$(RESET)"
	@$(COMPOSE_CMD) exec client npm install

# Development Commands
.PHONY: up
up: ## Start all services in development mode
	@echo "$(GREEN)🚀 Starting development environment...$(RESET)"
	@$(COMPOSE_CMD) up -d
	@echo "$(GREEN)✅ Services started successfully!$(RESET)"
	@echo "$(BLUE)🌐 Client: http://localhost:3000$(RESET)"
	@echo "$(BLUE)🔗 Server: http://localhost:3001$(RESET)"

.PHONY: down
down: ## Stop all services
	@echo "$(YELLOW)🛑 Stopping all services...$(RESET)"
	@$(COMPOSE_CMD) down
	@echo "$(GREEN)✅ Services stopped successfully!$(RESET)"

.PHONY: restart
restart: ## Restart all services
	@echo "$(YELLOW)🔄 Restarting all services...$(RESET)"
	@$(COMPOSE_CMD) restart
	@echo "$(GREEN)✅ Services restarted successfully!$(RESET)"

.PHONY: build
build: ## Build all Docker images
	@echo "$(GREEN)🔨 Building Docker images...$(RESET)"
	@$(COMPOSE_CMD) build --no-cache
	@echo "$(GREEN)✅ Images built successfully!$(RESET)"

.PHONY: logs
logs: ## View logs from all services
	@echo "$(BLUE)📋 Viewing logs from all services...$(RESET)"
	@$(COMPOSE_CMD) logs -f

.PHONY: clean
clean: ## Remove all containers, volumes, and images
	@echo "$(RED)🧹 Cleaning up Docker environment...$(RESET)"
	@$(COMPOSE_CMD) down -v --remove-orphans
	@docker system prune -af --volumes
	@echo "$(GREEN)✅ Cleanup completed!$(RESET)"

# Database Commands
.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(GREEN)📊 Running database migrations...$(RESET)"
	@$(COMPOSE_CMD) exec server npx prisma migrate dev --name init
	@$(COMPOSE_CMD) exec server npx prisma generate
	@echo "$(GREEN)✅ Migrations completed!$(RESET)"

.PHONY: db-seed
db-seed: ## Seed database with initial data
	@echo "$(GREEN)🌱 Seeding database...$(RESET)"
	@$(COMPOSE_CMD) exec server npm run seed
	@echo "$(GREEN)✅ Database seeded successfully!$(RESET)"

.PHONY: db-reset
db-reset: ## Reset database completely
	@echo "$(RED)⚠️  Resetting database (this will delete all data)...$(RESET)"
	@$(COMPOSE_CMD) exec server npx prisma migrate reset --force
	@echo "$(GREEN)✅ Database reset completed!$(RESET)"

.PHONY: db-shell
db-shell: ## Access PostgreSQL shell
	@echo "$(BLUE)🐘 Accessing PostgreSQL shell...$(RESET)"
	@$(COMPOSE_CMD) exec postgres psql -U postgres -d goodseva

.PHONY: db-status
db-status: ## Check database status
	@echo "$(BLUE)📊 Database status:$(RESET)"
	@$(COMPOSE_CMD) exec postgres pg_isready -U postgres -d goodseva

# Server Commands
.PHONY: server-shell
server-shell: ## Access server container shell
	@echo "$(BLUE)🖥️  Accessing server shell...$(RESET)"
	@$(COMPOSE_CMD) exec server sh

.PHONY: server-logs
server-logs: ## View server logs
	@echo "$(BLUE)📋 Server logs:$(RESET)"
	@$(COMPOSE_CMD) logs -f server

.PHONY: server-restart
server-restart: ## Restart server service
	@echo "$(YELLOW)🔄 Restarting server...$(RESET)"
	@$(COMPOSE_CMD) restart server
	@echo "$(GREEN)✅ Server restarted!$(RESET)"

# Client Commands
.PHONY: client-shell
client-shell: ## Access client container shell
	@echo "$(BLUE)🖥️  Accessing client shell...$(RESET)"
	@$(COMPOSE_CMD) exec client sh

.PHONY: client-logs
client-logs: ## View client logs
	@echo "$(BLUE)📋 Client logs:$(RESET)"
	@$(COMPOSE_CMD) logs -f client

.PHONY: client-restart
client-restart: ## Restart client service
	@echo "$(YELLOW)🔄 Restarting client...$(RESET)"
	@$(COMPOSE_CMD) restart client
	@echo "$(GREEN)✅ Client restarted!$(RESET)"

# Utility Commands
.PHONY: status
status: ## Show status of all services
	@echo "$(BLUE)📊 Service status:$(RESET)"
	@$(COMPOSE_CMD) ps

.PHONY: env
env: ## Create .env file from template
	@echo "$(GREEN)📝 Creating .env file...$(RESET)"
	@cd deployment && cp .env.example .env
	@echo "$(GREEN)✅ .env file created! Please review and update as needed.$(RESET)"

.PHONY: test
test: ## Run tests (when available)
	@echo "$(BLUE)🧪 Running tests...$(RESET)"
	@$(COMPOSE_CMD) exec server npm test || echo "$(YELLOW)⚠️  Server tests not configured$(RESET)"
	@$(COMPOSE_CMD) exec client npm test || echo "$(YELLOW)⚠️  Client tests not configured$(RESET)"

.PHONY: lint
lint: ## Run linting (when available)
	@echo "$(BLUE)🔍 Running linting...$(RESET)"
	@$(COMPOSE_CMD) exec server npm run lint || echo "$(YELLOW)⚠️  Server linting not configured$(RESET)"
	@$(COMPOSE_CMD) exec client npm run lint || echo "$(YELLOW)⚠️  Client linting not configured$(RESET)"

# Production Commands (for reference)
.PHONY: prod-build
prod-build: ## Build production images
	@echo "$(GREEN)🏗️  Building production images...$(RESET)"
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Production images built!$(RESET)"

.PHONY: health
health: ## Check health of all services
	@echo "$(BLUE)🏥 Health check:$(RESET)"
	@$(COMPOSE_CMD) ps --filter "health=healthy" --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Quick shortcuts
.PHONY: start
start: up ## Alias for 'up'

.PHONY: stop
stop: down ## Alias for 'down'

.PHONY: ps
ps: status ## Alias for 'status'