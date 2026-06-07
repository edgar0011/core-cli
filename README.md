# core-cli

A modern Node 24+ ESM CLI template. Clone it, rename it, build your own CLI.

A clean starting point — no SDK, no template substitution machinery. Just a working CLI with three direct deps you can swap or extend.

> See [PRD.md](./PRD.md) for the full picture — every library decision with its rationale, structure, quality bar, and non-goals.

## Stack

| Concern | Library | Why |
| --- | --- | --- |
| Args | [`citty`](https://github.com/unjs/citty) | Typed, declarative, auto `--help` |
| Prompts | [`@clack/prompts`](https://github.com/bombshell-dev/clack) | Best modern TTY UX |
| Colors | [`picocolors`](https://github.com/alexeyraspopov/picocolors) | 3 kB, fastest, zero deps |
| Build | [`tsdown`](https://tsdown.dev) | Rolldown + Oxc; tsup's maintained successor |
| Test | [`vitest`](https://vitest.dev) | ESM-native, fast |
| Lint | [`oxlint`](https://oxc.rs/docs/guide/usage/linter) | 50-100× faster than ESLint |
| Format | [`prettier@3`](https://prettier.io) | De-facto standard |

Full rationale (incl. "why not the alternative") in [PRD §5](./PRD.md#5-library-decisions).

## Requirements

- **Node 24+** (enforced via `engine-strict=true`)

## Use this as a template

One command — `giget` fetches the latest tarball (no SSH, no `.git`):

```sh
npx giget@latest github:edgar0011/core-cli my-tool
cd my-tool
# Edit package.json: replace "name", "bin" key, "repository", "author"
npm install
npm run check
```

Then edit `src/command.ts` to make it your own CLI.

> **Note:** [`create-core-cli`](https://github.com/edgar0011/create-core-cli) is a separate scaffolder package, but it does **not** scaffold from `core-cli` — it bootstraps new `npx create-*` *scaffolder* packages, which is a different use case. For a new CLI from `core-cli`, the `giget` one-liner above is the path.

## Develop on this repo itself

```sh
nvm use            # Node 24
npm install
npm run dev        # tsdown watch build
npm test           # vitest run
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
npm run check      # composite: lint + typecheck + test + build
node dist/cli.mjs --name World    # run the built CLI
```

## Files

| Path | What |
| --- | --- |
| `src/cli.ts` | `#!/usr/bin/env node` entry. 5 lines: imports `runMain` and the command, calls `runMain(command)`. |
| `src/command.ts` | The actual CLI: args, prompts, colored output. Uses `citty` + `@clack/prompts` + `picocolors` directly. |
| `test/command.test.ts` | Vitest assertions on command shape. |
| `tsdown.config.ts` | Single-entry ESM build, target Node 24. |
| `tsconfig.json` | Standalone TS config — NodeNext + strict + `verbatimModuleSyntax`. |
| `.oxlintrc.json` | Rust-native linter. |
| `.prettierrc.json` | Format config. |
| `package.json` | npm scripts, `bin: { "core-cli": "./dist/cli.mjs" }`. |

## Documentation

- [PRD.md](./PRD.md) — product, library decisions with rationale, structure, quality bar
- [CLAUDE.md](./CLAUDE.md) — guidance for Claude Code contributors
- [TODOS.md](./TODOS.md) — next-step backlog

## License

MIT
