from datetime import datetime, timedelta

import bcrypt
import jwt
from jwt import InvalidTokenError

from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha bate com o hash"""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        # bcrypt levanta ValueError pra senha >72 bytes (diferente do passlib antigo,
        # que truncava em silêncio) — trata como senha incorreta, não deixa estourar.
        return False


def get_password_hash(password: str) -> str:
    """Gera hash da senha"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Cria token JWT"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt


def decode_access_token(token: str) -> str | None:
    """Decodifica token JWT e retorna customer_id"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        customer_id: str = payload.get("sub")
        return customer_id
    except InvalidTokenError:
        return None


def create_admin_token(expires_delta: timedelta | None = None) -> str:
    """Cria um token de sessão pro painel admin, curto e revogável por expiração —
    em vez do painel guardar o PUSH_ADMIN_SECRET (permanente) no navegador."""
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=12))
    to_encode = {"role": "admin", "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_admin_token(token: str) -> bool:
    """Verifica se o token é uma sessão de admin válida e não expirada."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("role") == "admin"
    except InvalidTokenError:
        return False
