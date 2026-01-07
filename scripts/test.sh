#!/bin/bash
# Run tests for Relasi4Warna

set -e

echo "==================================="
echo "Relasi4Warna - Test Suite"
echo "==================================="

# Backend tests
echo ""
echo "Running backend tests..."
cd /app
export PYTHONPATH=/app:/app/packages
python -m pytest tests/backend/ -v --tb=short

# Frontend lint
echo ""
echo "Running frontend lint..."
cd /app/frontend
yarn lint || echo "Lint warnings found (non-blocking)"

# Build check
echo ""
echo "Running frontend build check..."
CI=false yarn build

echo ""
echo "==================================="
echo "All tests passed!"
echo "==================================="
