FROM node:22.16.0-alpine AS install

WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json ./apps/client/
COPY libs/common/package.json ./libs/common/
COPY libs/database/package.json ./libs/database/
COPY libs/minio/package.json ./libs/minio/
COPY libs/auth/package.json ./libs/auth/

RUN pnpm fetch


COPY apps/client ./apps/client
COPY libs/common ./libs/common
COPY libs/database ./libs/database
COPY libs/minio ./libs/minio
COPY libs/auth ./libs/auth

RUN pnpm install --prefer-offline --frozen-lockfile
# ============= GENERATE (Prisma) =============
FROM node:22.16.0-alpine AS generate
WORKDIR /app
RUN corepack enable pnpm

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/package.json ./package.json
COPY --from=install /app/apps/client/package.json ./apps/client/package.json
COPY --from=install /app/libs/database ./libs/database
COPY --from=install /app/libs/auth ./libs/auth
# prisma.config.ts требует DATABASE_URL при загрузке; для `generate` реальная БД не нужна
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

RUN pnpm --filter @libs/database exec prisma generate

# FROM node:22.16.0-alpine AS build
# WORKDIR /app
# RUN corepack enable pnpm

# COPY --from=install /app/node_modules ./node_modules
# COPY --from=install /app/package.json ./package.json
# COPY --from=install /app/apps/client/package.json ./apps/client/package.json
# COPY --from=generate /app/libs/database ./libs/database
# COPY --from=install /app/libs/common ./libs/common
# COPY --from=install /app/libs/minio ./libs/minio
# COPY --from=install /app/apps/client ./apps/client


# RUN pnpm --filter @apps/client build

FROM node:22.16.0-alpine AS runner
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
RUN corepack enable pnpm
WORKDIR /app  


COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/package.json ./package.json
COPY --from=install /app/apps/client/package.json ./apps/client/package.json
COPY --from=generate /app/libs/database ./libs/database
COPY --from=install /app/libs/common ./libs/common
COPY --from=install /app/libs/minio ./libs/minio
COPY --from=install /app/libs/auth ./libs/auth
COPY --from=install /app/apps/client ./apps/client

CMD ["pnpm", "client:start"]
