from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="redactor") # Roles: redactor, editor, admin

    authored_articles = relationship("Article", back_populates="author", foreign_keys="[Article.author_id]")
    edited_articles = relationship("Article", back_populates="editor", foreign_keys="[Article.editor_id]")
