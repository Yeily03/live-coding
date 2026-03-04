# Dockerfile
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar Flask
CMD ["python", "app.py"]