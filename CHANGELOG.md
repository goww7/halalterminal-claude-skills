# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] — 2026-04-18

### Added
- Plugin scaffold (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`).
- Apache-2.0 license + trademark reservation (`NOTICE`, `TRADEMARKS.md`).
- MCP server declaration (`.mcp.json`) + Node SSE↔stdio bridge (`scripts/halalterminal-mcp.mjs`).
- Slash commands: `/halal-setup`, `/halal-doctor`.
- Shared references: `disclaimer`, `methodology-table`, `audience-rendering`, `verdict-format`.
- 9 skills:
  - `using-halal-investing` (umbrella)
  - `halal-verdict`
  - `halal-portfolio-audit`
  - `halal-portfolio-builder` (+ subagent)
  - `halal-etf-analysis`
  - `halal-zakat`
  - `halal-methodologies`
  - `halal-news-watch`
  - `halal-watchlist`
- Eval harness infrastructure (`scripts/run-evals.mjs`, `tests/skill-trigger-evals/`, `tests/output-shape-evals/`).

### Deferred to v1.1
- Per-skill trigger evals and output-shape eval JSON files (harness is ready; contributors can add evals without scaffolding).
- CI workflow to run evals on push/PR (depends on eval files existing).
- Device-code setup flow (`/auth/device` + `/activate`) — pending backend endpoint at halalterminal.com.

### Known limitations
- API key validation uses `GET /api/education/methodologies` as a cheap read (no `/health` endpoint exists yet).
- No rate-limit headers exposed by the API; quota tracking in `/halal-doctor` is best-effort and points users to halalterminal.com/dashboard as the authoritative source.

## [1.0.1] — 2026-04-18

### Fixed
- **MCP bridge can now start without `.mcp.json` env-substitution.** `scripts/halalterminal-mcp.mjs` now reads the API key from `~/.claude/halalterminal/credentials` as a fallback when `HALALTERMINAL_API_KEY` isn't in the process env. This lets the plugin-bundled bridge work end-to-end after `/halal-setup`.
- **`/halal-setup` writes to the correct settings.json path.** Previous version targeted `mcpServers.<name>.env.KEY` (top-level), which Claude Code's schema rejects. Now writes to `pluginConfigs["halalterminal-claude-skills@halalterminal-claude-skills"].mcpServers.halalterminal.HALALTERMINAL_API_KEY` AND to the credentials file above. Uses `curl` via Bash for API validation (WebFetch cannot send custom headers).
- **`/halal-doctor` checks both credential storage locations** and reports drift between them.

### Changed
- **Umbrella skill `using-halal-investing` now runs a pre-flight API key check before routing.** If no key is configured, it walks the user through the 30-second signup flow inline instead of letting downstream skills fail with "no key" errors. This is the behavior fix for "first help the user create the API instead of blathering."
- Umbrella also intercepts 401/403 mid-session and re-runs the setup flow when a stored key is rotated/revoked.

## [Unreleased]

Nothing yet.
