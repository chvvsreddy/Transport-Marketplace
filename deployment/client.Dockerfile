# Client Dockerfile for development
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY ../client/package*.json ./
COPY ../client/tsconfig.json ./
COPY ../client/next.config.ts ./
COPY ../client/postcss.config.mjs ./
COPY ../client/eslint.config.mjs ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ../client/src ./src/
COPY ../client/public ./public/

# Create necessary directories and set permissions
RUN mkdir -p /app/.next /app/.next/cache /app/.next/types /app/node_modules/.cache
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]