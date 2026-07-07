# backend/app/api/v1/customers.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_customer, get_db
from app.models import Customer
from app.schemas import CustomerResponse, CustomerStats, CustomerUpdate
from app.services import customer_service

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    return customer_service.build_customer_response(current_customer, db)


@router.patch("/me", response_model=CustomerResponse)
def update_my_profile(
    customer_update: CustomerUpdate,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    update_data = customer_update.model_dump(exclude_unset=True)
    try:
        customer = customer_service.update_customer(db, current_customer, update_data)
    except customer_service.EmailAlreadyInUseError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já está em uso") from e
    return customer_service.build_customer_response(customer, db)


@router.get("/me/stats", response_model=CustomerStats)
def get_my_stats(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    return customer_service.get_customer_stats(db, current_customer)
