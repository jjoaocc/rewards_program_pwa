from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional

class RedemptionCreate(BaseModel):
    product_id: str
    quantity: int = 1

class RedemptionResponse(BaseModel):
    id: str
    customer_id: str
    product_id: str
    product_name: Optional[str] = None
    points_used: Decimal
    quantity: int
    status: str  # 'pending', 'completed', 'cancelled'
    redeemed_at: datetime
    
    class Config:
        from_attributes = True