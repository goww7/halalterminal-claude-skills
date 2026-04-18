---
name: halal-setup
description: One-time setup — capture the Halal Terminal API key and register the MCP server.
---

# /halal-setup

You are running the Halal Terminal setup flow. Your job is to walk the user through getting an API key and wiring it into Claude Code's MCP configuration. Keep your tone warm and efficient.

## Step 1 — Guide the user to an API key

Print exactly:

> **Halal Terminal setup**
>
> 1. Go to https://api.halalterminal.com and enter your email in the **Get your free API key in seconds** panel.
> 2. Check your inbox — you'll receive a key starting with `ht_`.
> 3. Paste the key when prompted below.

Then ask: *"Paste your Halal Terminal API key:"*

## Step 2 — Validate key format

When the user pastes a value, verify:
- Starts with `ht_`
- Length ≥ 20 characters
- No whitespace

If invalid, reject with: *"That doesn't look like a Halal Terminal key. Keys start with `ht_` and are longer than 20 characters. Please paste again."* and re-prompt.

## Step 3 — Validate against the live API

Call `GET https://api.halalterminal.com/api/education/methodologies` with header `X-API-Key: <key>`. Use the WebFetch tool for this validation call.

Treat:
- 2xx → key valid, continue.
- 401/403 → *"That key was rejected by halalterminal.com. Double-check it's the one emailed to you, and try again."* Re-prompt.
- 429 → *"That key is over its quota. Top up at https://halalterminal.com/dashboard, or create a new key."* Re-prompt.
- 5xx / network error → *"Halal Terminal API is unreachable right now — check https://halalterminal.com for status. Skipping validation; setup will continue."* Continue.

## Step 4 — Write the key into settings.json

Edit `~/.claude/settings.json` to add an env var for the halalterminal MCP server:

```json
{
  "mcpServers": {
    "halalterminal": {
      "env": {
        "HALALTERMINAL_API_KEY": "ht_THE_VALIDATED_KEY"
      }
    }
  }
}
```

Preserve all other existing content in the file. If an `mcpServers.halalterminal.env` block already exists, overwrite only `HALALTERMINAL_API_KEY`.

## Step 5 — Run /halal-doctor to confirm

Invoke `/halal-doctor` to verify connectivity and surface plan/quota info. If doctor reports all green, end with:

> You're set. Try `Is AAPL halal?` to test.

If doctor reports any failure, print its output and suggest `/halal-setup` again.

## Notes

- Never echo the full API key back to the user after they paste it. When you need to reference it, show only the last 4 characters (e.g. `ht_...XYZ9`).
- Do not write the key to any file outside `~/.claude/settings.json`.
- Free plan = 50 tokens/month. A full screening costs 5–10 tokens — warn the user of this before ending.
