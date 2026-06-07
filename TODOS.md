# TODOS

See [PRD.md](./PRD.md) for the why behind each item.

## Done

- [x] Standalone repo built — `src/cli.ts` + `src/command.ts` + tests + configs
- [x] Direct deps wired: `citty` + `@clack/prompts` + `picocolors`
- [x] `npm run check` green — 0 lint issues, typecheck clean, 3/3 tests, build OK
- [x] Live smoke — `node dist/cli.mjs --help` and `--name World` both work
- [x] `npm audit` — 0 vulnerabilities (pinned vitest@^4.1.8 to dodge the `--ui` CVE in 3.x)

## Next

### Publish

- [ ] **Push to GitHub** — first push populates the existing empty `github:edgar0011/core-cli` repo. Once pushed, [`create-core-cli`](../create-core-cli) can `giget` it for real.
- [ ] **GitHub Actions CI** — `.github/workflows/ci.yml`: install + lint + typecheck + test + build on every push.
- [ ] **`.github/workflows/release.yml`** — tag-driven publish to npm with `--provenance`. Or `changesets` action.
- [ ] **`npm publish`** — first publish makes `core-cli` available as a runnable bin (`npx core-cli`).

### Polish

- [ ] **`subcommands` example** — show how citty's subcommand pattern works. Probably a single extra file (`src/commands/`) demonstrating the split, behind a TODO so people see it but the default `cli.ts` stays minimal.
- [ ] **`exec` example** — add a commented section to `command.ts` showing how to run a shell command via `tinyexec` when needed. Not adding `tinyexec` as a dep — most CLIs don't need it.
- [ ] **`fs.editJson` example** — short README snippet showing the standard `readFile → parse → mutate → writeFile` pattern.

### Maybe / parked

- ESLint flat config in CI for type-aware rules — only if oxlint coverage proves insufficient.
- `node:sea` (single executable app) build — `tsdown` 0.21 added support.
- TS 7 / `tsgo` migration — once `@typescript/native-preview` reaches GA and `tsdown` supports it.
- Biome as a single-binary lint+format alternative — re-evaluate when v3 lands.
