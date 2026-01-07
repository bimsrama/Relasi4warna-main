#!/bin/bash
# Build and run Relasi4Warna locally

set -e

echo "==================================="
echo "Relasi4Warna - Local Build & Run"
echo "==================================="

# Check for .env
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Copy .env.example to .env and fill in your values"
    exit 1
fi

# Load environment
export $(cat .env | grep -v '^#' | xargs)

# Build images
echo ""
echo "Building Docker images..."
docker compose build

# Start services
echo ""
echo "Starting services..."
docker compose up -d

# Wait for health checks
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "Checking service health..."
curl -s http://localhost:8001/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Backend:', d.get('status', 'unknown'))"
curl -s http://localhost:3000/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('Frontend:', d.get('status', 'unknown'))" 2>/dev/null || echo "Frontend: waiting..."

echo ""
echo "==================================="
echo "Services running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8001"
echo "==================================="
echo ""
echo "Logs: docker compose logs -f"
echo "Stop: docker compose down"
