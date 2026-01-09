# Relasi4Warna - Deployment Guide

## Quick Start (Docker Compose)

```bash
# Clone repository
git clone https://github.com/your-org/relasi4warna.git
cd relasi4warna

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Deploy
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

## Project Structure (Monorepo)

```
relasi4warna/
├── apps/
│   ├── api/              # FastAPI backend
│   │   ├── server.py
│   │   ├── requirements.txt
│   │   └── .env
│   └── web/              # React frontend
│       ├── src/
│       ├── package.json
│       └── .env
├── packages/             # Shared packages
├── infra/
│   └── docker/
│       ├── Dockerfile.backend
│       ├── Dockerfile.frontend
│       └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Environment Variables

### Backend (apps/api/.env)

```env
# Database
MONGO_URL=mongodb://mongo:27017/relasi4warna
DB_NAME=relasi4warna

# Security
JWT_SECRET=your_secure_jwt_secret_here

# AI Integration
EMERGENT_LLM_KEY=your_emergent_key

# Payment (Midtrans Production)
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MIDTRANS_MERCHANT_ID=Gxxxxxxx
MIDTRANS_IS_PRODUCTION=true

# Email (Optional)
RESEND_API_KEY=re_xxxxx
SENDER_EMAIL=noreply@yourdomain.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### Frontend (apps/web/.env)

```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Production deployment
docker compose -f docker-compose.yml up -d

# With SSL/TLS (using Traefik or nginx-proxy)
docker compose -f docker-compose.yml -f docker-compose.ssl.yml up -d
```

### Option 2: Manual Deployment

**Backend:**
```bash
cd apps/api
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
```

**Frontend:**
```bash
cd apps/web
yarn install
yarn build
# Serve with nginx or similar
```

## Production Checklist

- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Use production Midtrans keys
- [ ] Configure HTTPS/SSL
- [ ] Set secure JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Set up health checks

## Midtrans Production Setup

1. Login to [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Go to Settings → Access Keys
3. Copy Production Server Key and Client Key
4. Configure webhook URL: `https://yourdomain.com/api/payment/webhook`
5. Enable required payment methods

## Health Checks

- Backend: `GET /api/health`
- Frontend: `GET /`

## Troubleshooting

### Backend not starting
```bash
docker compose logs backend
```

### Database connection issues
```bash
docker compose exec mongo mongosh --eval "db.stats()"
```

### Payment issues
- Verify Midtrans keys are correct
- Check webhook URL is accessible
- Review Midtrans dashboard for transaction logs

## Support

For issues, contact: support@relasi4warna.com
