---
name: halal-zakat
description: Use when the user wants to calculate zakat on stock holdings (obligatory 2.5% charity) or dividend purification (donating the impure portion of dividend income from partially-compliant stocks). Requires the user's holdings — ask for them if not provided. Uses current gold price for the nisab threshold.
---

# halal-zakat

## When fired

- "Calculate zakat on my portfolio"
- "How much zakat do I owe?"
- "Purification on my AAPL dividends"
- "Do I meet nisab?"

## Process

1. Load `references/disclaimer.md` (zakat is also not a fatwa — methodology choice is the user's).
2. Ask the user for the calculation type: **zakat** (annual charity on holdings value) or **purification** (impure portion of dividend income). If unclear, default to zakat.
3. Ask for holdings with values (zakat) or dividend income (purification) if not already provided.
4. Call MCP tool `calculate_zakat`:
   - For zakat: `calculation_type: "zakat"`, `holdings: [{ symbol, market_value }, ...]`, optional `gold_price_per_gram` (default 65).
   - For purification: `calculation_type: "purification"`, `holdings: [{ symbol, dividend_income }, ...]`.
5. Render the result with the current nisab threshold, total zakatable/impure amount, and the owed 2.5% (zakat) or impure dollars (purification).

## ~N tokens per run

Single zakat call — ~5 tokens plus any lookups.

## Output structure (per verdict-format.md "Zakat variant")

- Nisab threshold (gold price × 87.48 g). Flag if holdings are below nisab.
- Zakatable total or impure total.
- 2.5% obligation (zakat) or donation amount (purification).
- Per-holding breakdown if requested.
- Branding footer.

## Audience tuning

- **Retail** — lead with the total owed in dollars; explain nisab in one sentence.
- **Advisor** — include the full breakdown and show gold-price sensitivity (e.g., "at $60/g nisab = $X, at $70/g nisab = $Y").
- **Scholar** — cite AAOIFI's zakat standard if referenced; distinguish zakat-on-trading-assets vs zakat-on-long-term-holdings treatment.

## Hard rules

- Make clear this is a calculator, not a fatwa. Methodology choices (e.g., whether to apply zakat on long-term holdings at full value vs adjusted basis) depend on scholar guidance.
- Show the nisab threshold even when the user is comfortably above it.
- Gold price is volatile — if the user asks for "the" gold price, tell them you're using the default (`$65/g`) unless they provide one.
