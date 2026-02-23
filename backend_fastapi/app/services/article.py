from typing import List, Optional, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.article import Article, ArticleStatus
from ..models.user import User as UserModel
from ..schemas.article import ArticleCreate, ArticleUpdate, ArticleStatusEnum
from .base import BaseService

class ArticleService(BaseService[Article, ArticleCreate, ArticleUpdate]):
    def get_articles(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        status_filter: Optional[str] = None,
        author_id: Optional[int] = None,
        current_user: Optional[UserModel] = None,
        mine: bool = False
    ) -> List[Article]:
        query = db.query(self.model)
        
        # Filtrar por autor específico si se solicita y el usuario tiene permisos
        if author_id is not None:
            if not current_user or current_user.role not in ["editor", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permisos para filtrar artículos por autor"
                )
            query = query.filter(self.model.author_id == author_id)
        
        # Si un usuario está logueado y pide SUS artículos
        elif current_user and mine:
            query = query.filter(self.model.author_id == current_user.id)
            
        # Lógica de visibilidad por roles si no se pide algo específico
        elif current_user and current_user.role in ["editor", "admin"]:
            # Editores y admins ven todo por defecto si no hay filtros específicos
            if status_filter:
                query = query.filter(self.model.status == status_filter)
        else:
            # Visitantes o usuarios estándar solo ven artículos publicados
            query = query.filter(self.model.status == ArticleStatus.published.value)

        return query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    def create_with_author(
        self, 
        db: Session, 
        *, 
        obj_in: ArticleCreate, 
        author_id: int,
        image_data: bytes = None,
        image_filename: str = None
    ) -> Article:
        db_obj = self.model(
            **obj_in.model_dump(),
            author_id=author_id,
            image_data=image_data,
            image_filename=image_filename
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_article(
        self,
        db: Session,
        *,
        article_id: int,
        obj_in: ArticleUpdate,
        current_user: UserModel,
        image_data: bytes = None,
        image_filename: str = None
    ) -> Article:
        db_article = self.get(db, article_id)
        if not db_article:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        # Lógica de permisos
        if current_user.role == "redactor":
            if db_article.author_id != current_user.id or db_article.status == ArticleStatus.published:
                raise HTTPException(status_code=403, detail="No tienes permisos para actualizar este artículo o ya ha sido publicado.")
            # Un redactor no puede cambiar el estado por este medio
            obj_in.status = None

        elif current_user.role == "editor":
            if not (db_article.status == ArticleStatus.review or 
                    db_article.author_id == current_user.id or 
                    db_article.editor_id == current_user.id or 
                    db_article.status == ArticleStatus.published):
                raise HTTPException(status_code=403, detail="No tienes permisos para editar este artículo en su estado actual.")

        elif current_user.role == "admin":
            pass
        else:
            raise HTTPException(status_code=403, detail="No tienes permisos para actualizar artículos.")

        # Actualizar datos
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            if hasattr(db_article, field):
                setattr(db_article, field, update_data[field])
        
        if image_data:
            db_article.image_data = image_data
            db_article.image_filename = image_filename

        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        return db_article

article_service = ArticleService(Article)
