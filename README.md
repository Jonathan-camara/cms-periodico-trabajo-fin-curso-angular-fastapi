# CMS Periodico de Upgrade v2.0 - Arquitectura Modular

## ⚡ COMANDOS RÁPIDOS PARA ARRANCAR

### 🐍 Backend (Desde carpeta `backend_fastapi`)
**Activar Entorno Virtual:**
*   En **Git Bash (MINGW64)**: `source venv/Scripts/activate`
*   En **PowerShell**: `.\venv\Scripts\activate`

**Ejecutar Servidor:**
`uvicorn app.main:app --reload`

### 🅰️ Frontend (Desde carpeta `frontend_angular`)
`ng serve`

---

## 🚀 Tecnologías Principales

*   **Backend:** FastAPI (Python 3.10+), SQLAlchemy (ORM), Pydantic (Validación), JWT (Seguridad).
*   **Frontend:** Angular 17+ (TypeScript), Arquitectura basada en Features, Signals para estado reactivo, Lazy Loading.
*   **Base de Datos:** MySQL.

---

## 🏗️ Arquitectura Modular

El proyecto ha sido refactorizado para garantizar robustez y facilidad de mantenimiento:

### Backend (app/)
*   **core/:** Configuración global, seguridad (JWT/hashing) y excepciones.
*   **db/:** Sesión de base de datos y modelos base.
*   **api/v1/:** Endpoints versionados y organizados por dominio.
*   **services/:** Capa de lógica de negocio (desacoplada de los controladores HTTP).
*   **schemas/:** Modelos de Pydantic organizados por funcionalidad.

### Frontend (src/app/)
*   **core/:** Servicios globales (auth, interceptores, guards).
*   **features/:** Módulos independientes por funcionalidad (articles, auth, dashboard, home).
*   **layout/:** Componentes de interfaz global (header, footer).
*   **shared/:** Componentes y pipes reutilizables.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jonathan-camara/cms-periodico-trabajo-fin-curso-angular-fastapi.git
cd cms-periodico-trabajo-fin-curso-angular-fastapi
```

### 2. Configuración del Backend (FastAPI)
Navega a la carpeta del backend:
```bash
cd backend_fastapi
```

**Crear y activar entorno virtual:**
```powershell
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate
```

**Instalar dependencias:**
```bash
pip install -r requirements.txt
```

**Variables de Entorno:**
Crea un archivo `.env` basado en `.env.example`:
```bash
DATABASE_URL="mysql+mysqlconnector://USUARIO:CONTRASEÑA@127.0.0.1:3306/NOMBRE_DB"
SECRET_KEY="tu_clave_secreta_aqui"
```

**Arrancar Backend:**
```bash
uvicorn app.main:app --reload
```
La API estará disponible en `http://localhost:8000`. Documentación interactiva en `/docs`.

---

### 3. Configuración del Frontend (Angular)
Navega a la carpeta del frontend:
```bash
cd ../frontend_angular
```

**Instalar dependencias:**
```bash
npm install
```

**Arrancar Frontend:**
```bash
ng serve
```
La aplicación estará disponible en `http://localhost:4200`.

---

## 👥 Roles y Permisos

1.  **Redactor:** Crea borradores, edita sus propios artículos (si no están publicados) y solicita revisión.
2.  **Editor:** Revisa, aprueba o rechaza cualquier artículo. Gestión de contenidos.
3.  **Administrador:** Control total sobre usuarios (roles) y contenidos de la plataforma.

## 📄 Licencia
Este proyecto es de uso educativo para el Bootcamp de Upgrade Hub.
