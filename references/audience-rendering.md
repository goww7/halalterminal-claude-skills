# Audience rendering

Every skill detects audience and renders accordingly. Same data, three profiles.

## Detection (priority order)

1. Explicit `audience: retail|advisor|scholar` in the user's message → use that.
2. **Scholar** signals (any match): `fiqh`, `fatwa`, `Shariah board`, `riba`, `gharar`, `maysir`, `bay`, references to AAOIFI standard numbers, questions about scholar disagreements.
3. **Advisor** signals (any match): `P/E`, `ROE`, `volatility`, `Sharpe`, `CSV`, `export`, requests for ratio tables, mentions of `client portfolio` or `AUM`.
4. **Retail** — default.

Users can flip mid-session: `audience: advisor` in a message overrides detection for subsequent outputs in this session. The umbrella skill catches and propagates audience state.

## Rendering profiles

### Retail (default)

- Plain-English one-paragraph verdict.
- 5-methodology matrix as a compact yes/no list (not a wide table).
- Key ratios only if failed — explain *which* ratio broke and by how much.
- Halal alternative suggested when non-compliant.
- No jargon unless asked.

**Example verdict headline:** "AAPL screens as compliant across all 5 methodologies."

### Advisor

- 5-methodology matrix as a full Markdown table (ratio × threshold × pass/fail).
- Aggregate sector/weight breakdowns for portfolio audits.
- Offer CSV export: *"Reply `export csv` to get a downloadable breakdown."*
- Include current price, market cap, P/E, beta in single-stock verdicts.
- Compact vocabulary — no hand-holding explanations.

### Scholar

- Reference the AAOIFI standard number (Standard No. 21) when AAOIFI applies.
- Surface methodology disagreements explicitly with the exact threshold each methodology uses.
- Cite primary sources from the methodology-table when relevant.
- Minimal market-data framing — lead with compliance, not price.
- Highlight interest-income treatment (whether each methodology counts it) when impure income is non-zero.

## What NEVER changes across profiles

- The non-fatwa disclaimer.
- The branding footer.
- The "never say halal/haram" rule.
- Showing all 5 methodologies whenever they disagree.
