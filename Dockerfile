FROM node:16-slim AS dependencies

WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci --omit=dev


FROM node:16-slim as builder
WORKDIR /app
COPY src src
COPY package.json package-lock.json tsconfig.json babel.config.json ./
RUN npm ci
RUN npm run build


FROM node:16-slim
COPY --from=builder /app/dist dist
COPY --from=dependencies /app/node_modules node_modules

ENTRYPOINT ["node", "/dist/index.js"]


