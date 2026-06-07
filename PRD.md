# core-cli — Product Requirements Document

> Status: **v0.1 (template repo, npm-based, Node 24+)** · Owner: Martin Weiser · Last updated: 2026-06-05

## 1. Goal

A **standalone, working** Node 24+ ESM CLI that doubles as a template. Clone it, rename a few fields in `package.json`, edit `src/command.ts`, and you have your own CLI.

No SDK, no template substitution machinery, no monorepo. The repo *is* the template — what you see is exactly what you get when you scaffold from it.

## 2. Problem we are solving

The three legacy in-house CLIs (`create-core-app`, `create-core-vite`, `core-vite-executor`) all share the same anatomy but were each built three times from scratch on top of `process.argv[2]` + `inquirer@8` + `chalk-pipe@4` + `shelljs` — all unmaintained or stagnant by 2026.

`core-cli` replaces the duplication with **one well-tooled CLI shape** that anyone can clone and extend. The companion repo [`create-core-cli`](../create-core-cli) scaffolds it (`npm create core-cli my-tool`).

## 3. Architecture

Two standalone repos, no monorepo:

| Repo | Role |
| --- | --- |
| **`core-cli`** (this repo) | The standalone CLI template. A working "hello, X" CLI. Real code, no placeholders. |
| [**`create-core-cli`**](../create-core-cli) | A separate tiny scaffolder. Prompts → `giget('github:edgar0011/core-cli')` → rewrites `package.json` → runs install. ~120 LOC. |

`create-core-cli` is itself built the same way as `core-cli` (same tsconfig, tsdown, vitest, lint configs, same direct-deps pattern). That's the natural dogfood — the scaffolder is structurally a copy of the template with ~80 extra lines for the scaffolding logic.

## 4. Runtime baseline

**Node 24 LTS.** ESM-only. No dual ESM/CJS build, no UMD.

Rationale: per the [TypeScript Tooling Landscape — June 2026](../../education/IT/ts-tooling-landscape-2026.html), Node 24 ships `.ts` execution natively (type stripping), `require(esm)` is default-on, and ESM-only is now defensible. `engines.node: ">=24"` is enforced via `engine-strict=true` in `.npmrc`.

## 5. Library decisions

Every choice below is small, ESM-first, maintained as of 2026-Q2, and has a "why not the alternative" answer.

### 5.1 Argument parsing — `citty`

| Considered | Verdict |
| --- | --- |
| `node:util.parseArgs` (builtin) | Fine for tiny CLIs; no `--help` generation, no subcommands |
| **`citty`** (chosen) | Declarative typed schema, auto-generated `--help`, subcommand trees, same UnJS family as `giget` |
| `commander` | Mature but heavier API, older patterns |
| `yargs` | Powerful but overkill |
| `cac` | Tiny but stagnating |
| `clipanion` | Class-based, right only for huge CLIs |

### 5.2 Prompts — `@clack/prompts`

| Considered | Verdict |
| --- | --- |
| `node:readline` (builtin) | Only fits "ask one string" cases |
| `inquirer@8` (legacy CLIs use this) | Stuck on legacy CJS branch — do not carry forward |
| `@inquirer/prompts` | Solid official rewrite, conservative pick |
| **`@clack/prompts`** (chosen) | Best-in-class TTY UX (grouped flows, spinner, note, outro), used by `create-astro` / `create-svelte` / `create-nuxt` / `create-nest` |
| `prompts` (terkelg) | Was the favorite ~2022; clack ate its lunch |
| `enquirer` | Quirky API, low activity |

### 5.3 Colors — `picocolors`

| Considered | Verdict |
| --- | --- |
| `chalk-pipe@4` (legacy) | Wraps chalk 4, stuck on CJS — drop |
| `chalk@5` | ESM-only, dominant API, but heavier |
| **`picocolors`** (chosen) | 3 kB, ~14× faster than chalk, zero deps, used by PostCSS / Vite / Tailwind |
| `kleur`, `yoctocolors` | Fine alternates; picocolors has more inertia |

### 5.4 Build — `tsdown`

| Considered | Verdict |
| --- | --- |
| `tsup` | README says *"not actively maintained anymore, please consider using tsdown instead"* |
| **`tsdown`** (chosen) | Rolldown + Oxc-bundled `.d.ts`. tsup's successor, endorsed by tsup's author. Build in ~15 ms. |
| `tsc` alone | Fine for typecheck-only path; not for emitting an executable bin |
| `vite` library mode, `unbuild`, `pkgroll` | All viable; tsdown wins on features + speed |

### 5.5 Test — `vitest@4`

| Considered | Verdict |
| --- | --- |
| **`vitest@4.1.8+`** (chosen) | ESM-native, fast, watch mode. **v4 is required** — v3.x has a critical CVE in `--ui` mode ([GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp)). |
| `node:test` (builtin) | Lower friction but weaker assertion ergonomics |
| `jest` | Heavyweight, dated patterns |

### 5.6 Lint — `oxlint`

| Considered | Verdict |
| --- | --- |
| **`oxlint`** (chosen) | 50-100× faster than ESLint, 813 built-in rules, sufficient for a single-package CLI |
| `eslint@10` flat config | Add later if type-aware rules become necessary |
| `biome` | Single binary for lint + format; smaller rule set than oxlint |

**Rules demoted to off** (`.oxlintrc.json`):

- `no-await-in-loop` — fires on sequential async work where parallelization would be wrong.
- `unicorn/consistent-function-scoping` — fires on local recursive helpers where hoisting adds no value.

### 5.7 Format — `prettier@3`

De-facto standard. Stable. Biome v3 might be a future swap; today, prettier is the boring correct pick.

### 5.8 Package manager — `npm`

| Considered | Verdict |
| --- | --- |
| **`npm@11`** (chosen) | Ships with Node 24. Zero install. `npm create core-cli my-tool` just works. |
| `pnpm` | Faster, content-addressed store. Lost the monorepo justification when we ditched the kit; for a single standalone CLI the benefits are marginal. |
| `yarn classic 1.x` | Used in the legacy CLIs. Effectively unmaintained since 2022. |
| `yarn berry 4.x` | No clear win over pnpm. |
| `bun` (as PM only) | Fast but adds an install step. |

The scaffolder (`create-core-cli`) **prompts** the user which installer to run post-scaffold (`npm` / `pnpm` / `yarn` / `bun`) so users keep their preferred tool. The template itself uses `npm` in scripts and docs because npm is the lowest-friction default.

## 6. Project structure

```
core-cli/
├── src/
│   ├── cli.ts                # 5 lines: shebang + runMain(command)
│   └── command.ts            # ~30 lines: defineCommand with prompts + colored output
├── test/
│   └── command.test.ts       # command-shape assertions
├── package.json              # name: "core-cli", bin: { "core-cli": "./dist/cli.mjs" }
├── tsconfig.json             # standalone, no extends
├── tsdown.config.ts          # single-entry ESM build, target node24
├── vitest.config.ts
├── .gitignore .nvmrc .npmrc
├── .oxlintrc.json .prettierrc.json .prettierignore
├── README.md                 # short version
├── PRD.md                    # this file
├── CLAUDE.md                 # contributor guidance
└── TODOS.md
```

No `packages/`, no `templates/`, no `examples/`. The repo is one CLI, one source tree.

## 7. The whole product fits in `src/command.ts`

The actual CLI logic is ~30 lines. It imports `citty`, `@clack/prompts`, `picocolors` **directly** — no kit, no abstraction layer. A new owner can read the whole CLI in 30 seconds and start editing.

```ts
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import pc from 'picocolors'

export const command = defineCommand({
  meta: { name: 'core-cli', version: '0.0.1', description: '...' },
  args: { name: { type: 'string', description: 'Who to greet' } },
  async run({ args }) {
    p.intro(pc.bold('core-cli'))
    const who = args.name ?? await ask(p.text({ message: '...', defaultValue: 'world' }))
    p.outro(`Hello, ${pc.green(who)}!`)
  },
})
```

The `ask` helper that handles clack's cancel-symbol is ~5 lines. When you scaffold a CLI from this template, you keep that helper and replace the rest with your own command logic.

## 8. Quality gates (all green at v0.1)

| Gate | Status |
| --- | --- |
| `npm run lint` (oxlint) | ✅ clean |
| `npm run typecheck` (tsc --noEmit, NodeNext + strict + verbatimModuleSyntax) | ✅ clean |
| `npm test` (vitest, 3 tests, ~285 ms) | ✅ |
| `npm run build` (tsdown, ~2.4 kB, ~15 ms) | ✅ |
| `npm audit` | ✅ 0 vulnerabilities |
| Live `node dist/cli.mjs --help` and `--name World` | ✅ |

Composite: `npm run check`.

## 9. Non-goals

- **CJS support.** Node 24 baseline; ESM-only.
- **An SDK.** We tried (`core-cli-kit` in the earlier monorepo iteration) and concluded the kit was scope creep. Direct deps are clearer for a single CLI.
- **Template substitution machinery.** Scaffolding from this repo is a giget + JSON-edit, not a placeholder-engine.
- **Multiple template variants in this repo.** If you want a minimal / library / runtime-CLI variant, fork the repo. Don't grow this one into a variant matrix.
- **i18n.** English prompts only.

## 10. References

- [TypeScript Tooling Landscape — June 2026](../../education/IT/ts-tooling-landscape-2026.html) — source of truth for "what 2026 ships with"
- Companion: [`create-core-cli`](../create-core-cli)
- Legacy CLIs being replaced: [`create-core-app`](../create-core-app), [`create-core-vite`](../create-core-vite), [`core-vite-executor`](../core-vite-executor)
- [TODOS.md](./TODOS.md) — next-step backlog
- [CLAUDE.md](./CLAUDE.md) — contributor guidance
