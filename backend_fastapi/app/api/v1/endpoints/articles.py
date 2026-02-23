from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from ....schemas.article import Article, ArticleCreate, ArticleUpdate, ArticleStatusUpdate
from ....services.article import article_service
from ....db.session import get_db
from ....dependencies import get_optional_current_user, get_current_admin_user, get_current_editor_user, get_current_redactor_user, get_current_active_user
from ....models.user import User as UserModel
from ....models.article import ArticleStatus

router = APIRouter()

@router.post("/", response_model=Article, status_code=status.HTTP_201_CREATED)
async def create_article(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form("Nacional"),
    status_art: str = Form("draft"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Article = Depends(get_current_redactor_user)
):
    image_data = None
    image_filename = None
    
    if file:
        image_data = await file.read()
        image_filename = file.filename
        
    article_in = ArticleCreate(title=title, content=content, status=status_art, category=category)
    return article_service.create_with_author(
        db=db, 
        obj_in=article_in, 
        author_id=current_user.id,
        image_data=image_data,
        image_filename=image_filename
    )

@router.get("/", response_model=List[Article])
def read_articles(
    skip: int = 0,
    limit: int = 100,
    mine: Optional[bool] = False,
    author_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_optional_current_user)
):
    return article_service.get_articles(
        db, 
        skip=skip, 
        limit=limit, 
        mine=mine, 
        author_id=author_id, 
        current_user=current_user
    )

@router.get("/{article_id}", response_model=Article)
def read_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_optional_current_user)
):
    db_article = article_service.get(db, id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    # Visibilidad
    if db_article.status != ArticleStatus.published:
        if not current_user or (current_user.role not in ["admin", "editor"] and current_user.id not in [db_article.author_id, db_article.editor_id]):
            raise HTTPException(status_code=403, detail="No tienes permisos para ver este artículo")

    return db_article

@router.put("/{article_id}", response_model=Article)
async def update_article(
    article_id: int,
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    status_art: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    image_data = None
    image_filename = None
    if file:
        image_data = await file.read()
        image_filename = file.filename

    article_update = ArticleUpdate(
        title=title, 
        content=content, 
        category=category, 
        status=status_art
    )

    return article_service.update_article(
        db=db, 
        article_id=article_id, 
        obj_in=article_update,
        current_user=current_user,
        image_data=image_data,
        image_filename=image_filename
    )

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_article = article_service.get(db, id=article_id)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    if current_user.role == 'admin' or (current_user.role == 'redactor' and db_article.author_id == current_user.id and db_article.status == ArticleStatus.draft):
        article_service.remove(db, id=article_id)
    else:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este artículo.")
    
    return None

@router.get("/{article_id}/image")
def get_article_image(article_id: int, db: Session = Depends(get_db)):
    db_article = article_service.get(db, id=article_id)
    if not db_article or not db_article.image_data:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    return Response(content=db_article.image_data, media_type="application/octet-stream")
