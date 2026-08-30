# ==========================================
# SupportFlow Frontend Client Dockerfile
# Multi-stage: Node.js 20 Build + Nginx Serve
# ==========================================

# Stage 1: Build Vite React Production Bundle
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all build dependencies
RUN npm ci

# Copy source files
COPY . .

# Set environment variables for build
ENV VITE_API_BASE_URL=/api
ENV VITE_SOCKET_URL=/

# Build static dist bundle
RUN npm run build

# Stage 2: High-Performance Nginx Alpine Web Server
FROM nginx:1.25-alpine AS production

# Copy compiled static assets from build stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx SPA reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
