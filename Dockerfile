# ===========================================
# Relasi4Warna - Multi-stage Dockerfile
# ===========================================
# Build: docker build -t relasi4warna .
# ===========================================

# ===========================================
# Stage 1: Backend Base
# ===========================================
FROM python:3.11-slim AS backend-base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ===========================================
# Stage 2: Backend Production
# ===========================================
FROM backend-base AS backend

WORKDIR /app

# Copy backend code
COPY backend/ ./backend/
COPY packages/ ./packages/

# Set Python path
ENV PYTHONPATH=/app:/app/packages
ENV PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001

# Run with uvicorn
WORKDIR /app/backend
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]

# ===========================================
# Stage 3: Frontend Build
# ===========================================
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY frontend/ ./

# Build argument for backend URL
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build production
RUN yarn build

# ===========================================
# Stage 4: Frontend Production (Nginx)
# ===========================================
FROM nginx:alpine AS frontend

# Install curl for health check
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from build stage
COPY --from=frontend-build /app/build /usr/share/nginx/html

# Create non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
