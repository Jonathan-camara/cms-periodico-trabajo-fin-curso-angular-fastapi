from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Importaciones corregidas y añadidas
from .. import schemas
from ..crud import articles as crud_articles
from ..crud import users as crud_users
from ..models.database import get_db
from ..dependencies import get_optional_current_user, get_current_admin_user, get_current_editor_user, get_current_redactor_user, get_current_active_user
from ..models import user as user_models
from ..models.article import ArticleStatus # Importar el Enum del estado

router = APIRouter(
    prefix="/articles",
    tags=["Articles"]
)

@router.post("/", response_model=schemas.Article, status_code=status.HTTP_201_CREATED)
def create_article(
    article: schemas.ArticleCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_redactor_user)
):
    return crud_articles.create_article(db=db, article=article, author_id=current_user.id)

@router.get("/", response_model=List[schemas.Article])
def read_articles(
    skip: int = 0,
    limit: int = 100,
    mine: Optional[bool] = False,
    author_id: Optional[int] = None, # Añadido nuevo parámetro
    db: Session = Depends(get_db),
    current_user: Optional[user_models.User] = Depends(get_optional_current_user)
):
    # Lógica prioritaria: Filtrar por autor si se especifica el ID y el usuario tiene permisos
    if author_id is not None:
        if not current_user or current_user.role not in ["editor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para filtrar artículos por autor"
            )
        return crud_articles.get_articles_by_author(db, author_id=author_id, skip=skip, limit=limit)

    # Si un usuario está logueado y pide "sus" artículos
    if current_user and mine:
        if current_user.role == "redactor":
            return crud_articles.get_articles_by_author(db, author_id=current_user.id, skip=skip, limit=limit)
        if current_user.role == "editor":
            # Un editor puede querer ver los artículos que tiene asignados
            return crud_articles.get_articles_by_editor(db, editor_id=current_user.id, skip=skip, limit=limit)

    # Si es un editor o admin y no está pidiendo "sus" artículos, ve todos los artículos (sin filtrar por estado)
    if current_user and current_user.role in ["editor", "admin"]:
        return crud_articles.get_articles(db, skip=skip, limit=limit)

    # Para todos los demás casos (visitantes o usuarios estándar), mostrar solo los publicados
    return crud_articles.get_articles(db, skip=skip, limit=limit, status=ArticleStatus.published.value)


@router.get("/{article_id}", response_model=schemas.Article)
def read_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[user_models.User] = Depends(get_optional_current_user)
):
    db_article = crud_articles.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    # Si el artículo no está publicado, solo ciertos roles pueden verlo
    if db_article.status != ArticleStatus.published:
        if not current_user or (current_user.role not in ["admin", "editor"] and current_user.id not in [db_article.author_id, db_article.editor_id]):
            raise HTTPException(status_code=403, detail="No tienes permisos para ver este artículo")

    return db_article

@router.put("/{article_id}", response_model=schemas.Article)
def update_article(
    article_id: int,
    article_update: schemas.ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user) # Cambiado a get_current_active_user
):
    db_article = crud_articles.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    # Lógica de permisos detallada
    if current_user.role == "redactor":
        # Un redactor solo puede actualizar sus propios artículos y solo si están en estado "draft"
        if db_article.author_id != current_user.id or db_article.status != ArticleStatus.draft:
            raise HTTPException(status_code=403, detail="No tienes permisos para actualizar este artículo o su estado no permite la edición.")
        
        # Un redactor no puede cambiar el estado a través de este endpoint
        article_update.status = None # Ignorar cualquier intento de cambiar el estado

    elif current_user.role == "editor":
        # Un editor puede actualizar sus artículos, los que le fueron asignados, o los que están en revisión
        if not (db_article.author_id == current_user.id or \
                db_article.editor_id == current_user.id or \
                db_article.status == ArticleStatus.review):
            raise HTTPException(status_code=403, detail="No tienes permisos para actualizar este artículo.")

    elif current_user.role == "admin":
        # Un administrador puede actualizar cualquier artículo sin restricciones adicionales de rol
        pass # No se necesita comprobación adicional, ya que tienen control total
    else:
        # Cualquier otro rol no tiene permisos para actualizar artículos
        raise HTTPException(status_code=403, detail="No tienes permisos para actualizar artículos.")

    # Realizar la actualización
    return crud_articles.update_article(db=db, article_id=article_id, article_update=article_update)

@router.put("/{article_id}/status", response_model=schemas.Article)
def update_article_status_endpoint(
    article_id: int,
    status_update: schemas.ArticleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_editor_user) # Protegido para editor/admin
):
    db_article = crud_articles.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    updated_article = crud_articles.update_article_status(
        db=db, article_id=article_id, status=status_update.status
    )
    return updated_article

@router.put("/{article_id}/assign-editor/{editor_id}", response_model=schemas.Article)
def assign_editor(
    article_id: int,
    editor_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_editor_user)
):
    editor = crud_users.get_user(db, editor_id)
    if not editor or editor.role not in ["editor", "admin"]:
        raise HTTPException(status_code=400, detail="El ID proporcionado no corresponde a un editor o administrador")
    
    db_article = crud_articles.assign_editor_to_article(db=db, article_id=article_id, editor_id=editor_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return db_article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user) # Cambiado para permitir lógica de roles
):
    db_article = crud_articles.get_article(db, article_id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    # Lógica de permisos para eliminar
    can_delete = False
    if current_user.role == 'admin':
        can_delete = True
    elif current_user.role == 'redactor':
        if db_article.author_id == current_user.id and db_article.status == ArticleStatus.draft:
            can_delete = True

    if not can_delete:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este artículo.")
    
    crud_articles.delete_article(db=db, article_id=article_id)
    # Según el estándar HTTP, una respuesta 204 NO DEBE contener un cuerpo.
    # FastAPI se encarga de esto si el código de estado es 204 y devuelves None.
    return None

@router.get("/all/", response_model=List[schemas.Article])
def read_all_articles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[user_models.User] = Depends(get_optional_current_user)
):
    """
    Endpoint para obtener todos los artículos sin importar su estado.
    Protegido para roles 'editor' y 'admin'.
    """
    if not current_user or current_user.role not in ["editor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver todos los artículos"
        )
    
    articles = crud_articles.get_articles(db, skip=skip, limit=limit)
    return articles
