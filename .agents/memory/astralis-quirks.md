---
name: Astralis workspace quirks
description: Sharp edges discovered while building the Astralis RPG platform — workspace deps, lib/solana tsconfig, Character type bridge, design subagent import pitfalls
---

## Key non-obvious decisions and constraints

**Workspace package installation:**
`@workspace/*` packages cannot be installed via `pnpm add` — they fail with 404. Always edit `package.json` directly, adding `"@workspace/pkg": "workspace:*"`, then run `pnpm install`.

**Why:** pnpm tries to resolve workspace packages from npm registry when using `pnpm add`.

**lib/solana tsconfig needs node types:**
Add `"types": ["node"]` to `lib/solana/tsconfig.json`. The base tsconfig has `"types": []` which blocks `process.env` access.

**Why:** `tsconfig.base.json` explicitly sets `"types": []` to prevent ambient type pollution across libs.

**Character type bridge (DB → shared):**
`lib/db` Character has `created_at: Date` (Drizzle returns Date objects). `@workspace/shared` Character has `created_at: string`. When calling game-engine functions that expect the shared type, cast: `char as unknown as import("@workspace/shared").Character`.

**Why:** Drizzle infers timestamp columns as Date, but the shared type was defined with string for serialization. Double-cast through unknown is required because the types are structurally incompatible.

**Design subagent import pitfall:**
The design subagent may import from non-existent paths like `@workspace/api-zod/src/generated/types/getLeaderboardBy` when it sees enum-shaped values in the OpenAPI spec. Fix by replacing with plain string literal union types locally in the component file.

**How to apply:** After the design subagent finishes, check Vite logs for any `Failed to resolve import` errors and replace bad imports with local type aliases.

**GetMarketListingsQueryParams parsing:**
`parsed.data` is undefined when `safeParse` fails. Use optional chaining everywhere: `parsed.data?.limit ?? 20`. Never destructure `parsed.data` with a `?? {}` fallback — TS infers `{}` and loses property types.
