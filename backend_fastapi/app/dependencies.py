from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .core.config import settings
from .db.session import get_db
from .services.user import user_service
from .models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = user_service.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            return None
        user = user_service.get_by_username(db, username=username)
        if user is None or not user.is_active:
            return None
        return user
    except JWTError:
        return None

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return current_user

def get_current_editor_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in ["editor", "admin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de editor o administrador")
    return current_user

def get_current_redactor_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in ["redactor", "editor", "admin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de redactor, editor o administrador")
    return current_user
