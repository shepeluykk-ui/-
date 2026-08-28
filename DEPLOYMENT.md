# РУКОВОДСТВО ПО РАЗВЕРТЫВАНИЮ (DEPLOYMENT GUIDE)
## ИС «СТРОИТЕЛЬНЫЙ КОНТРОЛЬ» (ООО «КИТ»)

---

## 1. СИСТЕМНЫЕ ТРЕБОВАНИЯ

* **Node.js:** v18.x или v20.x LTS
* **Менеджер пакетов:** npm v9+ или bun v1+
* **Порт сервиса:** `3000` (строго фиксирован для входящего проксирования)
* **Хост:** `0.0.0.0`

---

## 2. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (`.env`)

```env
# Порт приложения
PORT=3000

# Режим окружения
NODE_ENV=production

# Секретный ключ сессий
SESSION_SECRET=kit_construction_super_secret_key_prod

# Gemini API Key (для серверного ассистента)
GEMINI_API_KEY=
```

---

## 3. СБОРКА И ЗАПУСК В ПРОДАКШЕНЕ

```bash
# 1. Клонирование и установка зависимостей
npm ci --production=false

# 2. Компиляция клиентского бандла и сервера в dist/server.cjs
npm run build

# 3. Запуск сервиса
npm start
```

---

## 4. DOCKER И КОНТЕЙНЕРИЗАЦИЯ

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```
