from sqlalchemy.orm import Session
from ..models import subscription as models
from ..schemas import SubscriptionCreate, SubscriptionUpdate
from datetime import datetime

def get_subscription(db: Session, subscription_id: int):
    return db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()

def get_user_subscription(db: Session, user_id: int):
    return db.query(models.Subscription).filter(models.Subscription.user_id == user_id).first()

def create_subscription(db: Session, subscription: SubscriptionCreate, user_id: int):
    db_subscription = models.Subscription(
        **subscription.dict(),
        user_id=user_id
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def update_subscription(db: Session, user_id: int, subscription_update: SubscriptionUpdate):
    db_subscription = db.query(models.Subscription).filter(models.Subscription.user_id == user_id).first()
    if db_subscription:
        for key, value in subscription_update.dict(exclude_unset=True).items():
            setattr(db_subscription, key, value)
        db.commit()
        db.refresh(db_subscription)
    else:
        # Si no existe, la creamos
        db_subscription = models.Subscription(
            **subscription_update.dict(),
            user_id=user_id
        )
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
    return db_subscription

def delete_subscription(db: Session, subscription_id: int):
    db_subscription = db.query(models.Subscription).filter(models.Subscription.id == subscription_id).first()
    if db_subscription:
        db.delete(db_subscription)
        db.commit()
    return db_subscription
