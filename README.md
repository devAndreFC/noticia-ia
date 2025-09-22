# Newsletter Inteligente

Sistema de newsletter com curadoria inteligente de notícias usando Django REST Framework, React e PostgreSQL.

## 🚀 Tecnologias

- **Backend**: Django REST Framework + PostgreSQL + Celery + Redis
- **Frontend**: React + TypeScript + Material-UI
- **Containerização**: Docker + Docker Compose
- **Proxy**: Nginx
- **Monitoramento**: Flower (Celery)

## 📋 Pré-requisitos

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose
- Git

## 🛠️ Configuração Inicial

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd newsletter-inteligente
```

2. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Build e inicialização**:

```bash
# Desenvolvimento
make dev-build
make dev-up

# Ou usando docker-compose diretamente
docker-compose -f docker-compose.dev.yml up --build
```

## 🔧 Comandos Disponíveis

O Makefile funciona em **Linux, Mac e Windows**:

```bash
make help                 # Lista todos os comandos
make dev-up              # Sobe ambiente de desenvolvimento
make dev-up-logs         # Sobe ambiente com logs visíveis
make dev-down            # Para ambiente de desenvolvimento
make dev-logs            # Mostra logs
make dev-restart         # Reinicia containers
make backend-shell       # Acessa shell do backend
make frontend-shell      # Acessa shell do frontend
make db-shell            # Acessa shell do PostgreSQL
make redis-shell         # Acessa shell do Redis
make migrate             # Executa migrações
make makemigrations      # Cria migrações
make createsuperuser     # Cria superusuário
make collectstatic       # Coleta arquivos estáticos
make test-backend        # Executa testes do backend
make test-frontend       # Executa testes do frontend
make clean               # Remove containers e volumes
make clean-all           # Remove tudo (cuidado!)
make status              # Mostra status dos containers
make flower              # Abre Flower (monitoramento Celery)
make backup-db           # Faz backup do banco
make restore-db FILE=... # Restaura backup do banco
```

## 🌐 URLs de Acesso

Após inicializar os containers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **Flower (Celery)**: http://localhost:5555

## 📁 Estrutura do Projeto

```
newsletter-inteligente/
├── backend/                 # Django REST Framework
│   ├── apps/
│   │   ├── news/           # App de notícias
│   │   ├── users/          # App de usuários
│   │   └── curator/        # Agente curador
│   ├── config/             # Configurações Django
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── Dockerfile
├── nginx/                  # Configurações Nginx
├── docker-compose.yml      # Produção
├── docker-compose.dev.yml  # Desenvolvimento
├── docker-compose.prod.yml # Override produção
├── Makefile               # Comandos (Linux/Mac/Windows)
└── README.md
```

## 🔄 Ambientes

### Desenvolvimento
- Hot reload habilitado
- Debug ativo
- Volumes montados para desenvolvimento
- Portas expostas individualmente

```bash
make dev-up
```

### Produção
- Build otimizado
- Nginx como proxy reverso
- Gunicorn para Django
- Volumes persistentes

```bash
make prod-up
```

## 🗄️ Banco de Dados

### Migrações
```bash
make migrate
make makemigrations
```

### Backup e Restore
```bash
make backup-db
make restore-db FILE=backup.sql
```

## 🧪 Testes

```bash
# Backend
make test-backend

# Frontend
make test-frontend
```

## 🐛 Debugging

### Logs
```bash
# Todos os serviços
make dev-logs

# Serviço específico
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Shell Access
```bash
# Backend Django
make backend-shell

# Frontend React
make frontend-shell

# Banco de dados
make db-shell

# Redis
make redis-shell
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**:
   - Altere as portas no docker-compose.yml
   - Ou pare outros serviços usando as mesmas portas

2. **Permissões no Windows**:
   - Execute PowerShell como Administrador
   - Configure Docker Desktop para usar WSL2

3. **Hot reload não funciona**:
   - Verifique se CHOKIDAR_USEPOLLING=true está configurado
   - Reinicie o container frontend

4. **Banco não conecta**:
   - Aguarde o PostgreSQL inicializar completamente
   - Verifique logs: `docker-compose logs db`

### Limpeza
```bash
# Remove containers e volumes
make clean

# Remove tudo (cuidado!)
make clean-all
```

## 📝 Próximos Passos

1. Implementar modelos Django (User, News, Category)
2. Criar serializers e viewsets da API
3. Desenvolver componentes React
4. Implementar agente curador
5. Adicionar testes unitários
6. Configurar CI/CD

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.