# Server Dockerfile for development
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    curl

# Copy package files
COPY ../server/package*.json ./
COPY ../server/tsconfig.json ./
COPY ../server/prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY ../server/src ./src/
COPY ../server/utils ./utils/
COPY ../server/ecosystem.config.js ./

# Create directories and set permissions
RUN mkdir -p /app/dist /app/node_modules/.cache
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application using tsx for reliable TypeScript execution
CMD ["sh", "-c", "npx prisma generate && npx tsx src/index.ts"]