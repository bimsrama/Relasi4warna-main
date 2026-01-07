"""Authentication routes"""
import uuid
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import UserRegister, UserLogin, PasswordReset, PasswordResetConfirm, GoogleAuthRequest
from utils.database import db
from utils.auth import (
    hash_password, verify_password, create_access_token, 
    get_current_user, JWT_SECRET
)
import jwt
import httpx

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

@router.post("/register")
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = {
        "user_id": user_id,
        "email": user_data.email.lower(),
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Generate token
    token = create_access_token({"user_id": user_id})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user_id,
            "email": user_data.email.lower(),
            "name": user_data.name,
            "is_admin": False
        }
    }

@router.post("/login")
async def login(user_data: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": user_data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": user["user_id"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name", ""),
            "is_admin": user.get("is_admin", False)
        }
    }

@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Get current user info"""
    return user

@router.post("/google")
async def google_auth(data: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": data.code,
                    "grant_type": "authorization_code",
                    "redirect_uri": data.redirect_uri
                }
            )
            tokens = token_response.json()
            
            if "error" in tokens:
                raise HTTPException(status_code=400, detail=tokens.get("error_description", "Google auth failed"))
            
            # Get user info
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            userinfo = userinfo_response.json()
        
        email = userinfo.get("email", "").lower()
        if not email:
            raise HTTPException(status_code=400, detail="Could not get email from Google")
        
        # Find or create user
        user = await db.users.find_one({"email": email})
        if not user:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user = {
                "user_id": user_id,
                "email": email,
                "name": userinfo.get("name", email.split("@")[0]),
                "google_id": userinfo.get("id"),
                "avatar": userinfo.get("picture"),
                "is_admin": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "auth_provider": "google"
            }
            await db.users.insert_one(user)
        else:
            user_id = user["user_id"]
            # Update Google info
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "google_id": userinfo.get("id"),
                    "avatar": userinfo.get("picture"),
                    "last_login": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        token = create_access_token({"user_id": user_id})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "user_id": user_id,
                "email": email,
                "name": user.get("name", ""),
                "avatar": user.get("avatar", userinfo.get("picture")),
                "is_admin": user.get("is_admin", False)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")

@router.post("/request-reset")
async def request_password_reset(data: PasswordReset):
    """Request a password reset email"""
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, reset link will be sent"}
    
    # Generate reset token
    reset_token = jwt.encode(
        {
            "user_id": user["user_id"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            "type": "password_reset"
        },
        JWT_SECRET,
        algorithm="HS256"
    )
    
    # Store token
    await db.password_resets.insert_one({
        "user_id": user["user_id"],
        "token": reset_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "used": False
    })
    
    # TODO: Send email with reset link
    # For now, just return success
    return {"message": "If email exists, reset link will be sent", "token": reset_token}

@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm):
    """Reset password with token"""
    try:
        payload = jwt.decode(data.token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        user_id = payload.get("user_id")
        
        # Check if token was used
        reset_record = await db.password_resets.find_one({
            "token": data.token,
            "used": False
        })
        if not reset_record:
            raise HTTPException(status_code=400, detail="Token invalid or already used")
        
        # Update password
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"password_hash": hash_password(data.new_password)}}
        )
        
        # Mark token as used
        await db.password_resets.update_one(
            {"token": data.token},
            {"$set": {"used": True}}
        )
        
        return {"message": "Password reset successful"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")
