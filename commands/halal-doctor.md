---
name: halal-doctor
description: Diagnose Halal Terminal setup — MCP connectivity, API key validity, plan tier, token usage.
---

# /halal-doctor

Diagnose the user's Halal Terminal installation. Report each check as ✓ pass / ✗ fail / ⚠ warn with one-line context.

## Checks (run in order)

### 1. Plugin version

Read `.claude-plugin/plugin.json` from this plugin's install path; report the version.

### 2. MCP server declared

Run `claude mcp list` and confirm `halalterminal` is present. If not, fail: *"MCP not registered. Run /halal-setup."*

### 3. API key present

Read `~/.claude/settings.json` for `mcpServers.halalterminal.env.HALALTERMINAL_API_KEY`. If missing: fail with *"No API key — run /halal-setup."*

### 4. API key valid

Call `GET https://api.halalterminal.com/api/education/methodologies` with header `X-API-Key: <key>` (WebFetch).
- 2xx → pass.
- 401/403 → fail: *"API key rejected."*
- 429 → warn: *"Key is over quota — see halalterminal.com/dashboard."*
- else → warn: *"API unreachable right now."*

### 5. Plan tier + token-cost hints

Call `GET https://api.halalterminal.com/api/keys/token-costs` (WebFetch). Render:

```
Plan: <tier>   (Free=50 / Starter=2500 / Pro=15000 / Enterprise=∞ tokens/month)
Approx token costs:
  get_quote, education reads     ~1–2 tokens
  screen_stock, screen_etf       ~5–10 tokens
  portfolio scan, bulk screens   up to ~50 tokens
```

If the endpoint is unreachable, hard-code the above fallback table.

### 6. Skill inventory

List every directory under `skills/` — expected 9 entries (one umbrella + eight workflows).

### 7. Last MCP error

If the MCP bridge has logged anything to `~/.claude/logs/` recently (look for `halalterminal` in filenames), show the tail.

## Output format

End with either:

> All green — you're set.

or:

> Issues above. Most common fix: rerun /halal-setup.

## Notes

- Never print the API key in full. If you must show it, last 4 chars only.
- This command should never mutate state.
