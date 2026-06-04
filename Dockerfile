FROM oven/bun:latest as build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:latest as production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY helpers ./helpers

ENV NODE_ENV=production
ENV DRIZZLE_MIGRATIONS_DIR=/app/drizzle/migrations

CMD ["bun", "run", "src/main.ts"]
