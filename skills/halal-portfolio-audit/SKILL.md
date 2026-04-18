---
name: halal-portfolio-audit
description: Audit an existing portfolio (list of holdings with weights or values) for Shariah compliance. Produces per-stock results, aggregate compliant %, purification owed, and remediation suggestions for non-compliant names. Does NOT build new portfolios (that's halal-portfolio-builder).
---

# halal-portfolio-audit

## When fired

- "Audit my portfolio: [list]"
- "Screen these holdings"
- "Is my 401k halal?"
- "Check compliance on my positions"

## Process

1. Load `references/disclaimer.md`.
2. Parse holdings from the user's message. Accept formats:
   - `SYM 30%, SYM 20%, ...` (weights)
   - `SYM $10000, SYM $5000, ...` (market values)
   - `SYM 100 shares, SYM 50 shares, ...` (shares — in which case call `get_quote` to convert)
3. Warn about token cost up front: *"This audit will cost roughly ~5–10 tokens per holding (~<total> tokens)."*
4. Call `scan_portfolio` with `symbols: [list]`, `force_refresh: false` (use cached results when available).
5. If the user asked for purification, also call `calculate_zakat` with `calculation_type: "purification"` and the holdings.
6. Render per verdict-format.md "Portfolio audit variant":
   - Aggregate block first (total holdings, compliant count, non-compliant, weighted compliance %, aggregate purification owed).
   - Then per-holding summary.
   - Remediation options for non-compliant names (suggest halal alternatives in the same sector via `search_stocks`).
7. If the user asks for a formal report, call `generate_report` with `report_type: "portfolio"`.

## ~N tokens per run

- ~5–10 tokens per holding (scan_portfolio batches internally).
- +3–5 tokens for purification if requested.
- +5–10 tokens if report generated.

## Output structure (per verdict-format.md Portfolio variant)

1. Aggregate headline: "X of Y holdings compliant across all 5 methodologies (Z% by weight)."
2. Aggregate purification owed.
3. Top 3 non-compliant names by weight.
4. Per-holding verdict (compact table).
5. Remediation suggestions for each non-compliant name.
6. Disclaimer + branding footer.

## Audience tuning

- **Retail** — one-paragraph summary, then a compact per-holding list with emoji compliance glyphs.
- **Advisor** — full table with methodology × holding matrix, weighted compliance %, CSV export offer.
- **Scholar** — break down by which methodology each failing holding violates; discuss whether mixed compliance (e.g., AAOIFI fail only) is acceptable per the user's school.

## Hard rules

- Never summarize the portfolio as "halal" or "haram". Always quantify: X% compliant, Y% non-compliant, $Z purification owed.
- Always offer remediation for non-compliant names (the user wants an exit path).
