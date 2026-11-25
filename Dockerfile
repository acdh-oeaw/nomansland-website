# syntax=docker/dockerfile:1

# Use musl to avoid sharp memory leaks with the glibc allocator.
# @see https://sharp.pixelplumbing.com/install#linux-memory-allocator
FROM node:26-alpine AS build

ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh \
	&& PNPM_VERSION=12.23.0 PNPM_NO_MODIFY_PATH=1 sh /tmp/install-pnpm.sh

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV CI=true
# Node is supplied by the base image; runtime downloads are only needed locally.
ENV PNPM_CONFIG_RUNTIME=false
RUN pnpm fetch
RUN pnpm install --frozen-lockfile --offline --ignore-scripts

# Restore only the Astro image cache, never host dependencies (see .dockerignore).
COPY --chown=node:node --exclude=Caddyfile ./ ./
RUN pnpm rebuild --pending

ARG PUBLIC_APP_BASE_PATH
ARG PUBLIC_APP_BASE_URL
ARG PUBLIC_BOTS
ARG PUBLIC_GOOGLE_SITE_VERIFICATION
ARG PUBLIC_MATOMO_BASE_URL
ARG PUBLIC_MATOMO_ID
ARG PUBLIC_REDMINE_ID

ENV NODE_ENV=production

RUN pnpm run build

FROM scratch AS astro-cache

COPY --from=build /app/node_modules/.astro/assets /assets

FROM caddy:2-alpine AS serve

RUN addgroup -S -g 10001 caddy && adduser -S -D -H -u 10001 -G caddy caddy \
	&& chown -R caddy:caddy /config /data

WORKDIR /usr/share/caddy

ARG PUBLIC_APP_BASE_PATH
ENV APP_BASE_PATH=${PUBLIC_APP_BASE_PATH}

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy

USER 10001:10001

RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
