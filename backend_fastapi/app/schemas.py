from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum as PyEnum

# Enum para el estado del artículo (duplicado del modelo, pero necesario para Pydantic)
class ArticleStatusEnum(str, PyEnum):
    draft = "draft"
    review = "review"
    published = "published"

# Esquemas para Usuarios
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "redactor" # Valor por defecto

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserBase):
    id: int
    hashed_password: str
    is_active: bool

    class Config:
        from_attributes = True # Anteriormente orm_mode = True para Pydantic v1

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

# Esquemas para Artículos
class ArticleBase(BaseModel):
    title: str
    content: str
    status: ArticleStatusEnum = ArticleStatusEnum.draft # Valor por defecto

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    status: Optional[ArticleStatusEnum] = None
    editor_id: Optional[int] = None

class ArticleInDB(ArticleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_id: int
    editor_id: Optional[int] = None

    class Config:
        from_attributes = True

class Article(ArticleInDB):
    author: User # Relación con el esquema de usuario
    editor: Optional[User] = None # Relación con el esquema de usuario, puede ser nulo

# Esquemas para Autenticación
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Nuevo esquema para actualizar solo el estado de un artículo
class ArticleStatusUpdate(BaseModel):
    status: ArticleStatusEnum