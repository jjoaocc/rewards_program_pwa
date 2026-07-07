from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import ProductResponse
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductResponse])
def get_products(
    category: str | None = Query(None, description="Filtrar por categoria"),
    min_points: Decimal | None = Query(None, description="Pontos mínimos"),
    max_points: Decimal | None = Query(None, description="Pontos máximos"),
    in_stock: bool = Query(True, description="Apenas produtos em estoque"),
    active_only: bool = Query(True, description="Apenas produtos ativos"),
    db: Session = Depends(get_db),
):
    """
    Lista produtos disponíveis para resgate.
    Não requer autenticação (catálogo público).
    """
    return product_service.list_products(
        db,
        category=category,
        min_points=min_points,
        max_points=max_points,
        in_stock=in_stock,
        active_only=active_only,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: str, db: Session = Depends(get_db)):
    """
    Retorna detalhes de um produto específico.
    """
    product = product_service.get_product_by_id(db, product_id)

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    return product
