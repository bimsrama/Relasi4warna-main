# BUILD NOTES - Relasi4Warna Production Application

## Architecture Decisions

### 1. Tech Stack (Retained from Existing)
- **Backend**: FastAPI (Python) - Already production-ready, extensive HITL implementation
- **Frontend**: React + Tailwind + shadcn/ui - Working application with 20+ pages
- **Database**: MongoDB (Atlas-ready) - Proper connection pooling configured
- **Auth**: JWT-based with session management
- **AI**: OpenAI GPT via Emergent LLM Key

### 2. Why Not Next.js Migration
- Existing React app is fully functional with 20+ pages
- Migration risk outweighs benefits for current timeline
- React app already has proper routing, auth, and state management

### 3. Monorepo Structure
```
/app
├── /backend              → FastAPI API (existing, refactored)
│   ├── /packages
│   │   ├── /core        → Personality engine, scoring
│   │   ├── /hitl        → Risk assessment, moderation
│   │   ├── /governance  → Policy enforcement
│   │   └── /shared      → Types, utils, constants
│   └── server.py        → Main API entry point
├── /frontend            → React web app (user-facing + admin)
├── /infra
│   └── /docker          → Dockerfile, compose
├── /scripts             → Build, deploy scripts
└── /tests               → Backend + frontend tests
```

### 4. HITL Enforcement (Runtime)
- Every AI response creates `RiskAssessment` object
- Persisted to `risk_assessments` collection
- Level 3 blocks output immediately
- Level 2 attaches safety buffer
- Admin moderation queue for Level 3

### 5. Tier Logic
- **FREE**: Basic quiz results, limited features
- **PREMIUM**: Full AI report, PDF download, paid via Midtrans
- **ELITE**: Advanced modules (Quarterly, Parent-Child, Business, Team)
- **ELITE+**: Certification, AI-Human coaching, Governance dashboard

### 6. Payment Integration
- Midtrans Snap for Indonesian payments (currently sandbox)
- Production keys to be configured via ENV

### 7. PDF Generation
- Server-side using ReportLab
- Branded layout with Relasi4Warna styling
- Protected by HITL (blocked if Level 3)

### 8. Admin Flow
- Admin dashboard at /admin
- Moderation queue with approve/edit/escalate
- HITL Analytics with charts
- Full audit trail

## Environment Variables Required
```
MONGO_URL=mongodb+srv://...
DB_NAME=relasi4warna
JWT_SECRET=<secure-random-string>
EMERGENT_LLM_KEY=<from-emergent-platform>
MIDTRANS_SERVER_KEY=<sandbox-or-prod>
MIDTRANS_CLIENT_KEY=<sandbox-or-prod>
RESEND_API_KEY=<optional-for-email>
GOOGLE_CLIENT_ID=<for-google-auth>
GOOGLE_CLIENT_SECRET=<for-google-auth>
```

## Deployment
```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.prod.yml up -d
```

## CI/CD
- Build check: `docker build`
- Type check: `mypy backend/` (Python)
- Lint: `ruff check backend/` (Python), `eslint frontend/src/` (JS)
- Tests: `pytest tests/`
- Health: `/api/health` must return 200

## Assumptions Made
1. Midtrans remains in sandbox mode until production keys provided
2. Email (Resend) is optional - system works without it
3. Google OAuth requires client credentials from user
4. AI generation uses Emergent LLM Key (already configured)
5. MongoDB Atlas connection string provided by user

## Known Limitations
1. PDF font is system default (custom font can be added)
2. Real-time notifications not implemented (polling used)
3. Rate limiting is basic (can be enhanced with Redis)
