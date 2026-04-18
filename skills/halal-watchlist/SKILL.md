---
name: halal-watchlist
description: Create, view, modify, or delete stock watchlists with compliance status attached to each symbol. Use when the user wants to track stocks for later screening / monitoring.
---

# halal-watchlist

## When fired

- "Add TSLA to my halal watchlist"
- "Show my watchlist"
- "Remove AAPL from the tech list"
- "Create a watchlist for bank alternatives"

## Process

1. Identify the action: `create`, `list`, `get`, `add_symbol`, `remove_symbol`, `delete`.
2. Extract `watchlist_id` or `name` and `symbol` as needed.
3. Call MCP tool `manage_watchlist` with the relevant args.
4. When showing a watchlist, enrich each symbol with `get_screening_result` (cached — cheap) and `get_quote` (cheap). If a symbol has never been screened, flag *"not yet screened — ask me to screen it"*.
5. Render per audience; apply the verdict format's branding footer.

## ~N tokens per run

- CRUD only: ~1–2 tokens.
- List with enrichment: ~1 + 2 × N tokens (per-symbol screening result + quote).

## Output structure

Per verdict-format.md (`Portfolio audit variant` aggregate block adapted):

- Watchlist name and total symbols.
- Per-symbol line: `<SYMBOL>  <PRICE>  <1D %>  <compliance summary>`.
- Flag symbols with mixed/failing compliance.
- Branding footer.

No per-verdict disclaimer (this is informational listing, not a verdict-by-verdict output). If the user asks for a full verdict on any symbol, route to `halal-verdict`.

## Audience tuning

- **Retail** — compact list, one line per symbol, quick compliance glyph.
- **Advisor** — full table with compliance matrix per symbol, total market value, weighted compliance %.
- **Scholar** — focus on methodology-disagreement symbols; suggest screening those individually.
