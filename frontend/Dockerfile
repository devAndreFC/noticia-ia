# Multi-stage build para React
FROM node:18-alpine as base

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files primeiro para aproveitar cache
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Stage para desenvolvimento
FROM node:18-alpine as development

WORKDIR /app

# Instalar dependências de desenvolvimento
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Configurar variáveis para hot reload (funciona no Windows e Linux)
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Comando para desenvolvimento
CMD ["npm", "start"]

# Stage para build de produção
FROM base as build

WORKDIR /app

# Copiar código fonte
COPY . .

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Build da aplicação
RUN npm run build

# Stage para produção com Nginx
FROM nginx:alpine as production

# Copiar arquivos buildados
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]