from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_product_repository
from app.application import product_use_cases
from app.domain.product import ProductFilters
from app.ports.product_repository import ProductRepository
from app.schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductResponse])
def get_products(
    category: str | None = Query(None, description="Filtrar por categoria"),
    min_points: Decimal | None = Query(None, description="Pontos mínimos"),
    max_points: Decimal | None = Query(None, description="Pontos máximos"),
    in_stock: bool = Query(True, description="Apenas produtos em estoque"),
    active_only: bool = Query(True, description="Apenas produtos ativos"),
    repo: ProductRepository = Depends(get_product_repository),
):
    """
    Lista produtos disponíveis para resgate.
    Não requer autenticação (catálogo público).
    """
    filters = ProductFilters(
        category=category,
        min_points=min_points,
        max_points=max_points,
        in_stock=in_stock,
        active_only=active_only,
    )
    return product_use_cases.list_products(repo, filters)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: str, repo: ProductRepository = Depends(get_product_repository)):
    """
    Retorna detalhes de um produto específico.
    """
    product = product_use_cases.get_product(repo, product_id)

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    return product
