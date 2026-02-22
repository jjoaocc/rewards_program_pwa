from fastapi import APIRouter
from app.api.v1 import auth, customers, transactions, notifications, products, events

api_router = APIRouter()

# Incluir todas as rotas
api_router.include_router(auth.router)
api_router.include_router(customers.router)
api_router.include_router(transactions.router)
api_router.include_router(notifications.router)
api_router.include_router(products.router)
api_router.include_router(events.router)