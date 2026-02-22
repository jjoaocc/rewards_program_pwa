from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.api.deps import get_db, get_current_customer
from app.models import Product, Customer
from app.schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    min_points: Optional[Decimal] = Query(None, description="Pontos mínimos"),
    max_points: Optional[Decimal] = Query(None, description="Pontos máximos"),
    in_stock: bool = Query(True, description="Apenas produtos em estoque"),
    active_only: bool = Query(True, description="Apenas produtos ativos"),
    db: Session = Depends(get_db)
):
    """
    Lista produtos disponíveis para resgate.
    Não requer autenticação (catálogo público).
    """
    
    query = db.query(Product)
    
    if active_only:
        query = query.filter(Product.active == True)
    
    if in_stock:
        query = query.filter(Product.stock > 0)
    
    if category:
        query = query.filter(Product.category == category)
    
    if min_points:
        query = query.filter(Product.points_cost >= min_points)
    
    if max_points:
        query = query.filter(Product.points_cost <= max_points)
    
    # Ordenar por pontos (menor para maior)
    products = query.order_by(Product.points_cost).all()
    
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna detalhes de um produto específico.
    """
    
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    return product