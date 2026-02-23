from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .subscription import Subscription

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "redactor"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    subscription: Optional[Subscription] = None

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str
