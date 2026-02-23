from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ....schemas.user import User, UserCreate
from ....schemas.token import Token
from ....services.user import user_service
from ....db.session import get_db
from ....core.security import create_access_token
from ....core.config import settings

router = APIRouter()

@router.post("/register", response_model=User)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = user_service.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    user = user_service.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    return user_service.create(db=db, obj_in=user_in)

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Intentar autenticar por username o email
    user = user_service.get_by_email(db, email=form_data.username)
    if not user:
        user = user_service.get_by_username(db, username=form_data.username)

    if not user or not user_service.authenticate(db, username=user.username, password=form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        subject=user.username,
        role=user.role
    )
    return {"access_token": access_token, "token_type": "bearer"}
