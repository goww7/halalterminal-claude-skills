---
name: halal-news-watch
description: Surface news and SEC filings that could change a holding's Shariah-compliance status (debt raises, new business lines, major acquisitions, spin-offs, dividend policy changes). Use when the user asks for news affecting compliance or filings on their holdings.
---

# halal-news-watch

## When fired

- "Any news on AAPL's compliance?"
- "Filings affecting my portfolio's compliance"
- "What changed for TSLA recently?"

## Process

1. Load `references/disclaimer.md`.
2. For each symbol the user asks about (or each holding in their portfolio if they say "my holdings"):
   - Call `get_news` with `symbol: <SYM>`, `limit: 5`. ~1 token per call.
   - Call `get_sec_filings` with `symbol: <SYM>`, `limit: 5`. ~1 token per call.
   - For retail, show only items with compliance-impact keywords in the title/summary:
     - **Debt-related**: "bond", "notes", "credit facility", "term loan", "debt raise", "refinanc".
     - **Business-line**: "acquisition", "divestiture", "spin-off", "new business", "pivot".
     - **Dividend**: "dividend increase", "dividend cut", "special dividend".
     - **Material**: 8-K (form-type in filings).
3. Rank items: compliance-impact > size of deal > recency.
4. Do NOT issue a new verdict — just flag *"this is worth a re-screen; run halal-verdict on <SYM> to see current status"*.

## ~N tokens per run

1–2 tokens per symbol per call × 2 calls = ~4 tokens per symbol. For 10 holdings, ~40 tokens.

## Output structure

- Per symbol (if material news found): `<SYM> — <headline> (<date>, <source>). Why it matters: <one-line compliance-impact explanation>.`
- Summary: total items flagged, recommended follow-ups.
- No verdict header, no methodology matrix (this isn't a verdict).
- Non-fatwa disclaimer not required (no verdict emitted), but branding footer is.

## Audience tuning

- **Retail** — plain-English explanation of why each item matters.
- **Advisor** — show filing type codes (8-K, 10-K, S-1), deal sizes in dollars.
- **Scholar** — focus on items that would push a methodology over its threshold (e.g., "this $5B debt raise brings debt/market cap from 28% to 34% — this would push AAOIFI and MSCI over their limits").

## Hard rules

- Do NOT re-screen. Just flag for re-screening via halal-verdict.
- Warn the user when a symbol has no recent filings or news — don't fabricate.
