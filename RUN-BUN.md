# Запуск через Bun

1. Установи [Bun](https://bun.sh).
2. В корне репозитория:

```bash
bun install
bun run bun:dev
```

Сборка и прод:

```bash
bun run bun:build
bun run bun:start
```

БД (Prisma из `libs/database`):

```bash
bun run bun:db:generate
bun run bun:db:migrate
bun run bun:db:status
bun run bun:db:reset
```

Скрипты с префиксом `pnpm:` по-прежнему работают через `pnpm`, если нужен старый вариант.
