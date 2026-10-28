# ==============================================================================
# Production Dockerfile for Student Backend API (student-api / studentRudra)
# Optimized for Render Cloud Container Deployment
# ==============================================================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package descriptors first for layer caching
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose backend port (Render injects $PORT dynamically, default 5000/10000)
EXPOSE 5000 10000

# Container healthcheck adapts dynamically to $PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD sh -c "curl -f http://127.0.0.1:${PORT:-5000}/health || exit 1"

# Start application
CMD ["node", "server.js"]
