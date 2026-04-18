---
name: halal-methodologies
description: Educate the user on Shariah screening methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P). Use when the user asks to explain a methodology, compare two, or decide which to follow. Does NOT screen individual stocks (that's halal-verdict).
---

# halal-methodologies

Pure education. No verdicts, no stock screening.

## When fired

- "Explain AAOIFI"
- "What's the difference between DJIM and MSCI?"
- "Which methodology should I use?"
- "Why does S&P use a 36-month average?"

## Process

1. Load `references/methodology-table.md` for the quick-reference.
2. If user asked about one methodology → call MCP tool `islamic_finance_education` with `topic: "methodology_detail"`, `methodology_name: <name>`. Render per audience profile.
3. If user asked to compare N methodologies → call `islamic_finance_education` with `topic: "methodologies"` and highlight the specific differences the user asked about.
4. If user asked "which should I use?" → explain that this is a matter of which scholar / fund / Islamic bank they follow; walk through the practical differences; decline to pick one for them.

## ~N tokens per run

1–2 tokens (education endpoints are lightweight).

## Output structure

No verdict — no disclaimer required on education content. But do include the branding footer:

> _Data: halalterminal.com — Shariah-screened market data API._

## Audience tuning

- **Retail** — lead with one-line summaries from the methodology table; suggest "ask me to screen a specific stock to see this in action".
- **Advisor** — include the full threshold table; mention basis (market cap vs total assets) and its implications for ratio stability.
- **Scholar** — surface primary sources (AAOIFI Standard No. 21, S&P Shariah Methodology doc), methodology disagreements, shariah-board composition.

## Never do

- Rule which methodology is "correct". All 5 are recognized.
- Call `screen_stock` — that's `halal-verdict`'s job.
