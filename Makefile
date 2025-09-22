# Newsletter Inteligente - Makefile
# Comandos para facilitar o desenvolvimento (Linux/Mac/Windows)

# Variáveis
COMPOSE_FILE_DEV = docker-compose.dev.yml
COMPOSE_FILE_PROD = docker-compose.yml -f docker-compose.prod.yml
DOCKER_COMPOSE_DEV = docker-compose -f $(COMPOSE_FILE_DEV)
DOCKER_COMPOSE_PROD = docker-compose -f $(COMPOSE_FILE_PROD)

# Detectar sistema operacional
ifeq ($(OS),Windows_NT)
    SHELL_CMD = powershell
    BROWSER_CMD = start
else
    SHELL_CMD = bash
    BROWSER_CMD = xdg-open
endif

# Comandos padrão
.PHONY: help dev-build dev-up dev-down dev-logs prod-build prod-up prod-down prod-logs
.PHONY: backend-shell frontend-shell db-shell redis-shell
.PHONY: migrate makemigrations createsuperuser collectstatic
.PHONY: test-backend test-frontend clean clean-all status flower backup-db restore-db

help: ## Mostra esta ajuda
	@echo "Newsletter Inteligente - Comandos disponíveis:"
	@echo ""
	@echo "DESENVOLVIMENTO:"
	@echo "  dev-build        Build dos containers para desenvolvimento"
	@echo "  dev-up           Sobe os containers para desenvolvimento"
	@echo "  dev-up-logs      Sobe os containers para desenvolvimento com logs"
	@echo "  dev-down         Para os containers de desenvolvimento"
	@echo "  dev-logs         Mostra logs dos containers de desenvolvimento"
	@echo "  dev-restart      Reinicia os containers de desenvolvimento"
	@echo ""
	@echo "PRODUÇÃO:"
	@echo "  prod-build       Build dos containers para produção"
	@echo "  prod-up          Sobe os containers para produção"
	@echo "  prod-down        Para os containers de produção"
	@echo "  prod-logs        Mostra logs dos containers de produção"
	@echo ""
	@echo "SHELL:"
	@echo "  backend-shell    Acessa shell do container backend"
	@echo "  frontend-shell   Acessa shell do container frontend"
	@echo "  db-shell         Acessa shell do PostgreSQL"
	@echo "  redis-shell      Acessa shell do Redis"
	@echo ""
	@echo "DJANGO:"
	@echo "  migrate          Executa migrações do Django"
	@echo "  makemigrations   Cria migrações do Django"
	@echo "  createsuperuser  Cria superusuário do Django"
	@echo "  collectstatic    Coleta arquivos estáticos"
	@echo ""
	@echo "TESTES:"
	@echo "  test-backend     Executa testes do backend"
	@echo "  test-frontend    Executa testes do frontend"
	@echo ""
	@echo "LIMPEZA:"
	@echo "  clean            Remove containers e volumes não utilizados"
	@echo "  clean-all        Remove tudo (cuidado!)"
	@echo ""
	@echo "MONITORAMENTO:"
	@echo "  status           Mostra status dos containers"
	@echo "  flower           Abre Flower (monitoramento Celery)"
	@echo ""
	@echo "BACKUP:"
	@echo "  backup-db        Faz backup do banco de dados"
	@echo "  restore-db       Restaura backup do banco (FILE=backup.sql)"

# Comandos de desenvolvimento
dev-build: ## Build dos containers para desenvolvimento
	$(DOCKER_COMPOSE_DEV) build

dev-up: ## Sobe os containers para desenvolvimento
	$(DOCKER_COMPOSE_DEV) up -d

dev-up-logs: ## Sobe os containers para desenvolvimento com logs
	$(DOCKER_COMPOSE_DEV) up

dev-down: ## Para os containers de desenvolvimento
	$(DOCKER_COMPOSE_DEV) down

dev-logs: ## Mostra logs dos containers de desenvolvimento
	$(DOCKER_COMPOSE_DEV) logs -f

dev-restart: ## Reinicia os containers de desenvolvimento
	$(DOCKER_COMPOSE_DEV) restart

# Comandos de produção
prod-build: ## Build dos containers para produção
	$(DOCKER_COMPOSE_PROD) build

prod-up: ## Sobe os containers para produção
	$(DOCKER_COMPOSE_PROD) up -d

prod-down: ## Para os containers de produção
	$(DOCKER_COMPOSE_PROD) down

prod-logs: ## Mostra logs dos containers de produção
	$(DOCKER_COMPOSE_PROD) logs -f

# Comandos de shell
backend-shell: ## Acessa shell do container backend
	$(DOCKER_COMPOSE_DEV) exec backend bash

frontend-shell: ## Acessa shell do container frontend
	$(DOCKER_COMPOSE_DEV) exec frontend sh

db-shell: ## Acessa shell do PostgreSQL
	$(DOCKER_COMPOSE_DEV) exec db psql -U newsletter_user -d newsletter_db

redis-shell: ## Acessa shell do Redis
	$(DOCKER_COMPOSE_DEV) exec redis redis-cli

# Comandos Django
migrate: ## Executa migrações do Django
	$(DOCKER_COMPOSE_DEV) exec backend python manage.py migrate

makemigrations: ## Cria migrações do Django
	$(DOCKER_COMPOSE_DEV) exec backend python manage.py makemigrations

createsuperuser: ## Cria superusuário do Django
	$(DOCKER_COMPOSE_DEV) exec backend python manage.py createsuperuser

collectstatic: ## Coleta arquivos estáticos
	$(DOCKER_COMPOSE_DEV) exec backend python manage.py collectstatic --noinput

# Comandos de teste
test-backend: ## Executa testes do backend
	$(DOCKER_COMPOSE_DEV) exec backend python manage.py test

test-frontend: ## Executa testes do frontend
	$(DOCKER_COMPOSE_DEV) exec frontend npm test

# Comandos de limpeza
clean: ## Remove containers e volumes não utilizados
	$(DOCKER_COMPOSE_DEV) down -v
	docker system prune -f

clean-all: ## Remove tudo (cuidado!)
	$(DOCKER_COMPOSE_DEV) down -v --rmi all
	docker system prune -af

# Comandos de monitoramento
status: ## Mostra status dos containers
	$(DOCKER_COMPOSE_DEV) ps

flower: ## Abre Flower (monitoramento Celery)
	@echo "Flower disponível em: http://localhost:5555"
ifeq ($(OS),Windows_NT)
	@start http://localhost:5555
else
	@xdg-open http://localhost:5555 2>/dev/null || open http://localhost:5555 2>/dev/null || echo "Abra manualmente: http://localhost:5555"
endif

# Comandos de backup
backup-db: ## Faz backup do banco de dados
	@echo "Criando backup do banco de dados..."
ifeq ($(OS),Windows_NT)
	@for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set mydate=%%k%%j%%i
	@for /f "tokens=1-2 delims=: " %%i in ('time /t') do set mytime=%%i%%j
	$(DOCKER_COMPOSE_DEV) exec db pg_dump -U newsletter_user newsletter_db > backup_%mydate%_%mytime%.sql
else
	$(DOCKER_COMPOSE_DEV) exec db pg_dump -U newsletter_user newsletter_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
endif
	@echo "Backup criado com sucesso!"

restore-db: ## Restaura backup do banco (uso: make restore-db FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "Erro: Especifique o arquivo de backup"; \
		echo "Uso: make restore-db FILE=backup.sql"; \
		exit 1; \
	fi
	@echo "Restaurando backup: $(FILE)"
ifeq ($(OS),Windows_NT)
	type $(FILE) | $(DOCKER_COMPOSE_DEV) exec -T db psql -U newsletter_user newsletter_db
else
	cat $(FILE) | $(DOCKER_COMPOSE_DEV) exec -T db psql -U newsletter_user newsletter_db
endif
	@echo "Backup restaurado com sucesso!"