from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum as PyEnum
from .user import User

class ArticleStatusEnum(str, PyEnum):
    draft = "draft"
    review = "review"
    published = "published"

class ArticleBase(BaseModel):
    title: str
    content: str
    category: str = "Nacional"
    status: ArticleStatusEnum = ArticleStatusEnum.draft

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    status: Optional[ArticleStatusEnum] = None
    editor_id: Optional[int] = None
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None

class ArticleStatusUpdate(BaseModel):
    status: ArticleStatusEnum
    feedback: Optional[str] = None

class Article(ArticleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_id: int
    editor_id: Optional[int] = None
    editor_feedback: Optional[str] = None
    image_filename: Optional[str] = None
    author: User
    editor: Optional[User] = None

    class Config:
        from_attributes = True
