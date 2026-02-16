from typing import Optional
from sqlalchemy.orm import Session
from ..models import article as models
from ..models import user as user_models # Para acceder al modelo User en relaciones
from ..schemas import ArticleCreate, ArticleUpdate

def get_article(db: Session, article_id: int):
    return db.query(models.Article).filter(models.Article.id == article_id).first()

def get_articles(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.Article)
    if status:
        query = query.filter(models.Article.status == status)
    return query.offset(skip).limit(limit).all()

# Nueva función: Obtener artículos por autor
def get_articles_by_author(db: Session, author_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Article).filter(models.Article.author_id == author_id).offset(skip).limit(limit).all()

# Nueva función: Obtener artículos por editor asignado
def get_articles_by_editor(db: Session, editor_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Article).filter(models.Article.editor_id == editor_id).offset(skip).limit(limit).all()

def create_article(db: Session, article: ArticleCreate, author_id: int):
    db_article = models.Article(
        title=article.title,
        content=article.content,
        status=article.status,
        author_id=author_id
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

def update_article(db: Session, article_id: int, article_update: ArticleUpdate):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        for var, value in vars(article_update).items():
            if value is not None:
                setattr(db_article, var, value)
        db.commit()
        db.refresh(db_article)
    return db_article

def delete_article(db: Session, article_id: int):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        db.delete(db_article)
        db.commit()
    return db_article

# Nueva función: Asignar editor a un artículo
def assign_editor_to_article(db: Session, article_id: int, editor_id: int):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        db_article.editor_id = editor_id
        db.commit()
        db.refresh(db_article)
    return db_article

# Nueva función para cambiar solo el estado de un artículo
def update_article_status(db: Session, article_id: int, status: str):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        db_article.status = status
        db.commit()
        db.refresh(db_article)
    return db_article