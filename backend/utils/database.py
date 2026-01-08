"""
Database Connection Module
==========================
Centralized MongoDB connection with proper configuration for production.
"""

import os
from urllib.parse import urlparse
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection settings
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DEFAULT_DB_NAME = os.environ.get("DB_NAME", "relasi4warna")


def get_database_name(mongo_url: str, default_db_name: str = None) -> str:
    """
    Extract database name from MongoDB URL or use default.
    
    Args:
        mongo_url: MongoDB connection string
        default_db_name: Fallback database name
        
    Returns:
        Database name to use
    """
    if default_db_name:
        return default_db_name
    
    try:
        parsed = urlparse(mongo_url)
        if parsed.path and parsed.path != '/':
            db_name = parsed.path.lstrip('/')
            if '?' in db_name:
                db_name = db_name.split('?')[0]
            if db_name:
                return db_name
    except Exception:
        pass
    
    return "relasi4warna"


# Configure MongoDB client with connection options suitable for production
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,   # 5 second timeout for server selection
    connectTimeoutMS=10000,          # 10 second connection timeout
    socketTimeoutMS=20000,           # 20 second socket timeout
    maxPoolSize=10,                  # Limit connection pool
    retryWrites=True,                # Enable retry for write operations
)

# Get database reference
DB_NAME = get_database_name(MONGO_URL, DEFAULT_DB_NAME)
db = client[DB_NAME]


async def test_connection():
    """Test MongoDB connection"""
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False


async def close_connection():
    """Close MongoDB connection gracefully"""
    client.close()
