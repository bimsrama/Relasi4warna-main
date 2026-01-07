"""Database connection and utilities"""
import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "relasi4warna")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def test_connection():
    """Test MongoDB connection"""
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False
