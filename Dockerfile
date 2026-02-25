FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# --- PASO DE TESTS ---
# Si los tests fallan, el build de Docker se detendrá aquí.
# Usamos 'run' para que Vitest se ejecute una sola vez y no se quede escuchando cambios.
RUN npm run test -- --run
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
