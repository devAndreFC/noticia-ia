#!/bin/bash

# Script de inicialização do Django

# Aguardar o banco de dados estar disponível
echo "Aguardando banco de dados..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Banco de dados disponível!"

# Executar migrações
echo "Executando migrações..."
python manage.py makemigrations
python manage.py migrate

# Criar superusuário se não existir
echo "Verificando superusuário..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuário criado: admin/admin123')
else:
    print('Superusuário já existe')
"

# Executar comando passado como argumento
exec "$@"