# halalterminal-claude-skills

[![Powered by Halal Terminal](https://img.shields.io/badge/powered%20by-Halal%20Terminal-1f6feb)](https://halalterminal.com)
[![Apache 2.0](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

Shariah-compliant investing capabilities for Claude Code, powered by [Halal Terminal](https://halalterminal.com).

Screen stocks across five methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P). Audit your portfolio. Build halal baskets with DCA schedules. Calculate zakat and dividend purification. All inside Claude Code.

## What you get

9 skills, 2 slash commands, 1 portfolio-builder subagent:

| Skill | Ask for it with |
|---|---|
| `halal-verdict` | *"Is AAPL halal?"* |
| `halal-portfolio-audit` | *"Audit my portfolio: AAPL 30%, MSFT 20%, ..."* |
| `halal-portfolio-builder` | *"Build me a halal growth portfolio: $10k + $3k/month, 18-month horizon."* |
| `halal-etf-analysis` | *"Is SPY halal?"* |
| `halal-zakat` | *"Calculate zakat on my holdings."* |
| `halal-methodologies` | *"Difference between AAOIFI and MSCI?"* |
| `halal-news-watch` | *"Any news affecting my holdings' compliance?"* |
| `halal-watchlist` | *"Add TSLA to my halal watchlist."* |
| `using-halal-investing` | Umbrella — routes to the right sub-skill. |

Plus `/halal-setup` (one-time API key capture) and `/halal-doctor` (diagnostics).

## Install

```
/plugin install halalterminal-claude-skills
/halal-setup
```

`/halal-setup` walks you through:

1. Getting a free API key at https://api.halalterminal.com (email → key in your inbox, no credit card).
2. Pasting the key; it's written to `~/.claude/settings.json` under the `halalterminal` MCP server's env block.
3. Validating connectivity via `/halal-doctor`.

## Plans and quotas

The Halal Terminal API is token-metered.

| Plan | Monthly tokens | Price | Note |
|---|---|---|---|
| Free | 50 | $0 | ~5–10 full screenings |
| Starter | 2,500 | $19 | for individual investors |
| Pro | 15,000 | $49 | webhooks, bulk priority |
| Enterprise | Unlimited | $199+ | custom methodologies, SLA |

Sign up: https://api.halalterminal.com

## What this plugin is NOT

- **Not a fatwa.** Every verdict is a methodology-based screening. Consult a qualified scholar for personal rulings.
- **Not a trading platform.** No broker integrations, no order execution.
- **Not a real-time alert system.** Request-response only in v1 (webhooks coming in v2 for Pro+ users).
- **Not a multi-language tool.** English only in v1.

## Architecture

- **Skills** live in `skills/<name>/SKILL.md`.
- **Shared prompt fragments** (disclaimer, methodology table, audience-rendering, verdict-format) live in `references/`.
- **MCP server** (Halal Terminal's Python SSE server) is bridged to stdio by `scripts/halalterminal-mcp.mjs`.
- **Portfolio builder** dispatches to a subagent defined in `agents/halal-portfolio-builder-agent.md` to keep ~40+ MCP calls out of your main session context.

## Development

```bash
git clone https://github.com/goww7/halalterminal-claude-skills
cd halalterminal-claude-skills
npm install
npm run evals   # eval harness scaffolded; per-skill evals deferred to v1.1
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache-2.0 — see [LICENSE](LICENSE).

"Halal Terminal", "HalalTerminal", and the Halal Terminal logo are reserved trademarks — see [TRADEMARKS.md](TRADEMARKS.md).

## Legal

- [Legal & Disclaimer](https://halalterminal.com/legal) — educational-research framing, investment disclaimer, Shariah compliance notice, liability limits, jurisdiction notices
- [Privacy Policy](https://halalterminal.com/privacy)
- [Cookie Policy](https://halalterminal.com/cookies)

## Support

- Contact: yassir@halalterminal.com
- Dashboard: https://halalterminal.com/dashboard
- API docs: https://api.halalterminal.com/docs (Swagger) · https://api.halalterminal.com/redoc (ReDoc)

---

Powered by Halal Terminal — https://halalterminal.com
