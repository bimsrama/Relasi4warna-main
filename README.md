# Relasi4Warna - Human Relationship Intelligence Platform

Platform asesmen kepribadian komunikasi dengan 4 arketipe: **Penggerak (Driver)**, **Percikan (Spark)**, **Jangkar (Anchor)**, dan **Analis (Analyst)**.

## 🏗️ Arsitektur Monorepo

```
relasi4warna/
├── backend/                 # FastAPI Backend API
│   ├── config.py           # Centralized configuration
│   ├── server.py           # Main application entry point
│   ├── routes/             # API route modules
│   ├── models/             # Pydantic schemas
│   ├── services/           # Business logic services
│   ├── utils/              # Utilities (auth, database)
│   ├── hitl_engine.py      # HITL moderation system
│   └── requirements.txt
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components (shadcn)
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── package.json
│
├── packages/               # Shared Business Logic (Monorepo Core)
│   ├── core/              # Personality engine & scoring
│   │   ├── personality_engine.py
│   │   ├── scoring.py
│   │   └── profile_generator.py
│   ├── hitl/              # Human-in-the-Loop
│   │   ├── risk_engine.py
│   │   ├── moderation.py
│   │   ├── safety.py
│   │   └── keywords.py
│   ├── governance/        # Policy & compliance
│   │   ├── policy_engine.py
│   │   ├── audit.py
│   │   └── compliance.py
│   └── shared/            # Shared types & constants
│       ├── types.py
│       ├── constants.py
│       └── utils.py
│
├── infra/                  # Infrastructure
│   └── docker/
│       ├── Dockerfile.backend
│       ├── Dockerfile.frontend
│       └── nginx.conf
│
├── tests/                  # Test suites
│   ├── backend/
│   └── frontend/
│
├── docker-compose.yml      # Production deployment
├── Dockerfile              # Multi-stage build
├── pyproject.toml          # Python project config
└── DEPLOYMENT.md           # Deployment guide
```

## 🚀 Quick Start

### Development Environment

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

### Production Deployment (Docker)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 🔧 Configuration

Environment variables are managed through `.env` files:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

Key configurations:
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMERGENT_LLM_KEY` - AI integration key
- `MIDTRANS_*` - Payment gateway config

## 📦 Packages Overview

### `packages/core`
Core personality assessment logic:
- `PersonalityEngine` - Quiz processing and scoring
- `calculate_archetype_scores()` - Score calculation
- `generate_profile_summary()` - Profile text generation

### `packages/hitl`
Human-in-the-Loop moderation:
- 3-level risk system (Normal, Sensitive, Critical)
- Automatic safety buffers
- Moderation queue management

### `packages/shared`
Shared resources:
- Type definitions (`UserTier`, `Series`, `Archetype`)
- Constants (`ARCHETYPES`, `TIER_FEATURES`)
- Utility functions

## 🧪 Testing

```bash
# Backend tests
pytest tests/backend/

# Frontend tests
cd frontend && yarn test
```

## 📄 API Documentation

When backend is running, access:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## 🔐 User Tiers

| Tier | Features |
|------|----------|
| Free | Basic quiz, primary archetype |
| Premium | Full AI report, PDF download |
| Elite | Advanced modules (Parent-Child, Business Leadership) |
| Elite+ | Certification program, coaching model |

## 📞 Support

- Admin: `admin@relasi4warna.com`
- Test credentials:
  - User: `test@test.com` / `testpassword`
  - Admin: `admin@relasi4warna.com` / `adminpassword`

---

Built with ❤️ by Relasi4Warna Team
