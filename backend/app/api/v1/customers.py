from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_customer
from app.models import Customer, Transaction
from app.schemas import CustomerResponse, CustomerUpdate, CustomerStats

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    current_customer: Customer = Depends(get_current_customer)
):
    """
    Retorna dados do cliente autenticado.
    Requer token JWT válido.
    """
    return current_customer

@router.patch("/me", response_model=CustomerResponse)
def update_my_profile(
    customer_update: CustomerUpdate,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Atualiza dados do cliente autenticado.
    Apenas campos fornecidos serão atualizados.
    """
    
    # Atualizar apenas campos fornecidos
    update_data = customer_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_customer, field, value)
    
    db.commit()
    db.refresh(current_customer)
    
    return current_customer

@router.get("/me/stats", response_model=CustomerStats)
def get_my_stats(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas do cliente autenticado.
    """
    
    # Total ganho (créditos)
    total_earned = db.query(func.sum(Transaction.amount)).filter(
        Transaction.customer_id == current_customer.id,
        Transaction.type == 'credit'
    ).scalar() or 0
    
    # Total resgatado (débitos)
    total_redeemed = db.query(func.sum(Transaction.amount)).filter(
        Transaction.customer_id == current_customer.id,
        Transaction.type == 'debit'
    ).scalar() or 0
    
    # Total de transações
    transaction_count = db.query(func.count(Transaction.id)).filter(
        Transaction.customer_id == current_customer.id
    ).scalar() or 0
    
    return {
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "transaction_count": transaction_count,
        "member_since": current_customer.created_at
    }