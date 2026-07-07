from fastapi import APIRouter

from app.api.v1 import auth, customers, events, notifications, products, push, transactions

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(customers.router)
api_router.include_router(transactions.router)
api_router.include_router(notifications.router)
api_router.include_router(products.router)
api_router.include_router(events.router)
api_router.include_router(push.router)
