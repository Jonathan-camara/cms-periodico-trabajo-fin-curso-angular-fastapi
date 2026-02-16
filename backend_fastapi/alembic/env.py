# Importar sys y os para manejar el path
import sys
import os

# Añadir la ruta del proyecto al PATH para que Python encuentre los módulos
# Se asume que este script se ejecuta desde backend_fastapi/
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), 'app')))

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Esto es lo que añadimos:
from app.models.database import Base, engine
from app.models.user import User # Importa tus modelos para que Base.metadata los detecte
from app.models.article import Article # Importa tus modelos


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata # Usamos Base.metadata de nuestros modelos

# other values from the config, defined by the needs of env.py,
# can be acquired thus:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an actual Engine, though an Engine is supplied
    when invoking Alembic from the CLI.  By passing in the URL
    here, we make migrations able to run against an offline database
    for those productions where little or no connectivity is specified.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # Usamos el engine de nuestra configuración de la base de datos
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()