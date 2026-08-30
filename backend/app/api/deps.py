from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.adapters.db.product_repository import SqlAlchemyProductRepository
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models import Customer
from app.ports.product_repository import ProductRepository

# Bearer token scheme
security = HTTPBearer()


def get_db() -> Generator:
    """Dependency para obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_product_repository(db: Session = Depends(get_db)) -> ProductRepository:
    return SqlAlchemyProductRepository(db)


def get_current_customer(
    credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)
) -> Customer:
    """Dependency para obter cliente autenticado via JWT"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extrair token
    token = credentials.credentials

    # Decodificar token
    customer_id = decode_access_token(token)

    if customer_id is None:
        raise credentials_exception

    # Buscar cliente no banco
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if customer is None:
        raise credentials_exception

    if not customer.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta inativa")

    return customer
