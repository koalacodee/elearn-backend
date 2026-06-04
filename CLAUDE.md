# Backend — CLAUDE.md

NestJS 11 + Fastify + TypeScript. Dual runtime: Bun (primary) with Node fallback baked into the data clients. PostgreSQL via Drizzle ORM, Redis for sessions/rate-limit, S3-compatible object storage.

## Commands

| Command | Purpose |
|---|---|
| `bun run start:dev` | watch mode |
| `bun run start:prod` | run compiled `dist/main.js` |
| `bun run build` | Nest build → `dist/` |
| `bun run lint` / `bun run format` | eslint / prettier |
| `bunx drizzle-kit generate` | generate migration from schema diff |
| `bunx drizzle-kit migrate` | apply migrations manually (also auto-runs on startup) |

Entry: [src/main.ts](src/main.ts). Global prefix `api` (override `API_PREFIX`). Always validate via the global `ValidationPipe({ whitelist: true, transform: true })` — extra DTO fields are stripped.

## Architectural rules (non-negotiable)

Every feature module is **DDD / hexagonal** with four layers:

```
src/<feature>/
├── domain/           # entities, enums, abstract repositories, domain services (no framework imports)
├── application/      # use-cases (one class per file, suffix .use-case.ts)
├── infrastructure/   # Drizzle/Redis/S3 impls of domain abstractions
├── interface/        # controllers, DTOs, guards, decorators
├── env/<feat>.env.ts # registerAs('<feat>', () => ({...}))
└── <feature>.module.ts
```

**Hard rules:**

1. **`domain/` never imports from `infrastructure/`, `interface/`, or any `@nestjs/*` runtime package.** Domain may use `@Injectable()` for services and the abstract repository classes, nothing more. No `drizzle-orm`, no `@nestjs/config`, no `fastify` types in domain.
2. **Repositories are `abstract class` in `domain/repositories/`**, bound to a concrete class in `<feature>.module.ts` via `{ provide: AbstractRepo, useClass: DrizzleX }`. Use-cases inject the abstract type — never the concrete. This is the seam that lets you swap Drizzle/Redis/S3 in tests.
3. **One use-case per class, one public method named `execute()`.** Inputs are typed via an exported `Input` interface co-located in the same file. No "service" classes that bundle multiple unrelated operations.
4. **Repository methods return domain entities, not Drizzle rows.** Map `*Row` → entity in a private `toEntity()` helper inside the infrastructure impl. Don't leak `$inferSelect` types upward.
5. **Controllers stay thin** — parse DTO, call one use-case, return its result (or map it through a `to*Response()` DTO helper). No business logic in controllers, no direct repository access from controllers.
6. **DTOs live in `interface/dtos/`** and use `class-validator` decorators. Request DTOs are validated by the global pipe; response DTOs are plain interfaces or mapped via free functions like `toMeResponse(user)`.

## NestJS module conventions

- Each feature has exactly one `*.module.ts`. Register the feature's own `env` file via `ConfigModule.forFeature(<feat>Env)` inside it; **also** add it to the `load: [...]` array in [src/app.module.ts](src/app.module.ts) so `ConfigService` resolves the namespaced key.
- Cross-feature dependencies: `imports: [OtherModule]`. The exporting module must list the provider in `exports`.
- **Circular deps use `forwardRef(() => OtherModule)`** on both sides. Existing pairs: `Orders ↔ Zones`, `Orders ↔ Customers`, `Realtime ↔ Supervisors`. Don't break these by inlining — extract a shared module instead.
- Global modules (`@Global()`) are only the infra ones: `Drizzle`, `Redis`, `RateLimiter`, `Realtime`, `Translation`. **Do not mark feature modules global.**
- Guards are applied app-wide via `APP_GUARD` providers in `AuthModule` — don't re-register them on individual controllers.

## Config

- Env vars are loaded once in `ConfigModule.forRoot({ isGlobal: true, load: [...] })` and namespaced with `registerAs('feature', () => ({...}))`. Access via `config.getOrThrow<T>('feature.key')`.
- **Never read `process.env` directly outside of an `*.env.ts` file or [src/main.ts](src/main.ts).** Use `ConfigService`.
- Required values: use `getOrThrow`. Optional values: use `get` with a default — fail fast at construction time, not at request time.
- Document new env vars in `.env.example`.

## Data layer (Drizzle)

- **Schemas live in `drizzle/schema/`** (sibling of `src/`, not under it). One file per table, all re-exported from [drizzle/schema/index.ts](drizzle/schema/index.ts). Add new schemas to that barrel.
- IDs default to UUIDv7 via `.$defaultFn(uuidv7)` from [helpers/uuidv7.ts](helpers/uuidv7.ts) — that helper picks `Bun.randomUUIDv7()` or the `uuidv7` package depending on runtime. Don't introduce other ID generators.
- `DrizzleService` ([src/common/drizzle/drizzle.service.ts](src/common/drizzle/drizzle.service.ts)) picks `Bun.SQL` (under Bun) or `postgres-js` (under Node) automatically. **Auto-runs pending migrations on `onModuleInit`** when `DRIZZLE_MIGRATIONS_DIR` is set — don't add a separate startup migration step.
- For schema changes: edit a file in `drizzle/schema/`, run `bunx drizzle-kit generate`, commit the generated SQL in `drizzle/migrations/`. **Never hand-edit a generated migration that's already shipped** — write a new one.
- Use Drizzle relational queries (`db.query.<table>.findFirst({ with: {...} })`) for reads with joins; use the builder API (`db.select().from()...`) for complex aggregations. Both are valid, pick by readability.

## Redis

- All Redis access goes through [src/common/redis/redis.service.ts](src/common/redis/redis.service.ts) — it paper-overs Bun's `RedisClient` vs `node-redis` API differences. **Don't import either client directly.** If you need a Redis op not yet wrapped, add a method to `RedisService` rather than reaching into `state.client`.
- Key conventions: prefix with `<feature>:` (e.g. `session:`, `user_sessions:`, `rate:`). Always set a TTL via `expire()` for ephemeral data.

## Authentication & authorization

- **Cookie sessions, no JWT.** Sessions live in Redis with sliding TTL; cookies are `httpOnly`, `sameSite: lax`.
- `AuthGuard` runs on every request (registered as `APP_GUARD`), hydrates `request.user`, and touches the session. `RoleGuard` runs after.
- **Decorators to use on controllers/handlers:**
  - `@Public()` — bypass `AuthGuard` (e.g. login, webhooks, public endpoints).
  - `@Role([UserRole.X, UserRole.Y])` — restrict to roles. Without it, any authenticated user passes.
  - `@CurrentUser()` — inject `AuthenticatedUser | undefined` (it's `undefined` only on `@Public()` routes).
- **Never write your own auth check inside a controller.** Use the decorators. If `@CurrentUser()` is needed on a `@Public()` route, the type is `| undefined` — handle it.
- Passwords hash with argon2 via the `PasswordHasher` abstract. Don't import `argon2` from non-auth code.

## Controllers (Fastify, not Express)

- Inject `FastifyRequest` / `FastifyReply` with `import type { ... } from 'fastify'` and decorate with `@Req()` / `@Res({ passthrough: true })`. Use `passthrough: true` unless you're sending the body manually (file downloads etc.).
- Cookies: `reply.setCookie` / `reply.clearCookie` / `request.cookies[name]` (registered via `@fastify/cookie` in [src/main.ts](src/main.ts)).
- File uploads: `@fastify/multipart` is registered globally with `fileSize` limited by `media.maxVideoBytes`. Use `req.file()` / `req.files()` — **do not add `multer` or other Express-only middleware.**
- Don't use anything Express-specific (`res.locals`, Express middleware, etc.). This app is Fastify end-to-end.

## Realtime

- SSE only, no WebSockets. The `EventBusService` ([src/realtime/event-bus.service.ts](src/realtime/event-bus.service.ts)) is a global RxJS `Subject` — inject it and call `events.emit({...})` after writes that should notify clients.
- Subscriber filtering happens in [src/realtime/events.controller.ts](src/realtime/events.controller.ts) (`canSee`). Extend the event type union in [src/realtime/realtime-event.type.ts](src/realtime/realtime-event.type.ts) when adding new event kinds.

## Storage / media

- S3-compatible only — talk to it through `S3Service` / `MediaStorage` abstractions, not the AWS SDK directly. Local dev uses RustFS (see [docker-compose.yml](../docker-compose.yml)).
- Image processing via `sharp` is encapsulated behind an `ImageProcessor` abstract; don't import `sharp` outside its infrastructure impl.

## Cross-cutting

- **Rate limiting:** inject `RateLimiter` (`common/rate-limiter`) and call `consume(bucket, limit, windowSec)`. Don't roll your own.
- **Logging:** use Nest's `Logger` with a class-scoped instance (`private readonly logger = new Logger(MyClass.name)`). Don't `console.log` in committed code.
- **Errors:** throw Nest's HTTP exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `InternalServerErrorException`). Use a stable, snake_case `message` string for client-readable codes (see `LoginUseCase` → `'user_not_found'`, `'password_incorrect'`).
- **Async side-effects** (translation, customer upsert, etc.) are fire-and-forget with `void promise` after primary write; the helper logs failures and never throws into the response path. Follow that pattern — don't block the request on best-effort work.

## Naming conventions

- Files: `kebab-case`. Suffix by role: `*.controller.ts`, `*.use-case.ts`, `*.repository.ts`, `*.service.ts`, `*.entity.ts`, `*.enum.ts`, `*.dto.ts`, `*.module.ts`, `*.env.ts`.
- Classes: `PascalCase`. Use-case classes end in `UseCase`, repositories in `Repository`, controllers in `Controller`.
- Abstract repository class = the type name (`UserRepository`); concrete impl prefixes the technology (`DrizzleUserRepository`, `RedisSessionRepository`).
- Drizzle table variables are lowercase plural (`users`, `orders`); enums are `<table>Field` (`userRole`, `orderStatus`).

## What NOT to do

- ❌ Don't import from `infrastructure/` or `interface/` inside `domain/`.
- ❌ Don't inject concrete repository/service classes — inject the abstract.
- ❌ Don't read `process.env` outside `*.env.ts` or `main.ts`.
- ❌ Don't add Express middleware or Express-typed `Request`/`Response` — this is Fastify.
- ❌ Don't import `argon2`, `sharp`, `postgres`, `bun:sqlite`, or `redis` clients outside their dedicated infrastructure files.
- ❌ Don't hand-edit shipped migrations; generate a new one.
- ❌ Don't mark feature modules `@Global()`.
- ❌ Don't put business logic in controllers or repositories — it belongs in a use-case or domain service.
- ❌ Don't add new top-level dependencies without a clear reason; prefer the abstractions that already exist.
