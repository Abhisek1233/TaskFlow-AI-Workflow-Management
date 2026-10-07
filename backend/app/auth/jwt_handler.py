from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
from app.config import settings

def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Encodes user payload into a signed JWT access token with an expiration time.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decodes and validates a JWT access token.
    Returns the payload dictionary or None if expired/invalid.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None
