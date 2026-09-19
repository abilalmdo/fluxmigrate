# Static site image for fluxmigrate.com.
# Build:  docker build -t fluxmigrate:local .
# Run:    docker run --rm -p 8088:80 --name fluxmigrate fluxmigrate:local
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="fluxmigrate.com" \
      org.opencontainers.image.description="Static marketing site for FluxMigrate" \
      org.opencontainers.image.source="https://github.com/abilalmdo/fluxmigrate"

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/fluxmigrate.conf
COPY --chown=nginx:nginx . /usr/share/nginx/html/

# Files the browser never asks for do not belong in the image.
RUN rm -rf /usr/share/nginx/html/tools \
           /usr/share/nginx/html/.github \
           /usr/share/nginx/html/.git \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/docker-compose.yml \
           /usr/share/nginx/html/assets/brand/preview \
    && find /usr/share/nginx/html -name '*.md' -delete

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/index.html >/dev/null 2>&1 || exit 1
