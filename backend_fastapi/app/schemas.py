from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum as PyEnum

# Enum para el estado del artículo (duplicado del modelo, pero necesario para Pydantic)
class ArticleStatusEnum(str, PyEnum):
    draft = "draft"
    review = "review"
    published = "published"

# Esquemas para Suscripciones
class SubscriptionBase(BaseModel):
    plan: str = "free"
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    user_id: Optional[int] = None

class SubscriptionUpdate(SubscriptionBase):
    end_date: Optional[datetime] = None

class SubscriptionInDB(SubscriptionBase):
    id: int
    user_id: int
    start_date: datetime
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class Subscription(SubscriptionInDB):
    pass

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
    subscription: Optional[Subscription] = None

    class Config:
        from_attributes = True # Anteriormente orm_mode = True para Pydantic v1

class User(UserBase):
    id: int
    is_active: bool
    subscription: Optional[Subscription] = None

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

# Esquemas para Artículos
class ArticleBase(BaseModel):
    title: str
    content: str
    category: str = "Nacional"
    status: ArticleStatusEnum = ArticleStatusEnum.draft # Valor por defecto

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    status: Optional[ArticleStatusEnum] = None
    editor_id: Optional[int] = None
    category: Optional[str] = None

class ArticleInDB(ArticleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_id: int
    editor_id: Optional[int] = None
    editor_feedback: Optional[str] = None
    image_filename: Optional[str] = None

    class Config:
        from_attributes = True

class ArticleStatusUpdate(BaseModel):
    status: ArticleStatusEnum
    feedback: Optional[str] = None # Nuevo campo opcional para el feedback

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

# Esquemas para Comentarios
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    article_id: int

class Comment(CommentBase):
    id: int
    created_at: datetime
    article_id: int
    user_id: int
    user: User # Para saber quién escribió el comentario

    class Config:
        from_attributes = True