from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, articles, users
from .models.database import engine, Base

# Crear las tablas en la base de datos si no existen (solo para desarrollo, Alembic es preferible para producción)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CMS de Periódico - API",
    description="API RESTful para la gestión de un CMS de periódico, incluyendo usuarios, artículos y autenticación.",
    version="1.0.0",
)

# Configuración de CORS para permitir peticiones desde el frontend de Angular
origins = [
    "http://localhost",
    "http://localhost:4200",  # Puerto por defecto de Angular CLI
    # Agrega aquí la URL de tu frontend en producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "¡Bienvenido a la API del CMS de Periódico!"}
