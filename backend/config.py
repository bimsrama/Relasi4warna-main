"""
Configuration Module
====================
Centralized configuration for the Relasi4Warna API.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ===========================================
# Database Configuration
# ===========================================
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'relasi4warna')

# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# ===========================================
# Payment Configuration (Midtrans)
# ===========================================
MIDTRANS_SERVER_KEY = os.environ.get('MIDTRANS_SERVER_KEY', 'SB-Mid-server-YOUR_SERVER_KEY')
MIDTRANS_CLIENT_KEY = os.environ.get('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-YOUR_CLIENT_KEY')
MIDTRANS_IS_PRODUCTION = os.environ.get('MIDTRANS_IS_PRODUCTION', 'False') == 'True'

# Legacy Xendit (deprecated)
XENDIT_API_KEY = os.environ.get('XENDIT_API_KEY', '')
XENDIT_WEBHOOK_TOKEN = os.environ.get('XENDIT_WEBHOOK_TOKEN', '')

# ===========================================
# Email Configuration (Resend)
# ===========================================
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@relasi4warna.com')

# ===========================================
# AI/LLM Configuration
# ===========================================
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# ===========================================
# Google OAuth Configuration
# ===========================================
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

# ===========================================
# Application Configuration
# ===========================================
APP_URL = os.environ.get('APP_URL', 'https://relasi4warna.com')
EMERGENT_AUTH_URL = os.environ.get(
    'EMERGENT_AUTH_URL',
    'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data'
)

# ===========================================
# Rate Limiting Configuration
# ===========================================
FORGOT_PASSWORD_RATE_LIMIT = 3  # max requests
FORGOT_PASSWORD_RATE_WINDOW = 3600  # 1 hour in seconds
