# Shariah screening methodologies — quick reference

Five major methodologies. The Halal Terminal MCP tool `screen_stock` returns pass/fail for all five.

| Methodology | Est. | Basis | Debt threshold | Cash threshold | Liquidity (AR+cash) threshold | Impure income | Interest income counts? |
|---|---|---|---|---|---|---|---|
| **AAOIFI** | 1991 | Market cap (trailing) | 30% | 30% | n/a (no separate AR) | 5% | Yes |
| **DJIM** | 1999 | 24-mo trailing avg market cap | 33% | 33% | 49% | 5% | No |
| **FTSE** | 1999 | Total assets | 33.33% | 33% | 50% | 5% | Yes |
| **MSCI** | 2007 | Total assets | 30% | 33% | 33% | 5% | Yes |
| **S&P** | 2006 | 36-mo trailing avg market cap | 33% | 33% | 49% | 5% | No (since 2023) |

## One-line summaries (for inline use in verdicts)

- **AAOIFI** — the standard-setter for Islamic banks; strict 30% debt/cash thresholds on market cap.
- **DJIM** — Dow Jones Islamic Market; 33% on 24-month market-cap average; excludes interest from impure income.
- **FTSE** — asset-based (33.33%/50%); strict one-third debt rule.
- **MSCI** — asset-based, strictest liquidity at 33%; smallest compliant universe.
- **S&P** — 36-month market-cap average; excludes interest from impure income (2023 update).

## When to use which

- **AAOIFI** — if your scholar or Islamic bank follows Middle East / Southeast Asia norms.
- **DJIM / S&P** — common for index funds and ETFs; more permissive on liquidity.
- **FTSE** — UK-based, broad asset-based screening.
- **MSCI** — when you want a conservative, smaller-universe screen.

For deeper detail, invoke the `halal-methodologies` skill.
