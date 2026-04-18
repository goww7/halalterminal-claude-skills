---
name: halal-setup
description: One-time setup — walk the user through getting a free Halal Terminal API key, validate it, and persist it so the plugin's MCP bridge can start. Run this when the user has no key yet, or when diagnostics flag the key as missing or invalid.
---

# /halal-setup

Your job is to get the user from "no API key" to "skills working" in under a minute. Be warm and fast. No lecturing about methodologies; no filler.

## Step 1 — Guide the user to a key

Print EXACTLY this block, then ask for the key:

> **Halal Terminal — one-time setup (~30 seconds)**
>
> 1. Open https://api.halalterminal.com — enter your email in the **Get your free API key in seconds** panel. (Free plan, no credit card.)
> 2. Check your inbox. You'll receive a key that starts with `ht_`.
> 3. Paste it below.

Ask: *"Paste your Halal Terminal API key:"*

## Step 2 — Validate the format

When the user replies, verify:
- Starts with `ht_`
- Length ≥ 20
- No whitespace

If invalid: *"That doesn't look like a Halal Terminal key — they start with `ht_` and are longer than 20 characters. Please paste again."* Re-prompt.

## Step 3 — Validate against the live API

Use the Bash tool (WebFetch cannot send custom headers). Run:

```bash
curl -sS -o /dev/null -w '%{http_code}' \
  -H 'X-API-Key: <THE_KEY>' \
  https://api.halalterminal.com/api/education/methodologies
```

Interpret the HTTP status:
- `200` → valid. Continue.
- `401` / `403` → *"The Halal Terminal API rejected that key. Make sure you pasted the full value from your email, with no extra whitespace. Try again."* Re-prompt.
- `429` → *"That key is already over its quota. Top up at https://halalterminal.com/dashboard, or create a new key at https://api.halalterminal.com."* Re-prompt.
- Anything else → *"Halal Terminal API is unreachable right now, but I'll save the key anyway. Run `/halal-doctor` later to retry."* Continue.

## Step 4 — Persist the key (TWO locations)

Both locations are required:

### 4a. Write `~/.claude/halalterminal/credentials` — authoritative for the MCP bridge

```bash
mkdir -p ~/.claude/halalterminal
chmod 700 ~/.claude/halalterminal
```

Write the file with ONLY this single line (no extra blank lines, no other content):

```
HALALTERMINAL_API_KEY=<THE_KEY>
```

Then: `chmod 600 ~/.claude/halalterminal/credentials`.

### 4b. Merge into `~/.claude/settings.json` under `pluginConfigs`

Read the existing `~/.claude/settings.json` (create `{}` if missing). Merge in the structure:

```json
{
  "pluginConfigs": {
    "halalterminal-claude-skills@halalterminal-claude-skills": {
      "mcpServers": {
        "halalterminal": {
          "HALALTERMINAL_API_KEY": "<THE_KEY>"
        }
      }
    }
  }
}
```

Preserve every other field already in the file. If the path exists, overwrite only `HALALTERMINAL_API_KEY`.

## Step 5 — Confirm + next steps

Tell the user:

> Saved (key `ht_...<last 4 chars>`). **Restart Claude Code** (or reload the plugin) so the MCP bridge picks up the new key — then try `Is AAPL halal?` to verify.

If you have access to an `mcp__halalterminal__*` tool in the current session, try `mcp__halalterminal__get_quote` with `symbol: "AAPL"`. If it works (2xx), tell the user *"It's already live — no restart needed. Try `Is AAPL halal?`."*

## Hard rules

- **Never** echo the full API key back to the user. Show only the last 4 characters (`ht_...XYZ9`) in any confirmation output.
- **Never** write the key to any location other than `~/.claude/halalterminal/credentials` and `~/.claude/settings.json`.
- `chmod 700` the directory and `chmod 600` the credentials file — the key is a secret.
- If validation fails and the user aborts, do not leave a partially-written credentials file — delete it.
- Do not lecture about methodologies, pricing, or disclaimers here. Save that for skills that run after setup.
