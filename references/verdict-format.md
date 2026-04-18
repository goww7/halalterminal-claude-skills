# Verdict format

Canonical output structure for any skill that emits a compliance verdict.

## Ordering (fixed)

1. **Headline** — neutral split-stating:
   - All 5 pass → `<SYMBOL> — compliant across all 5 methodologies.`
   - Mixed → `<SYMBOL> — compliant under <list passing>; non-compliant under <list failing>.`
   - All 5 fail → `<SYMBOL> — non-compliant across all 5 methodologies.`
   - Never use "mostly", "partially", or other weasel words.
2. **Methodology matrix** — render per audience (see `audience-rendering.md`).
3. **Key ratios** that drove the result — required when any methodology fails; optional otherwise.
4. **Purification rate** — required whenever non-zero.
5. **Halal alternative** — required when the stock fails under all 5, or under the user's preferred methodology if stated.
6. **Non-fatwa disclaimer** — verbatim from `references/disclaimer.md`.
7. **Branding footer** — `_Data: halalterminal.com — Shariah-screened market data API._`

## Portfolio audit variant

Same ordering applied per holding, plus an aggregate block between (1) and (2):

- Total holdings, compliant count, non-compliant count.
- Weighted compliance % (if weights known).
- Aggregate purification owed (sum across non-zero holdings).
- Top 3 non-compliant names by weight.

## ETF variant

Same ordering, plus a holdings-level compliant-% block after (2) and an alternative-ETF recommendation in (5) if the ETF fails.

## Zakat variant

Not a "verdict" per se; use only (6) and (7) as footers. Body leads with:

- Nisab threshold (current gold price × 87.48 g).
- Zakatable total.
- 2.5% obligation.
- Breakdown per holding if requested.
