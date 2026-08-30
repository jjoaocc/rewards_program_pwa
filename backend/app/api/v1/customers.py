# backend/app/api/v1/customers.py

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_customer, get_customer_repository
from app.application import customer_use_cases
from app.domain.customer import Customer, EmailAlreadyInUseError
from app.ports.customer_repository import CustomerRepository
from app.schemas import CustomerResponse, CustomerStats, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    current_customer: Customer = Depends(get_current_customer),
    repo: CustomerRepository = Depends(get_customer_repository),
):
    return customer_use_cases.get_profile(repo, current_customer.id)


@router.patch("/me", response_model=CustomerResponse)
def update_my_profile(
    customer_update: CustomerUpdate,
    current_customer: Customer = Depends(get_current_customer),
    repo: CustomerRepository = Depends(get_customer_repository),
):
    update_data = customer_update.model_dump(exclude_unset=True)
    try:
        return customer_use_cases.update_profile(repo, current_customer.id, update_data)
    except EmailAlreadyInUseError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já está em uso") from e


@router.get("/me/stats", response_model=CustomerStats)
def get_my_stats(
    current_customer: Customer = Depends(get_current_customer),
    repo: CustomerRepository = Depends(get_customer_repository),
):
    return customer_use_cases.get_stats(repo, current_customer.id, current_customer.created_at)
