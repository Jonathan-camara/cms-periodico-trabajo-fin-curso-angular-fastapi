from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

# Importaciones corregidas
from .. import schemas
from ..crud import users as crud_users # Importar crud.users explícitamente
from ..models.database import get_db
from ..dependencies import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud_users.get_user_by_email(db, email=user.email) # Llamada corregida
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    db_user = crud_users.get_user_by_username(db, username=user.username) # Llamada corregida
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    return crud_users.create_user(db=db, user=user) # Llamada corregida

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Intenta autenticar primero por email, luego por username
    user = crud_users.get_user_by_email(db, email=form_data.username)
    if not user:
        user = crud_users.get_user_by_username(db, username=form_data.username)

    if not user or not crud_users.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        user_id=user.id, # Añadir el user_id
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}