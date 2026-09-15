# Build stage: Create React App (react-scripts) build of app/, served by nginx.
FROM node:22-bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm ci

COPY app/ ./

# Build-time env vars read by react-scripts (REACT_APP_*).
ARG REACT_APP_SERVER_API=https://api.sway-playground.org
ENV REACT_APP_SERVER_API=$REACT_APP_SERVER_API
ENV NODE_ENV=production
ENV CI=true

RUN npm run build

# Runtime stage: static files behind nginx.
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
