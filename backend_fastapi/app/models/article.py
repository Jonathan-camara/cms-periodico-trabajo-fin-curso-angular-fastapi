from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, LargeBinary
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
    category = Column(String(50), default="General")
    editor_feedback = Column(Text, nullable=True) # Feedback del editor al rechazar
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Nuevos campos para archivos locales (imágenes/documentos)
    image_data = Column(LargeBinary, nullable=True)
    image_filename = Column(String(255), nullable=True)

    author_id = Column(Integer, ForeignKey("users.id"))
    editor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship("User", foreign_keys=[author_id], back_populates="authored_articles")
    editor = relationship("User", foreign_keys=[editor_id], back_populates="edited_articles")
    comments = relationship("Comment", back_populates="article", cascade="all, delete-orphan")

