from sqlalchemy.orm import Session
from ..models import comment as models
from ..schemas import CommentCreate

def get_comments_by_article(db: Session, article_id: int):
    return db.query(models.Comment).filter(models.Comment.article_id == article_id).order_by(models.Comment.created_at.asc()).all()

def create_comment(db: Session, comment: CommentCreate, user_id: int):
    db_comment = models.Comment(
        content=comment.content,
        article_id=comment.article_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment:
        db.delete(db_comment)
        db.commit()
    return db_comment
