from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_customer
from app.models import Customer, Transaction
from app.schemas import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
def get_my_transactions(
    type: Optional[str] = Query(None, description="Filtrar por tipo: 'credit' ou 'debit'"),
    start_date: Optional[datetime] = Query(None, description="Data inicial (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Data final (ISO format)"),
    store: Optional[str] = Query(None, description="Filtrar por loja"),
    limit: int = Query(100, ge=1, le=500, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Lista transações do cliente autenticado com filtros opcionais.
    Ordenadas por data (mais recentes primeiro).
    """
    
    # Query base
    query = db.query(Transaction).filter(
        Transaction.customer_id == current_customer.id
    )
    
    # Aplicar filtros
    if type:
        query = query.filter(Transaction.type == type)
    
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    
    if store:
        query = query.filter(Transaction.store.ilike(f"%{store}%"))
    
    # Ordenar por data (mais recente primeiro)
    query = query.order_by(desc(Transaction.created_at))
    
    # Paginação
    transactions = query.offset(offset).limit(limit).all()
    
    return transactions