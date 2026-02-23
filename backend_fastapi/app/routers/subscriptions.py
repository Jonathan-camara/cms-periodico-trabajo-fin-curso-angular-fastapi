from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..crud import subscriptions as crud_subscriptions
from ..models.database import get_db
from ..dependencies import get_current_active_user, get_current_admin_user

router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"]
)

@router.get("/me", response_model=schemas.Subscription)
def read_my_subscription(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Obtiene la suscripción del usuario actual.
    """
    db_subscription = crud_subscriptions.get_user_subscription(db, user_id=current_user.id)
    if not db_subscription:
        # Si no tiene, devolvemos una suscripción gratuita por defecto (simulada o creada)
        return schemas.Subscription(
            id=0, user_id=current_user.id, plan="free", is_active=True, start_date=current_user.id # Fake date for now
        )
    return db_subscription

@router.put("/me", response_model=schemas.Subscription)
def update_my_subscription(
    subscription_update: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Actualiza (o crea) la suscripción del usuario actual.
    """
    return crud_subscriptions.update_subscription(db, user_id=current_user.id, subscription_update=subscription_update)

# Rutas para Administrador
@router.put("/{user_id}", response_model=schemas.Subscription)
def admin_update_user_subscription(
    user_id: int,
    subscription_update: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_admin: schemas.User = Depends(get_current_admin_user)
):
    """
    Actualiza la suscripción de cualquier usuario. Solo para administradores.
    """
    return crud_subscriptions.update_subscription(db, user_id=user_id, subscription_update=subscription_update)
