# Relasi4Warna - Relationship Communication Platform

A full-stack web platform for personality assessment and relationship communication analysis.

## 🏗️ Project Structure (Monorepo)

```
relasi4warna/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # React frontend
├── packages/
│   ├── core/         # Core business logic
│   ├── hitl/         # Human-in-the-Loop engine
│   ├── governance/   # Governance & moderation
│   └── shared/       # Shared utilities
├── infra/
│   └── docker/       # Docker configurations
├── scripts/          # Build & deploy scripts
└── tests/            # Test suites
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB
- Yarn

### Development

```bash
# Install dependencies
yarn install
pip install -r apps/api/requirements.txt

# Start development servers
yarn dev
```

### Production

```bash
# Using Docker Compose
docker compose up -d
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| MONGO_URL | MongoDB connection | apps/api/.env |
| JWT_SECRET | JWT signing key | apps/api/.env |
| EMERGENT_LLM_KEY | AI integration key | apps/api/.env |
| MIDTRANS_SERVER_KEY | Payment server key | apps/api/.env |
| MIDTRANS_CLIENT_KEY | Payment client key | apps/api/.env |
| REACT_APP_BACKEND_URL | API URL for frontend | apps/web/.env |

## 📦 Features

- **4 Quiz Series**: Family, Couples, Business, Friendship
- **AI Reports**: GPT-4o powered analysis
- **Tier System**: Free, Premium, Elite, Elite+
- **Payment**: Midtrans integration (Production)
- **PDF Export**: Professional multi-chapter reports
- **Admin CMS**: Question & user management
- **HITL Moderation**: AI safety & governance

## 🔒 Security

- JWT authentication
- HITL content moderation
- PCI-DSS compliant payments (Midtrans)
- Input validation & sanitization

## 📄 License

© 2024 Relasi4Warna. All rights reserved.
