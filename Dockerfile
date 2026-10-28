# ==============================================================================
# Production Dockerfile for Student Backend API (student-api)
# Optimized for Render Cloud Container Deployment
# ==============================================================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for Docker healthchecks
RUN apk add --no-cache curl

# Copy package descriptors first for Docker layer caching
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Health check inside container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]

