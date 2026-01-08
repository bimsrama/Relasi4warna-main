# Relasi4Warna - Deployment Guide

## Quick Start (VPS Deployment)

### Prerequisites
- VPS with Docker & Docker Compose installed
- Domain pointing to VPS IP
- MongoDB Atlas account (or self-hosted MongoDB)
- Midtrans account for payments
- Emergent Platform account for AI

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/relasi4warna.git
cd relasi4warna
```

### Step 2: Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your values
```

**Required Environment Variables:**
| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Random 32+ character string |
| `EMERGENT_LLM_KEY` | From Emergent Platform |
| `MIDTRANS_SERVER_KEY` | From Midtrans dashboard |
| `MIDTRANS_CLIENT_KEY` | From Midtrans dashboard |
| `REACT_APP_BACKEND_URL` | Your domain (e.g., https://yourdomain.com) |

### Step 3: Build & Deploy
```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: Verify Deployment
```bash
# Check health
curl http://localhost/health
curl http://localhost/api/health

# Should return: {"status":"healthy"}
```

---

## File Structure

```
/app
├── Dockerfile                    # Multi-stage build (backend + frontend)
├── docker-compose.yml            # Production compose file
├── .env.example                  # Environment template
├── infra/
│   └── docker/
│       ├── Dockerfile.backend    # Standalone backend image
│       ├── Dockerfile.frontend   # Standalone frontend image
│       └── nginx.conf            # Nginx configuration
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI pipeline (tests + builds)
│       └── deploy.yml            # Deploy to VPS workflow
├── backend/                      # FastAPI application
├── frontend/                     # React application
└── packages/                     # Shared business logic
```

---

## Deployment Options

### Option 1: Single Dockerfile (Recommended)
Uses multi-stage `Dockerfile` at root:
```bash
docker compose up -d
```

### Option 2: Separate Images
Build each service separately:
```bash
# Backend
docker build -f infra/docker/Dockerfile.backend -t relasi-backend .

# Frontend
docker build -f infra/docker/Dockerfile.frontend -t relasi-frontend \
  --build-arg REACT_APP_BACKEND_URL=https://yourdomain.com .
```

### Option 3: GitHub Actions (CI/CD)
1. Add secrets to GitHub repository
2. Push to `main` branch triggers CI
3. Use "Deploy to VPS" workflow for deployment

**Required GitHub Secrets:**
- `VPS_HOST` - VPS IP address
- `VPS_USER` - SSH username
- `VPS_SSH_KEY` - Private SSH key
- `MONGO_URL`, `JWT_SECRET`, etc.

---

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### Manual SSL
1. Place certificates in `./ssl/` folder:
   - `fullchain.pem`
   - `privkey.pem`
2. Uncomment HTTPS block in `nginx.conf`
3. Restart: `docker compose restart frontend`

---

## Maintenance

### View Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Restart Services
```bash
docker compose restart
```

### Update Application
```bash
git pull
docker compose build --no-cache
docker compose up -d
```

### Backup Database
```bash
# MongoDB Atlas: Use Atlas UI or mongodump
mongodump --uri="$MONGO_URL" --out=./backup
```

---

## Troubleshooting

### Backend not starting
```bash
docker compose logs backend
# Check for missing env variables
```

### Frontend 502 error
```bash
# Check if backend is healthy
curl http://localhost:8001/health

# Restart services
docker compose restart
```

### Database connection failed
```bash
# Verify MongoDB URL
docker compose exec backend python -c "from pymongo import MongoClient; print(MongoClient('$MONGO_URL').server_info())"
```

---

## Performance Tuning

### Nginx Workers
Edit `nginx.conf`:
```nginx
worker_processes auto;
worker_connections 1024;
```

### Backend Workers
Edit `docker-compose.yml` CMD:
```yaml
CMD ["uvicorn", "server:app", "--workers", "4"]
```

### Memory Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## Support

- Documentation: `/docs` endpoint
- Health Check: `/health` and `/api/health`
- Issues: GitHub Issues
