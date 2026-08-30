# ==========================================
# SupportFlow Backend API Dockerfile
# Node.js 20 Alpine Production Multi-Stage
# ==========================================

# Base Stage
FROM node:20-alpine AS base
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server application source code
COPY . .

# Set default production environment variables
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

# Start server entrypoint
CMD ["node", "server.js"]
