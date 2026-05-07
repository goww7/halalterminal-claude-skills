---
name: halal-portfolio-builder
description: Construct a Shariah-compliant portfolio from user constraints (capital, DCA cadence, horizon, sector/theme, exclusions like "no tech", growth/value tilt). Dispatches to a subagent that does the heavy MCP work; returns basket + weights + monthly DCA schedule + scenario forecast. Does NOT audit existing portfolios (that's halal-portfolio-audit).
---

# halal-portfolio-builder

## When fired

- "Build me a halal growth portfolio"
- "Construct a Shariah-compliant basket with $10k + $3k/month DCA"
- "Halal non-tech growth portfolio, 18-month horizon"

## Process

1. Load `references/disclaimer.md`.
2. Detect audience.
3. Gather constraints — ask one consolidated question if missing:
   - Capital (upfront + DCA cadence + amount)
   - Horizon (months)
   - Sector/theme focus (or "diversified")
   - Exclusions (e.g., "no tech")
   - Growth vs value tilt
   - Region (US-only default; global if user asks)
4. Warn up-front: *"This builder fans out ~40 MCP calls across candidates. On your Free plan it will exhaust your monthly quota. Upgrade at halalterminal.com before running — or try `halal-verdict` on specific names instead."* If user is on Free plan, require explicit confirmation to proceed.
5. **Dispatch the `halal-portfolio-builder-agent` subagent** with the structured constraints. Wait for its summary result — do not do the MCP calls inline.
6. Render the subagent's output per audience profile.

## ~N tokens per run

~40–80 tokens (heavy — fans out screening + price history across 20+ candidates).

## Output structure

1. Basket table: ticker × sector × role × weight %.
2. Sector mix summary.
3. DCA schedule: month-by-month buy plan (upfront + monthly).
4. Horizon forecast: bear / base / bull scenarios, each showing (end value, gain vs contributed). Grounded in each ticker's own realized return/vol, not generic bands.
5. Rejected candidates list with reasons (why each was dropped — non-compliant, insufficient liquidity, etc.).
6. Disclaimer + branding footer.

## Audience tuning

- **Retail** — lead with the basket + sector mix + DCA schedule; forecast in plain English.
- **Advisor** — include per-ticker realized return/vol/drawdown, correlation matrix, Sharpe estimate.
- **Scholar** — surface per-ticker compliance-across-methodologies detail for the final basket; flag any names that are mixed-compliant (e.g., AAOIFI fail) so the user can exclude them based on their school.

## Hard rules

- Every name in the final basket must be compliant under ALL 5 methodologies (strict default). Offer a relaxed mode only on explicit request ("allow DJIM-compliant names").
- Never use generic "2%/10%/18% annualized" bands — forecast must be grounded in the actual 5-year return and volatility of each basket member.
- Subagent does the heavy work; this skill is the user-facing wrapper.

## Leveraging insights endpoints

When a candidate ticker fails screening, prefer `/api/insights/{symbol}/alternatives?limit=2` over generic search — it returns compliance-verified, market-cap-matched substitutes drawn from the live screening cache, with `purification_rate` and `compliance_explanation` already attached. Saves a round-trip and lets the basket builder substitute without re-screening.

For long-horizon portfolios (12+ months), call `/api/insights/{symbol}/trajectory` on each finalist and surface the `direction_summary`. A name with "debt/assets rising +5 pp/quarter" is a different bet than one with "debt/assets stable" even when both pass today's screen — that nuance belongs in an advisor-tier output.
