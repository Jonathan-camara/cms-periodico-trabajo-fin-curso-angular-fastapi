from datetime import datetime, timedelta
from typing import Optional
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from . import schemas
from .crud import users as crud_users # Importar crud.users explícitamente
from .models.database import get_db

# Cargar variables de entorno (ya lo hacemos en database.py, pero es bueno tener la referencia)
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable is not set.")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
# Nuevo esquema para autenticación opcional
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


def create_access_token(data: dict, user_id: int, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    to_encode.update({"user_id": user_id}) # Añadir el user_id al payload
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
    user = crud_users.get_user_by_username(db, username=token_data.username) # Llamada corregida
    if user is None:
        raise credentials_exception
    return user

# Nueva función para obtener el usuario actual de forma opcional
async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            return None
        user = crud_users.get_user_by_username(db, username=username)
        if user is None:
            return None
        if not user.is_active:
            return None
        return user
    except JWTError:
        return None

def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

def get_current_admin_user(current_user: schemas.User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return current_user

def get_current_editor_user(current_user: schemas.User = Depends(get_current_active_user)):
    if current_user.role not in ["editor", "admin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de editor o administrador")
    return current_user

def get_current_redactor_user(current_user: schemas.User = Depends(get_current_active_user)):
    if current_user.role not in ["redactor", "editor", "admin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de redactor, editor o administrador")
    return current_user