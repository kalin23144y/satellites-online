# ============= INSTALL =============
FROM node:22.16.0 AS install
WORKDIR /usr/src/app
RUN corepack enable pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/database/package.json ./libs/database/


RUN pnpm fetch
COPY libs/database ./libs/database

RUN pnpm install --prefer-offline --frozen-lockfile

# ============= DEPLOY =============
FROM node:22.16.0 AS deploy
WORKDIR /usr/src/app
RUN corepack enable pnpm

COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=install /usr/src/app/package.json ./package.json
COPY --from=install /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=install /usr/src/app/libs/database ./libs/database


# Применяем миграции к обеим БД (env передаётся из docker-compose)
CMD ["sh", "-c", "cd libs/database && pnpm exec prisma migrate deploy"]
