from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_db, get_current_customer  # ADICIONAR import
from app.models import Customer
from app.schemas import CustomerLogin, Token, CustomerResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(
    credentials: CustomerLogin,
    db: Session = Depends(get_db)
):
    """
    Login com email/código e senha.
    Retorna JWT token para autenticação.
    """
    
    # Buscar cliente por email ou código
    customer = db.query(Customer).filter(
        (Customer.email == credentials.identifier) | 
        (Customer.id == credentials.identifier)
    ).first()
    
    # Validar se cliente existe
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/código ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validar senha
    if not verify_password(credentials.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/código ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se conta está ativa
    if not customer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta inativa"
        )
    
    # Criar token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": customer.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout():
    """
    Logout (client-side apenas - remover token do localStorage).
    Backend JWT é stateless, não há sessão para invalidar.
    """
    return {"message": "Logout realizado com sucesso"}

@router.get("/me", response_model=CustomerResponse)
def get_current_user_info(
    current_customer: Customer = Depends(get_current_customer)  # CORRIGIDO
):
    """
    Retorna informações do usuário autenticado.
    Requer token JWT válido.
    """
    return current_customer