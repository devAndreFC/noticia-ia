#!/bin/bash

# Script de inicialização do Django

# Verificar se o projeto já foi criado
if [ ! -f "/app/config/settings.py" ]; then
    echo "Criando projeto Django..."
    django-admin startproject config .
    
    # Criar apps
    echo "Criando apps..."
    python manage.py startapp core apps/core
    python manage.py startapp users apps/users
    python manage.py startapp news apps/news
    python manage.py startapp curator apps/curator
    
    echo "Projeto Django criado com sucesso!"
fi

# Executar migrações
echo "Executando migrações..."
python manage.py makemigrations
python manage.py migrate

# Executar comando passado como argumento
exec "$@"