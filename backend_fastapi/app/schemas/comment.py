from pydantic import BaseModel
from datetime import datetime
from .user import User

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    article_id: int

class Comment(CommentBase):
    id: int
    created_at: datetime
    article_id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True
