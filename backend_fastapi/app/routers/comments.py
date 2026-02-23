from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..crud import comments as crud_comments
from ..models.database import get_db
from ..dependencies import get_current_active_user, get_optional_current_user

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

@router.get("/{article_id}", response_model=List[schemas.Comment])
def read_comments(article_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los comentarios de un artículo. Público.
    """
    return crud_comments.get_comments_by_article(db, article_id=article_id)

@router.post("/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Crea un comentario. Requiere estar logueado.
    """
    return crud_comments.create_comment(db=db, comment=comment, user_id=current_user.id)

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Elimina un comentario. Solo el autor o un admin/editor (lógica simplificada aquí).
    """
    # Por ahora permitimos borrar si estás logueado para simplificar, 
    # pero en producción validaríamos que seas el autor.
    crud_comments.delete_comment(db, comment_id=comment_id)
    return None
