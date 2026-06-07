# CLAUDE.md — guidance for Claude Code working in this repo

## Read first

- **[PRD.md](./PRD.md)** — product goal, library choices with rationale, structure, quality bar, non-goals. Source of truth. If you would contradict it, propose updating PRD.md first.
- **[TODOS.md](./TODOS.md)** — what's next.

## What this repo is

A **standalone Node 24+ ESM CLI** that doubles as a template. One package, no monorepo, no SDK, no template substitution.

Three direct deps drive the CLI:

- `citty` — args + auto `--help` + subcommands
- `@clack/prompts` — interactive prompts with cancel handling
- `picocolors` — terminal colors

The whole CLI is ~30 lines in `src/command.ts`. That's intentional. Anyone clones it, edits one file, ships a new CLI.

## Architecture context

This repo's companion is [`create-core-cli`](../create-core-cli) — a tiny scaffolder that does `prompts → giget('github:edgar0011/core-cli') → rewrite package.json → install`. The scaffolder is **structurally the same shape** as this repo (same tsconfig, tsdown, vitest, lint configs) plus ~80 lines of scaffolding logic. That's the dogfood.

We previously tried a monorepo with a `core-cli-kit` SDK, `templates/default/` with `{{var}}` placeholders, and a kit-using scaffolder. That was scope creep — see PRD §9 (non-goals). The kit was deleted; the simpler architecture is what shipped.

## Hard constraints

- **Node 24 LTS, ESM-only.** No dual ESM/CJS build, no UMD. `engines.node: ">=24"`, `engine-strict=true`.
- **TypeScript strict + `verbatimModuleSyntax`.** Internal imports use `.js` extensions (NodeNext convention) even though source is `.ts`.
- **No SDK.** Each file imports `citty` / `@clack/prompts` / `picocolors` directly. If you're tempted to wrap them in a "kit," don't — PRD §9 explicitly rejects that.
- **Lint, typecheck, test, build must all stay green.** Run `npm run check` before claiming done.
- **No new deps without updating PRD §5.** Every library on the list has a "why not the alternative" entry. Adding a dep means defending it the same way.
- **vitest must be `^4.1.8+`.** vitest 3.x has a critical CVE in `--ui` mode ([GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp)). Even though we don't use `--ui`, don't downgrade.

## Library choices — quick reference

See [PRD §5](./PRD.md#5-library-decisions) for the full rationale. Short form:

| Concern | Library | Don't reach for |
| --- | --- | --- |
| Args | `citty` | `commander`, `yargs`, `node:util.parseArgs` |
| Prompts | `@clack/prompts` | `inquirer`, `prompts`, `enquirer` |
| Colors | `picocolors` | `chalk`, `chalk-pipe`, `kleur` |
| Build | `tsdown` | `tsup` (deprecated), `vite lib`, `unbuild` |
| Lint | `oxlint` | ESLint (add later if needed) |
| Format | `prettier` | Biome formatter (not yet) |
| Test | `vitest@4` | `node:test`, `jest`, vitest 3.x |
| Package manager | `npm` | `pnpm`, `yarn`, `bun` (all fine for users; this repo's scripts use `npm`) |

## Workspace commands

| Command | What it does |
| --- | --- |
| `npm install` | Install deps |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | vitest run |
| `npm run build` | tsdown |
| `npm run check` | Composite: lint + typecheck + test + build. **Run before declaring done.** |
| `npm run format` | Prettier write |
| `node dist/cli.mjs --name World` | Run the built CLI |

## Conventions

- **No comments unless the *why* is non-obvious.** Well-named identifiers replace WHAT comments.
- **No defensive validation for cases that can't happen.** Trust internal code; only validate at system boundaries (user input).
- **No backward-compat shims.** Node 24+ ESM-only is the floor.
- **Imports**: internal cross-file imports use `.js` extensions (TS source maps the `.ts`). Third-party imports use the bare package name.
- **Tests** live under `test/` alongside `src/`. Use `mkdtemp` for filesystem tests.
- **Validator return shape**: validation functions return `string | undefined` — error message when invalid, `undefined` when valid. Name them `validateX`, not `isValidX`, and compare with `!== undefined`. (The "valid means falsy" inversion bit us in an earlier iteration of `create-core-cli` and would have read as obviously wrong with the right name.)

## When you finish a task

1. Run `npm run check` — must pass.
2. **Run the built binary against a real argument** (e.g. `node dist/cli.mjs --name World`). vitest's `command.run` assertions don't exercise the full path; live runs catch logic-inversion bugs that pass unit tests.
3. Update [TODOS.md](./TODOS.md): tick the item, add any follow-ups discovered.
4. If a decision was made that's not yet in PRD.md, propose the PRD update in the same change.
