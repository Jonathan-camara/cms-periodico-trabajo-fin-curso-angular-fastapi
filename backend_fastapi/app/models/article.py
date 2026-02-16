from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class ArticleStatus(str, enum.Enum):
    draft = "draft"
    review = "review"
    published = "published"

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    content = Column(Text)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    author_id = Column(Integer, ForeignKey("users.id"))
    editor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship("User", foreign_keys=[author_id], back_populates="authored_articles")
    editor = relationship("User", foreign_keys=[editor_id], back_populates="edited_articles")
