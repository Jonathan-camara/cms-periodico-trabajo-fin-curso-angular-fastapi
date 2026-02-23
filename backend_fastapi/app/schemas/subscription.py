from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubscriptionBase(BaseModel):
    plan: str = "free"
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    user_id: Optional[int] = None

class SubscriptionUpdate(SubscriptionBase):
    end_date: Optional[datetime] = None

class Subscription(SubscriptionBase):
    id: int
    user_id: int
    start_date: datetime
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True
