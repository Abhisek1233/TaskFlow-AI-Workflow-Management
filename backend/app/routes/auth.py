from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.utils.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user account.
    Validates input, checks for duplicate emails, hashes password with bcrypt,
    and returns sanitized user details.
    """
    email_clean = user_in.email.lower().strip()
    
    # Check for existing email
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Hash password securely
    hashed_pw = hash_password(user_in.password)
    
    new_user = User(
        name=user_in.name.strip(),
        email=email_clean,
        password_hash=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and issues a signed JWT access token.
    """
    email_clean = creds.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    """
    return current_user
