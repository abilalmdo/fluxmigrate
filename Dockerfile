# fluxmigrate.com — build the Astro site, then serve the static output with nginx.
#
#   docker build -t fluxmigrate:local .
#   docker run --rm -p 8088:80 --name fluxmigrate fluxmigrate:local
#
# Production is FTP to shared hosting (see .github/workflows/deploy.yml); this image
# is the local/staging preview and a drop-in alternative if hosting ever moves to a container.

# ---- build ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# dependency layer first, so source edits do not reinstall
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# fonts are downloaded here (build time) and served from our own origin at runtime
RUN pnpm build

# ---- serve ---------------------------------------------------------------
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="fluxmigrate.com" \
      org.opencontainers.image.description="Static marketing site for FluxMigrate" \
      org.opencontainers.image.source="https://github.com/abilalmdo/fluxmigrate"

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/fluxmigrate.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/index.html >/dev/null 2>&1 || exit 1
