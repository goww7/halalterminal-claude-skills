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
   - Call `get_news` with `symbol: <SYM>`, `limit: 20`, **`compliance_relevance: "high"`** — this returns *only* articles tagged debt_issuance / m_and_a / dividend_change / equity_action / distress. The tagger is server-side; you do not need to keyword-match yourself.
   - If `compliance_relevance: "high"` returns 0 hits, retry with `compliance_relevance: "medium"` to surface softer signals (refinancings, share splits, governance changes).
   - Call `/api/insights/{SYM}/staleness` — this returns `is_stale: true` whenever a material 8-K (item codes 1.01, 2.01, 2.03, 5.02, 8.01) was filed *after* the symbol's last screening, with the filing URL inline. ~1 token.
   - Optionally call `get_sec_filings` for the raw 10-K/10-Q calendar if the user wants context.
3. Rank items by `compliance_categories` (debt_issuance + m_and_a outrank dividend_change + equity_action) then by recency.
4. Do NOT issue a new verdict — just flag *"this is worth a re-screen; run halal-verdict on <SYM> to see current status"*.

## ~N tokens per run

1–2 tokens per symbol per call × 2 calls = ~4 tokens per symbol. For 10 holdings, ~40 tokens.

## Output structure

- Per symbol (if material news found): `<SYM> — <headline> (<date>, <source>). Tagged: <compliance_categories>. Why it matters: <one-line compliance-impact explanation>.`
- If `staleness.is_stale: true`, prepend a "🚨 Re-screen recommended" line with the filing URL.
- Summary: total items flagged grouped by category, plus how many holdings have stale screenings.
- No verdict header, no methodology matrix (this isn't a verdict).
- Non-fatwa disclaimer not required (no verdict emitted), but branding footer is.

## Audience tuning

- **Retail** — plain-English explanation of why each item matters.
- **Advisor** — show filing type codes (8-K, 10-K, S-1), deal sizes in dollars.
- **Scholar** — focus on items that would push a methodology over its threshold (e.g., "this $5B debt raise brings debt/market cap from 28% to 34% — this would push AAOIFI and MSCI over their limits").

## Hard rules

- Do NOT re-screen. Just flag for re-screening via halal-verdict.
- Warn the user when a symbol has no recent filings or news — don't fabricate.
