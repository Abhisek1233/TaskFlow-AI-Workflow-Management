from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: EmailStr = Field(..., description="Valid unique email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
