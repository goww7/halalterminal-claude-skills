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
6. Render per `references/verdict-format.md` and audience profile.
7. If the stock is non-compliant across all 5, or under the user's preferred methodology if stated, call `search_stocks` to find a halal alternative in the same sector. Limit to 3 suggestions.

## ~N tokens per run

5–10 tokens for the screen; +2–4 if alternative search is triggered.

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
- If `screen_stock` returns `error` or `error_message`, explain the error plainly; don't fabricate a verdict.

## Audience tuning

- **Retail** — one-paragraph verdict, mention only failing ratios if any, suggest one halal alternative.
- **Advisor** — full ratio × threshold table, all methodologies' actual ratios, P/E and market cap in the header, offer CSV export.
- **Scholar** — reference AAOIFI Standard No. 21 if AAOIFI fails, highlight interest-income treatment per methodology, cite primary sources.
