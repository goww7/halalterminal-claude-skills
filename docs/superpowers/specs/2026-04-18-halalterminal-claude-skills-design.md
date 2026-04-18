# Halal Terminal Claude Skills — Design

**Status:** Approved for implementation
**Date:** 2026-04-18
**Author:** Yassir <yassir@halalterminal.com>
**Repo:** `github.com/goww7/halalterminal-claude-skills` (v1 ships under personal account; migration to `halalterminal` org when that org is provisioned)
**License:** Apache-2.0 + `TRADEMARKS.md`

## 1. Purpose

A Claude Code plugin that gives end users extensive Shariah-investing capabilities on top of the Halal Terminal MCP server. Ships 9 focused skills (1 umbrella + 8 workflows), a one-command setup flow, and diagnostics — installable via the Claude Code plugin marketplace.

Non-goals for v1:
- Issuing fiqh rulings (skills screen against published methodologies; they do not rule)
- Broker integrations or order execution
- Multi-language output (English only in v1)
- Real-time streaming / alerts (v1 is request-response only)

## 2. Target audiences

Three audiences, one "tone parameter":

- **Retail** (default) — plain-English verdicts, halal alternatives on failure, no ratio tables unless asked
- **Advisor** — compact ratio tables, aggregate breakdowns, CSV-ready output
- **Scholar** — methodology disagreements, primary-source citations, AAOIFI standard references

Detection: explicit `audience:` parameter in user message takes priority; otherwise inferred with concrete signals. Rendering rules live in `references/audience-rendering.md`.

**Audience detection signals** (applied in priority order):

1. Explicit `audience: retail|advisor|scholar` in the user's message → use that
2. **Scholar** if message contains: fiqh/fatwa/Shariah-board references, Arabic fiqh terms (`riba`, `gharar`, `maysir`, `bay`), AAOIFI standard numbers, questions about scholar disagreements
3. **Advisor** if message contains: `P/E`, `ROE`, `volatility`, `Sharpe`, `CSV`, `export`, requests for ratio tables, mentions of client portfolios or AUM
4. **Retail** — default

Users can flip mid-session by typing `audience: advisor` or similar; the umbrella skill catches and propagates this.

## 3. Repository structure

```
halalterminal-claude-skills/
├── .claude-plugin/
│   ├── plugin.json              # plugin manifest
│   └── marketplace.json         # marketplace listing
├── .mcp.json                    # halalterminal MCP server declaration
├── skills/
│   ├── using-halal-investing/   # umbrella skill (routing + session-level disclaimer)
│   ├── halal-verdict/
│   ├── halal-portfolio-audit/
│   ├── halal-portfolio-builder/ # dispatches to subagent
│   ├── halal-etf-analysis/
│   ├── halal-zakat/
│   ├── halal-methodologies/
│   ├── halal-news-watch/
│   └── halal-watchlist/
├── agents/
│   └── halal-portfolio-builder-agent.md
├── commands/
│   ├── halal-setup.md           # /halal-setup
│   └── halal-doctor.md          # /halal-doctor
├── references/                  # plugin-level shared prompt fragments
│   ├── disclaimer.md
│   ├── methodology-table.md
│   ├── audience-rendering.md
│   └── verdict-format.md
├── scripts/
│   └── halalterminal-mcp.mjs    # Node SSE↔stdio bridge (the halalterminal API's production MCP server is Python; the plugin ships this Node bridge so users don't need Python — same pattern as /root/halalterminal-mcp.mjs)
├── tests/
│   ├── skill-trigger-evals/     # asserts correct skill fires for given prompts
│   └── output-shape-evals/      # asserts verdict output contains required elements
├── LICENSE                      # Apache-2.0
├── NOTICE                       # copyright + Powered-By attribution
├── TRADEMARKS.md
├── README.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

## 4. The 9 skills

| # | Skill | Trigger examples | Job | MCP tools | Refs loaded |
|---|-------|------------------|-----|-----------|-------------|
| 0 | `using-halal-investing` | Session start / any halal-related ask | Umbrella: routes to sub-skills, detects audience, enforces session disclaimer, tracks session token usage and warns Free-plan users approaching quota | (no MCP calls of its own) | `disclaimer`, `audience-rendering` |
| 1 | `halal-verdict` | "Is X halal?", "Screen TSLA", "Compliance of AAPL" | Single-stock verdict with 5-methodology matrix, failure explanation, halal alternative if non-compliant | `screen_stock`, `get_stock_info`, `search_stocks` | `disclaimer`, `methodology-table`, `verdict-format` |
| 2 | `halal-portfolio-audit` | "Audit my portfolio", "Screen these holdings" | Scan list of holdings; per-stock + aggregate compliance; purification owed; remediation options for failed names | `scan_portfolio`, `calculate_zakat`, `generate_report` | `disclaimer`, `verdict-format`, `audience-rendering` |
| 3 | `halal-portfolio-builder` | "Build me a halal growth portfolio", "Construct a Shariah-compliant basket" | Dispatches to subagent; returns basket + weights + DCA schedule + horizon forecast | (via subagent) | `disclaimer`, `audience-rendering` |
| 4 | `halal-etf-analysis` | "Is SPY halal?", "Halal ETFs for tech exposure" | Holdings-level ETF screen, compliant %, purification calc, halal ETF alternatives on failure | `screen_etf`, `get_etf_info`, `etf_purification`, `compare_etfs`, `search_stocks` | `disclaimer`, `verdict-format` |
| 5 | `halal-zakat` | "Calculate my zakat", "Purification for my dividends" | Annual zakat on holdings + dividend purification; nisab threshold check via gold price | `calculate_zakat`, `get_dividends`, `scan_portfolio` | `disclaimer` |
| 6 | `halal-methodologies` | "Explain AAOIFI", "Difference between DJIM and MSCI" | Interactive education: thresholds, when to use which, primary sources | `islamic_finance_education` | `methodology-table` |
| 7 | `halal-news-watch` | "News on $X's compliance", "Any filings affecting my portfolio compliance" | Pull news + filings for holdings; highlight compliance-impact items (debt raises, business-line changes, acquisitions) | `get_news`, `get_sec_filings`, `get_stock_info` | `disclaimer` |
| 8 | `halal-watchlist` | "Add X to my halal watchlist", "Show my watchlist with compliance status" | Watchlist CRUD with auto-compliance status + current quote | `manage_watchlist`, `get_screening_result`, `get_quote` | `verdict-format` |

### Global rules every SKILL.md enforces

1. Load `references/disclaimer.md` before emitting any verdict
2. Detect audience, then load `references/audience-rendering.md`
3. Never say "this stock is halal" — always "screens as compliant under [methodology]"
4. Surface disagreements across the 5 methodologies whenever they exist
5. Surface purification amount whenever non-zero
6. End every verdict with the non-fatwa disclaimer + Halal-Terminal branding footer

## 5. Shared references

### `references/disclaimer.md`

Canonical non-fatwa footer:

> *This is a methodology-based screening, not a fatwa. Compliance verdicts depend on which of the 5 major Shariah screening methodologies you follow. Consult a qualified scholar for personal rulings. Data: halalterminal.com.*

Plus the 3 hard rules listed above.

### `references/methodology-table.md`

Cross-reference matrix (AAOIFI / DJIM / FTSE / MSCI / S&P) with: establishing body, basis (market cap vs total assets), debt threshold, cash threshold, liquidity threshold, impure-income threshold, treatment of interest income, distinguishing feature. One-line summary per methodology suitable for inline inclusion in a verdict.

### `references/audience-rendering.md`

Detection rules and output templates for retail / advisor / scholar. Same data, three rendering profiles. Specifies when to include ratio tables, primary-source citations, CSV export option.

### `references/verdict-format.md`

Canonical ordering for verdict output:

1. Headline verdict — neutral split-stating format:
   - All 5 pass → "AAPL — compliant across all 5 methodologies"
   - Mixed → "AAPL — compliant under DJIM/FTSE/S&P/MSCI; non-compliant under AAOIFI" (list both sides explicitly; never use "mostly" / "partially")
   - All 5 fail → "AAPL — non-compliant across all 5 methodologies"
2. 5-methodology matrix
3. Key ratios that drove the result (especially for failing methodologies)
4. Purification rate (if non-zero)
5. Halal alternative (if failed under user's preferred methodology, or all 5)
6. Disclaimer footer
7. Branding footer

## 6. Setup & diagnostics

### `/halal-setup`

v1 flow (uses existing api.halalterminal.com email-signup page):

1. Prints:
   > **Halal Terminal setup**
   > 1. Go to https://api.halalterminal.com — enter your email in "Get your free API key in seconds"
   > 2. Check your inbox — you'll receive a key starting with `ht_...`
   > 3. Paste the key below.
2. Prompts: *"API key:"*
3. Validates format (`ht_` prefix + length check)
4. Validates the key by calling a cheap read endpoint. **No dedicated `/v1/health` or `/me` endpoint exists**, so validation uses `GET /api/education/methodologies` (low token cost: ~1–2 tokens). A 2xx response confirms the key is valid.
5. Writes key into the `env` block of the halalterminal MCP server entry in `~/.claude/settings.json` (scoped to this MCP server; no shell-profile edits; removable via `claude mcp remove`)
6. Registers the MCP bridge (`scripts/halalterminal-mcp.mjs`) in the user's MCP config
7. Runs `halal-doctor` — prints connectivity ✓, auth ✓, plan tier, remaining token quota
8. Ends with: *"You're set. Try `Is AAPL halal?` to test."*

### `/halal-doctor`

Prints:
- MCP server status (connected / failed)
- API key validity (calls `GET /api/education/methodologies` — cheap read)
- Current plan tier and remaining token quota (best-effort — see note on rate-limit headers below)
- Per-skill estimated token cost (fetched from `GET /api/keys/token-costs`)
- Plugin version + skills loaded
- Last error from MCP bridge (if any)

**Note:** The Halal Terminal API does not currently expose rate-limit headers (`X-RateLimit-*`). Until it does, `halal-doctor` estimates usage from the token-cost table and locally-tracked call counts; actual remaining quota is authoritative at the dashboard (`halalterminal.com/dashboard`).

### v1.1 upgrade path (future)

If halalterminal.com exposes a device-code OAuth flow (`/auth/device` + `/activate`), `/halal-setup` upgrades to a paste-free device flow — matching `gh auth login`. The plugin design anticipates this migration: setup command is versioned and config schema is forward-compatible.

## 7. Subagent: `halal-portfolio-builder-agent`

**Why isolate.** Portfolio construction fans out 40+ MCP calls across 20+ candidates to return one basket. Inline execution would pollute main context with raw JSON. All other workflows stay inline.

**Inputs** (passed by the calling skill):
- target capital (upfront + DCA cadence + amount)
- horizon (months)
- sector/theme constraints
- exclusions (e.g., "no tech")
- growth/value tilt, risk profile
- audience (retail/advisor/scholar)

**Job** (autonomous):
1. `search_stocks` to build a candidate pool matching constraints
2. `screen_stock` on each candidate; drop non-compliant names
3. `get_quote` + `get_price_history` (5y) for surviving candidates
4. Compute per-ticker realized return, volatility, drawdown; score for growth-tilt fit
5. Select 8–12 names across required sector mix
6. Allocate weights with sector-cap constraints
7. Generate DCA schedule (upfront + monthly buys) as a concrete month-by-month table
8. Forecast horizon scenarios (bear/base/bull) using each ticker's own stats

**Output** to parent skill: basket, weights, DCA table, scenario forecast, confidence notes, list of rejected candidates with reasons.

**MCP tools available:** `search_stocks`, `screen_stock`, `get_quote`, `get_price_history`, `compare_stocks`, `get_stock_info`, `islamic_finance_education`.

**Tools NOT available:** write/edit tools, watchlist tools, anything that mutates user state.

## 8. Error handling & quota behavior

The API is **token-metered**, not request-metered. Token costs (per `/api/keys/token-costs`):

| Operation class | Token cost |
|---|---|
| Lightweight read (`get_quote`, `get_stock_info`, education endpoints) | 1–2 |
| Screening (`screen_stock`, `screen_etf`) | 5–10 |
| Heavy operations (portfolio scan, bulk screen, ETF bulk) | up to 50 |

Plan tiers:

| Plan | Monthly tokens | Overage |
|------|----------------|---------|
| Free | 50 | blocked |
| Starter ($19) | 2,500 | $0.01/token |
| Pro ($49) | 15,000 | $0.008/token |
| Enterprise ($199) | Unlimited | — |

### Error handling rules

- Every skill wraps MCP calls and surfaces structured errors:
  - **Auth failure (401/403)** → points user to `/halal-setup`
  - **Quota exhausted (429)** → surfaces current plan + upgrade link; suggests which skill(s) to avoid until reset
  - **Transient network error (5xx, timeout)** → 1 retry, then graceful fail with "try again in a moment"
- **No rate-limit headers are currently exposed by the API.** Skills do not attempt to read `X-RateLimit-*`. Instead:
  - `using-halal-investing` warns when a session has made heavy MCP calls on a Free plan
  - `halal-doctor` surfaces estimated remaining quota and links to the authoritative dashboard
- Token-cost expectations are surfaced prominently:
  - README includes the token-cost table and plan tiers
  - `/halal-setup` warns Free-plan users that 50 tokens ≈ 5–10 full screenings, not 50 requests
  - Each skill's SKILL.md includes a one-line "~N tokens per run" estimate so users can budget

## 9. Testing & evals

### `tests/skill-trigger-evals/`

Eval prompts that assert the correct skill fires for a given user intent. Examples:
- "is AAPL halal?" → `halal-verdict` (not `halal-methodologies`)
- "build me a non-tech halal growth portfolio" → `halal-portfolio-builder`
- "what's the difference between AAOIFI and MSCI?" → `halal-methodologies`

### `tests/output-shape-evals/`

Prompts + expected output fragments. Every verdict output must contain:
- The disclaimer sentence (exact text match)
- A 5-methodology result matrix (structural match)
- The Halal Terminal branding footer

### Tooling

Uses the `skill-creator` plugin's eval harness. Runs in CI on every PR. Also runs locally via `scripts/run-evals.sh`.

## 10. Branding & licensing

### License: Apache-2.0

Selected because:
- OSI-approved ("real" open source)
- Section 6 explicitly carves out trademark rights — forkers can use code but not "Halal Terminal" marks
- Industry standard for corporate-backed plugins; matches superpowers, frontend-design
- Frictionless adoption (the moat is halalterminal.com's API, not the prompt text)

### `TRADEMARKS.md`

Reserves:
- "Halal Terminal"
- "HalalTerminal"
- "halalterminal.com"
- The Halal Terminal logo

Requires any redistributed README to carry the attribution line: *"Powered by Halal Terminal — halalterminal.com"*.

### `NOTICE`

Carries copyright + the Powered-By attribution line. Per Apache-2.0, this file must be propagated by anyone redistributing.

### README badge

Top-of-README badge: `[Powered by Halal Terminal](https://halalterminal.com)`.

### Per-skill footer

Every SKILL.md output ends with: `_Data: halalterminal.com — Shariah-screened market data API._`

### README external links

README links to:
- API docs: `https://api.halalterminal.com/docs` (Swagger), `/redoc` (ReDoc)
- Legal: `https://halalterminal.com/legal` (consolidated disclaimer + jurisdiction notices), `https://halalterminal.com/privacy`, `https://halalterminal.com/cookies`
- Contact: `yassir@halalterminal.com`
- Dashboard: `https://halalterminal.com/dashboard`

## 11. Out of scope (explicitly)

- Issuing fiqh rulings or fatwa
- Multi-language output (English only in v1)
- Broker integrations or trade execution
- Real-time alerts / streaming
- Mobile-app-specific UX
- Multi-currency support beyond USD (v1 is USD-first)
- Crypto compliance screening (equity + ETF only in v1)
- Webhook-driven alerts (requires Pro plan; deferred to v2 — see §13)

## 12. Build sequence (high-level)

Detailed build plan goes in the implementation-plan document (produced by `writing-plans` skill). This section lists the high-level phases for context:

1. Repo scaffolding + plugin manifest + Apache-2.0 + TRADEMARKS + NOTICE
2. MCP bridge script + `.mcp.json`
3. `/halal-setup` + `/halal-doctor` slash commands
4. Shared references (4 files)
5. Umbrella skill: `using-halal-investing`
6. Simple skills in order: `halal-verdict`, `halal-methodologies`, `halal-zakat`, `halal-watchlist`
7. Moderate skills: `halal-etf-analysis`, `halal-news-watch`, `halal-portfolio-audit`
8. Complex skill + subagent: `halal-portfolio-builder`
9. Test evals (trigger + output shape)
10. README, CHANGELOG, CONTRIBUTING
11. Marketplace listing + release v1.0.0

## 13. Future roadmap (v1.1+)

- **v1.1 — Device-code setup flow.** When halalterminal.com exposes `/auth/device` + `/activate`, upgrade `/halal-setup` to a paste-free flow matching `gh auth login`.
- **v1.2 — Symbol disambiguation.** Use `GET /api/suggest` in `halal-verdict` and `halal-watchlist` to handle ambiguous inputs (e.g. user types "apple" → suggest AAPL).
- **v2 — Webhook-driven alerts.** For Pro+ users, a `halal-alerts` skill that registers webhooks on holdings for compliance-status changes (e.g., a stock newly fails after a debt raise). Requires webhook receiver infrastructure.
- **v2 — Multi-language output.** Arabic + French rendering of verdicts and education content.
- **v2 — Bulk index screening workflows.** Skills that wrap `/api/screen-bulk` for users who want "which of the S&P 500 is halal this quarter?"
- **v2 — Custom methodology support.** Enterprise-tier feature; skills can accept a `methodology: custom` param routing to user's saved methodology config.
