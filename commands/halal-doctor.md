---
name: halal-doctor
description: Diagnose the Halal Terminal plugin — credentials storage, API key validity, plan quota, MCP bridge connectivity, skill inventory, recent errors. Read-only; never mutates state.
---

# /halal-doctor

Run the checks below in order. Report each as ✓ / ⚠ / ✗ with a one-line explanation. Keep output compact; do not lecture.

## 1. Plugin version

Read `.claude-plugin/plugin.json` from this plugin's install path. Report `name` and `version`.

## 2. Credentials storage

Check both locations:

- **Credentials file**: `~/.claude/halalterminal/credentials` — look for a line `HALALTERMINAL_API_KEY=ht_...` (length ≥ 20).
- **pluginConfigs**: `~/.claude/settings.json` → `pluginConfigs["halalterminal-claude-skills@halalterminal-claude-skills"].mcpServers.halalterminal.HALALTERMINAL_API_KEY`.

Report:
- ✓ "Both locations have matching key (last 4: `XYZ9`)."
- ⚠ "Only one of the two storage locations has the key; run `/halal-setup` to sync."
- ⚠ "The two locations have DIFFERENT keys. Run `/halal-setup` to reconcile."
- ✗ "No API key configured. Run `/halal-setup`." — **stop here; skip remaining checks**.

## 3. API key valid against the live API

Using the key from step 2, run:

```bash
curl -sS -o /dev/null -w '%{http_code}' \
  -H 'X-API-Key: <THE_KEY>' \
  https://api.halalterminal.com/api/education/methodologies
```

- `200` → ✓ "Key accepted."
- `401` / `403` → ✗ "Key rejected. Run `/halal-setup` to replace it."
- `429` → ⚠ "Key is over quota. See https://halalterminal.com/dashboard."
- Other / network error → ⚠ "API unreachable right now — check status."

## 4. MCP bridge status

Run `claude mcp list`. Report one of:

- ✓ "Plugin MCP `halalterminal-claude-skills:halalterminal` is connected."
- ⚠ "Plugin MCP failed to connect, but a separate `halalterminal` MCP is registered elsewhere and is serving queries. To use the plugin's bridge exclusively, remove the other registration; otherwise this is harmless."
- ✗ "No `halalterminal` MCP is registered anywhere. Restart Claude Code after setup, or add one manually."

List every line matching `halalterminal` so the user can see the full picture.

## 5. Plan + token costs

Try `curl https://api.halalterminal.com/api/keys/token-costs` with the key. If 200, render the returned cost table. Otherwise fall back to this hardcoded table:

```
~0–1 tokens   education, news, suggest, watchlists, database reads
~2 tokens     quote (GET), asset, dividends, filings, ohlc, trending
~5 tokens     screen_stock, zakat, batch quotes, compare
~10 tokens    etf screen, etf purification, reports
~15 tokens    portfolio scan, etf compare
~25 tokens    etf bulk screen
~50 tokens    bulk-index screen
```

Then remind: Free plan = 50 tokens/month. Upgrade at https://halalterminal.com.

## 6. Skill inventory

List directories under the plugin's `skills/`. Expect these 9:

`using-halal-investing, halal-verdict, halal-portfolio-audit, halal-portfolio-builder, halal-etf-analysis, halal-zakat, halal-methodologies, halal-news-watch, halal-watchlist`

## 7. Recent MCP errors

```bash
ls -t ~/.claude/logs/*halalterminal*.log 2>/dev/null | head -1
```

If found, show `tail -5` of the latest. Otherwise report ✓ "No recent MCP errors."

## Final line

If every check passed: *"All green — you're set."*
Otherwise: *"Issues above. Most common fix: run `/halal-setup`."*

## Hard rules

- **Never** print the full API key — last 4 characters only.
- **Read-only**: never write to any file, never register or remove MCP servers.
