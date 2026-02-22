from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router

# Criar app FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rewards-api"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Rewards Program API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Incluir rotas da API v1
app.include_router(api_router, prefix=settings.API_V1_PREFIX)