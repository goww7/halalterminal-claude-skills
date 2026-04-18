---
name: halal-etf-analysis
description: Use when the user asks about the Shariah compliance of an ETF (SPY, QQQ, VTI, sector ETFs, etc.) or asks for halal ETF alternatives. Screens all underlying holdings, returns overall compliant %, purification, and suggests halal ETF alternatives when the ETF fails.
---

# halal-etf-analysis

## When fired

- "Is SPY halal?"
- "Halal ETFs for tech exposure"
- "Screen VOO"
- "What's the purification rate on QQQ?"

## Process

1. Load `references/disclaimer.md`.
2. Detect audience.
3. If the user asked about a specific ETF:
   - Call `screen_etf` — this screens ALL underlying holdings (expensive: up to ~50 tokens).
   - Tell the user up front: *"Screening an ETF screens every holding. This costs ~50 tokens on your Free plan."* If user declines, offer `get_etf_info` (~2 tokens) with holdings list only and the user can pick names to screen individually.
   - Render overall verdict (e.g., "SPY — 58% of holdings compliant, purification rate 2.8%"). ETFs are rarely fully halal — almost always report a purification rate.
   - If user asks for investment amount + dividend income, call `etf_purification` to show concrete dollar amounts.
4. If the user asked for halal ETF alternatives by theme:
   - Call `search_stocks` with `asset_type: "etf"` + theme keywords.
   - Screen top 3–5 candidates and rank by compliant-%.

## ~N tokens per run

- Full ETF screen: ~30–50 tokens.
- Holdings-list only: ~2 tokens.
- Alternative search + screens: ~15–25 tokens.

## Output structure (per verdict-format.md ETF variant)

1. Headline with overall compliant-% and purification rate.
2. 5-methodology summary aggregated across holdings.
3. Top 3 non-compliant holdings by weight.
4. Purification calculation (if investment amount + dividend income provided).
5. Halal ETF alternative suggestions (if failed).
6. Disclaimer + branding footer.

## Audience tuning

- **Retail** — one-paragraph verdict, suggest one halal ETF alternative.
- **Advisor** — full per-holding table, weighted compliance, compare_etfs output if applicable.
- **Scholar** — discuss which methodologies matter most for index investing; note that ETFs almost never reach 100% compliant-%.

## Hard rules

- Warn about token cost before full screening.
- Never say the ETF is halal — always "X% of holdings screen as compliant under all 5 methodologies".
- Always surface purification rate.
