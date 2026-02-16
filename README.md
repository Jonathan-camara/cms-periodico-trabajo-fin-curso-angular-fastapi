# CMS_Periodico: Sistema de Gestión de Contenidos para Periódicos

Este proyecto es un Sistema de Gestión de Contenidos (CMS) diseñado para periódicos, implementado como una aplicación web full-stack. Consiste en un backend robusto construido con FastAPI (Python) y un frontend dinámico desarrollado con Angular (TypeScript).

## Características Principales

*   **Gestión de Artículos:** Creación, lectura, actualización y eliminación de artículos.
*   **Roles de Usuario:**
    *   **Redactor:** Crea y edita sus propios artículos (en estado borrador), puede enviarlos a revisión y eliminar sus propios borradores.
    *   **Editor:** Revisa artículos, los aprueba para publicación, los rechaza a borrador, y puede editar cualquier artículo.
    *   **Administrador:** Control total sobre todos los artículos, usuarios y configuraciones del sistema.
*   **Autenticación y Autorización:** Seguridad basada en JWT para proteger las rutas de la API.
*   **Base de Datos:** Utiliza MySQL para la persistencia de datos, gestionada a través de SQLAlchemy.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales:

*   `backend_fastapi/`: Contiene la aplicación FastAPI (API REST).
*   `frontend_angular/`: Contiene la aplicación Angular.

## Configuración del Entorno

Asegúrate de tener instalados los siguientes requisitos:

*   **Python 3.8+**
*   **Node.js y npm** (o yarn)
*   **MySQL Server**
*   **Angular CLI** (`npm install -g @angular/cli`)

### Backend (FastAPI)

1.  **Navega al directorio del backend:**
    ```bash
    cd backend_fastapi
    ```
2.  **Crea y activa un entorno virtual:**
    ```bash
    python -m venv venv
    # En Windows
    ./venv/Scripts/activate
    # En Linux/macOS
    source venv/bin/activate
    ```
3.  **Instala las dependencias de Python:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configura las variables de entorno:**
    Crea un archivo `.env` en el directorio `backend_fastapi/` con el siguiente contenido (reemplaza con tus credenciales):
    ```
    DATABASE_URL="mysql+mysqlconnector://user:password@host:port/cms_db"
    SECRET_KEY="your_super_secret_key"
    ```
    *   `DATABASE_URL`: Cadena de conexión a tu base de datos MySQL.
    *   `SECRET_KEY`: Clave secreta para la generación de tokens JWT.
5.  **Aplica las migraciones de la base de datos:**
    *   Asegúrate de que tu servidor MySQL esté corriendo.
    *   Ejecuta: `alembic upgrade head`
        *   Si es la primera vez, puede que necesites ejecutar `alembic revision --autogenerate -m "Initial migration"` y luego `alembic upgrade head`.

### Frontend (Angular)

1.  **Navega al directorio del frontend:**
    ```bash
    cd frontend_angular
    ```
2.  **Instala las dependencias de Node.js:**
    ```bash
    npm install
    # o
    yarn install
    ```

## Cómo Arrancar la Aplicación

### 1. Arrancar el Backend (FastAPI)

Desde el directorio `backend_fastapi/` (con el entorno virtual activado):

```bash
uvicorn app.main:app --reload
```

Esto iniciará el servidor FastAPI, generalmente accesible en `http://127.0.0.1:8000`.

### 2. Arrancar el Frontend (Angular)

Desde el directorio `frontend_angular/`:

```bash
ng serve
```

Esto iniciará el servidor de desarrollo de Angular, generalmente accesible en `http://localhost:4200/`.

¡Ahora puedes acceder a la aplicación en tu navegador!

## Autenticación y Roles

*   Para probar diferentes roles, puedes registrar usuarios con el endpoint `/auth/register` (desde la UI del frontend o directamente desde la documentación de Swagger del backend en `http://127.0.0.1:8000/docs`).
*   Los roles se definen en el registro (`"redactor"` por defecto). Un administrador puede crearse manualmente o asignarse el rol `admin` directamente en la base de datos para realizar pruebas.

## Próximos Pasos (Pendientes)

*   Implementar dashboards específicos para Editor y Administrador con todas sus herramientas (gestión de usuarios, base de datos).
*   Desarrollo de un sistema de suscripciones.
*   Mejoras en la interfaz de usuario y experiencia de usuario.
*   Pruebas exhaustivas y preparación para el despliegue.
