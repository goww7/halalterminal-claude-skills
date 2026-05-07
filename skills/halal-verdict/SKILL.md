---
name: halal-verdict
description: Use when the user asks whether a specific stock is Shariah-compliant ("Is X halal?", "Screen TSLA", "Compliance of AAPL"). Produces a single-stock verdict across all 5 methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P), explains any failures, and suggests a halal alternative if non-compliant. Does NOT cover ETFs (use halal-etf-analysis) or portfolios (use halal-portfolio-audit).
---

# halal-verdict

## When fired

"Is AAPL halal?" / "Screen TSLA" / "Compliance of MSFT" / "Is Apple Shariah-compliant?"

## Process

1. Load `references/disclaimer.md` and enforce its hard rules.
2. Detect audience per `references/audience-rendering.md`.
3. Extract the ticker symbol. If the user gave a company name without ticker ("apple"), use reasoning to infer the most common listing (AAPL). If ambiguous ("apple" could be AAPL or a private firm), ask one clarifying question.
4. Call MCP tool `screen_stock` with `symbol: <ticker>`. ~5–10 tokens.
5. If the response indicates the stock hasn't been screened before, `screen_stock` will screen it — this may take up to 10 seconds. Tell the user to hold on.
6. **Headline first:** if the response includes `compliance_explanation`, use that string verbatim as the one-line headline answer for retail audiences. It already encodes which methodologies pass/fail and which ratio tripped any failures.
7. Render per `references/verdict-format.md` and audience profile.
8. **Trajectory beat (advisor/scholar only):** if the stock passes screening, optionally call `/api/insights/{symbol}/trajectory` and include the `direction_summary` line ("debt/assets falling: latest X% vs. 7-quarter median Y%") to show whether the verdict is on stable or shifting ground.
9. **Staleness check:** if `screen_stock`'s `last_checked_at` is more than 7 days old, also call `/api/insights/{symbol}/staleness`. If `is_stale: true`, prepend a warning that recent material 8-Ks may shift the verdict and link the most recent filing.
10. If the stock is non-compliant under the user's preferred methodology, call `/api/insights/{symbol}/alternatives?limit=3` (preferred over `search_stocks` — this returns compliance-verified, market-cap-matched alternatives directly). Surface the `note` field so the user knows whether the matches are same-sector or cross-sector.

## ~N tokens per run

5–10 tokens for the screen; +2–4 if alternative lookup is triggered; +1 each
for trajectory and staleness if surfaced.

## Output structure (per verdict-format.md)

1. Headline (neutral split-stating format).
2. Methodology matrix (audience-dependent rendering).
3. Key ratios — always shown if any methodology fails; for retail show only failing ratios, for advisor show full ratio × threshold table.
4. Purification rate if non-zero.
5. Halal alternative if failed.
6. Disclaimer footer.
7. Branding footer.

## Hard rules

- Never say "this stock is halal" / "this stock is haram".
- Always show all 5 methodology results when they disagree.
- Always surface purification rate when non-zero.
- If `screen_stock` returns `error: "ticker_unknown"`, treat it as a coverage gap, NOT a non-compliance finding. Tell the user we don't have data on the ticker; do NOT say it is non-compliant.
- If `compliance_explanation` is present in the response, render it verbatim — it is generated to be domain-correct, audience-neutral, and consistent with the methodology table below it.
- If `screen_stock` returns `error` or `error_message` (other than `ticker_unknown`), explain the error plainly; don't fabricate a verdict.

## Audience tuning

- **Retail** — one-paragraph verdict, mention only failing ratios if any, suggest one halal alternative.
- **Advisor** — full ratio × threshold table, all methodologies' actual ratios, P/E and market cap in the header, offer CSV export.
- **Scholar** — reference AAOIFI Standard No. 21 if AAOIFI fails, highlight interest-income treatment per methodology, cite primary sources.
