# Astralis RPG Platform

A Telegram bot RPG game with Solana $MAGIC token economy. Players battle, burn tokens, complete missions, and climb the leaderboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server + Telegram bot (port 8080)
- `pnpm --filter @workspace/web run dev` — run the public web dashboard (port 22333)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `BOT_TOKEN`, `SOLANA_PRIVATE_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API + Bot: Express 5 + Telegraf 4
- DB: PostgreSQL + Drizzle ORM (9 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Web: React + Vite + Tailwind + shadcn/ui

## Where things live

- `lib/shared` — types, constants, utils (ClassKey, Rank, CLASSES, MISSIONS, etc.)
- `lib/game-engine` — combat resolver, XP/level progression, mission resolver, item generator
- `lib/solana` — wallet, burn, transfer helpers
- `lib/notifications` — Telegram message templates
- `lib/db/src/schema/` — all 9 DB tables (characters, wallets, missions, inventory, burns, rewards_pool, guilds, pvp_log, market)
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `artifacts/api-server/src/bot/` — Telegram bot commands and services
- `artifacts/api-server/src/routes/` — REST API routes
- `artifacts/web/src/` — public web dashboard

## Architecture decisions

- Bot lives inside the api-server artifact, started alongside Express in `app.ts`
- All game logic lives in lib packages (game-engine, shared) to be reusable
- OpenAPI-first: routes and web hooks both generated from `openapi.yaml`
- Bot uses long-polling (not webhooks) via Telegraf's `bot.launch()`
- DB Character type has `created_at: Date` (Drizzle), while shared Character has `string` — cast through `unknown` when calling game-engine functions

## Product

- Telegram bot with 15+ commands: /create, /profile, /mission, /collect, /inv, /equip, /upgrade, /arena, /battle, /guild, /market, /sell, /buy, /daily, /heal, /burnreport
- 9 character classes (D to S rank), each with unique stats and starting $MAGIC
- Mission system: quick/normal/hard/epic with item drops and XP rewards
- PvP arena with injury mechanic and $MAGIC prizes
- Guild system with raid bosses and member management
- NFT-style item marketplace with rarity tiers
- Token burn economy: 30% burned / 20% marketing / 10% buyback / 40% rewards
- Public web dashboard: Observatory (stats+feed), Ranks (leaderboard), Bazaar (market), Void (burns), Halls (guilds)

## Solana Constants

- MAGIC_MINT: `Htg5dsESFUSRdtNQ42JCgkUx5ikH6sK54nfkWFVdpump`
- MARKETING_WALLET: `Cgh4CrF2LwY3vkPBqu3KAuKDih8oGqky6pwB6JeURSCE`
- BUYBACK_WALLET: `93VJpwG2YJkRPSqQbha2Uf22k7KnjdovkZgesqgjDNdw`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Workspace packages (`@workspace/*`) can't be installed via `pnpm add` — edit package.json directly with `"workspace:*"` then run `pnpm install`
- lib/solana tsconfig needs `"types": ["node"]` to access `process.env`
- DB Character has `created_at: Date` but shared Character has `created_at: string` — use `as unknown as Character` when bridging
- `GetMarketListingsQueryParams.safeParse().data` may be undefined on parse failure — always use optional chaining (`?.`)
- Design subagent may import from `@workspace/api-zod/src/generated/types/...` paths that don't exist — fix by using plain string literal types instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
