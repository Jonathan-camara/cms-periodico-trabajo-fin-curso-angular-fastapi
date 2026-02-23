# Backend FastAPI para CMS_Periodico

Esta es la API para el proyecto CMS_Periodico, desarrollada con FastAPI.

## Instalación y Ejecución

Sigue estos pasos desde la terminal para configurar y arrancar el servidor de desarrollo.

1.  **Navega al directorio del backend:**
    ```shell
    cd "C:\Users\valle\Desktop\proyecto fin curso\CMS_Periodico\backend_fastapi"
    ```

2.  **Activa el entorno virtual:**
    ```shell
    .\venv\Scripts\activate
    ```
    *(Si usas una terminal como Git Bash, el comando podría ser `source ./venv/Scripts/activate`)*

3.  **Instala las dependencias (solo si es la primera vez o si `requirements.txt` ha cambiado):**
    ```shell
    pip install -r requirements.txt
    ```

4.  **Arranca el servidor de desarrollo:**
    ```shell
    uvicorn app.main:app --reload
    ```

Una vez ejecutado este último comando, el servidor estará funcionando y disponible en `http://127.0.0.1:8000`.

La opción `--reload` es muy útil porque reinicia el servidor automáticamente cada vez que guardas un cambio en el código.
