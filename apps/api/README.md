# Relasi4Warna API

Backend API service built with FastAPI.

## Tech Stack
- **Framework**: FastAPI
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via Emergent LLM
- **Payment**: Midtrans
- **PDF**: ReportLab

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET=your_jwt_secret
EMERGENT_LLM_KEY=your_emergent_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=True
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/series` - Get quiz series
- `GET /api/quiz/questions/{series}` - Get questions
- `POST /api/quiz/start` - Start quiz attempt
- `POST /api/quiz/submit` - Submit quiz answers

### Reports
- `POST /api/report/generate/{result_id}` - Generate premium report
- `GET /api/report/pdf/{result_id}` - Download PDF report
- `POST /api/report/elite/{result_id}` - Generate elite report
- `POST /api/report/elite-plus/{result_id}` - Generate elite+ report

### Payments
- `GET /api/payment/products` - Get available products
- `POST /api/payment/create` - Create payment
- `POST /api/payment/webhook` - Midtrans webhook
