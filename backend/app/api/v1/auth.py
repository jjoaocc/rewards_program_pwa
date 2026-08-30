from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import get_current_customer, get_customer_repository
from app.application import auth_use_cases
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import create_access_token
from app.domain.customer import Customer
from app.ports.customer_repository import CustomerRepository
from app.schemas import CustomerLogin, CustomerResponse, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    credentials: CustomerLogin,
    repo: CustomerRepository = Depends(get_customer_repository),
):
    """
    Login com email/código e senha.
    Retorna JWT token para autenticação.
    """
    try:
        customer = auth_use_cases.authenticate_customer(repo, credentials.identifier, credentials.password)
    except auth_use_cases.InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/código ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except auth_use_cases.InactiveAccountError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta inativa") from e

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": customer.id}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    """
    Logout (client-side apenas - remover token do localStorage).
    Backend JWT é stateless, não há sessão para invalidar.
    """
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=CustomerResponse)
def get_current_user_info(
    current_customer: Customer = Depends(get_current_customer),
):
    """
    Retorna informações do usuário autenticado.
    Requer token JWT válido.
    """
    return current_customer
