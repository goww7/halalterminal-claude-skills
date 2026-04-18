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

## [Unreleased]

Nothing yet.
