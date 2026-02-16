from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..crud import users as crud_users
from ..models.database import get_db
from ..dependencies import get_current_admin_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(get_current_admin_user)] # Proteger todas las rutas de este router
)

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todos los usuarios. Solo para administradores.
    """
    users = crud_users.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int,
    role_update: schemas.UserRoleUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza el rol de un usuario. Solo para administradores.
    """
    db_user = crud_users.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return crud_users.update_user_role(db=db, user_id=user_id, role=role_update.role)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina un usuario. Solo para administradores.
    """
    db_user = crud_users.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    crud_users.delete_user(db=db, user_id=user_id)
    return None
