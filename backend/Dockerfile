# Multi-stage build para otimização
FROM python:3.11 as base

# Definir variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Criar usuário não-root para segurança
RUN groupadd -r django && useradd -r -g django django

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements primeiro para aproveitar cache do Docker
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar código da aplicação
COPY . /app/

# Copiar e dar permissão ao script de inicialização
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Criar diretórios necessários
RUN mkdir -p /app/media /app/static && \
    chown -R django:django /app

# Mudar para usuário não-root
USER django

# Expor porta
EXPOSE 8000

# Usar o script de inicialização
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Stage para desenvolvimento
FROM base as development
USER root
RUN pip install ipdb pytest-django
USER django

# Stage para produção
FROM base as production
USER root
RUN pip install gunicorn
USER django
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "config.wsgi:application"]