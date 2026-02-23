from sqlalchemy import create_engine, text
from app.models.database import engine, Base
from app.models.user import User
from app.models.article import Article
from app.models.subscription import Subscription
import os
from dotenv import load_dotenv

load_dotenv()

def run_migrations():
    print("--- 🔄 Iniciando Sincronización de Base de Datos ---")
    
    try:
        # 1. Crear tablas base si no existen (Suscripciones, etc.)
        print("Verificando tablas nuevas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas base verificadas/creadas.")

        # 2. Asegurar columnas específicas que SQLAlchemy a veces no detecta en tablas existentes
        # (Como el soporte para imágenes pesadas LONGBLOB en MySQL)
        alter_queries = [
            "ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL;",
            "ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_filename VARCHAR(255) NULL;"
        ]

        with engine.connect() as connection:
            for query in alter_queries:
                try:
                    # Usamos 'IF NOT EXISTS' si el motor lo soporta, o capturamos el error
                    connection.execute(text(query))
                    connection.commit()
                except Exception as e:
                    # Silenciamos errores de "columna duplicada"
                    if "Duplicate column name" not in str(e):
                        print(f"Nota: {e}")

        print("✅ Columnas de imágenes verificadas.")
        print("--- 🚀 Base de datos lista para funcionar ---")

    except Exception as e:
        print(f"❌ Error crítico durante la migración: {e}")

if __name__ == "__main__":
    run_migrations()
