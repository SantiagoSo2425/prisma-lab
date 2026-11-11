# Etapa 1: Construcción y Validación TypeScript + Empaquetamiento SCORM 1.2
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor Web de Producción Ultraligero (Nginx Alpine)
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
