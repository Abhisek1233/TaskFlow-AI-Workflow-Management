import bcrypt

def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with a generated salt.
    Never stores plain-text passwords.
    """
    pwd_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain-text password matches the stored bcrypt hash.
    """
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False
