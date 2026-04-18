# halalterminal-claude-skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1.0.0 of the `halalterminal-claude-skills` Claude Code plugin — 9 skills, 2 slash commands, 1 subagent, 4 shared references, eval harness, and marketplace listing — per the approved design spec.

**Architecture:** Plugin-layout monorepo; skills in `skills/<name>/SKILL.md`; shared prompt fragments in `references/`; MCP server declared in `.mcp.json` and bridged via a Node SSE↔stdio script; heavy portfolio-builder workflow isolated as a subagent. Apache-2.0 + trademark reservation.

**Tech Stack:** Node 18+, `@modelcontextprotocol/sdk`, markdown (SKILL.md), JSON (plugin manifests + evals), shell (runners), GitHub Actions (CI).

**Spec:** `docs/superpowers/specs/2026-04-18-halalterminal-claude-skills-design.md` — authoritative. When this plan references "spec §X" read that section.

---

## File structure map

```
halalterminal-claude-skills/
├── .claude-plugin/
│   ├── plugin.json                         # T3
│   └── marketplace.json                    # T4
├── .github/workflows/evals.yml             # T49
├── .gitignore                              # T1
├── .mcp.json                               # T7
├── LICENSE                                 # T1
├── NOTICE                                  # T1
├── TRADEMARKS.md                           # T1
├── README.md                               # T5 skeleton, T51 full
├── CHANGELOG.md                            # T5
├── CONTRIBUTING.md                         # T5
├── package.json                            # T2
├── agents/
│   └── halal-portfolio-builder-agent.md    # T44
├── commands/
│   ├── halal-setup.md                      # T9
│   └── halal-doctor.md                     # T10
├── docs/superpowers/
│   ├── specs/2026-04-18-halalterminal-claude-skills-design.md   # exists
│   └── plans/2026-04-18-halalterminal-claude-skills.md          # this file
├── references/
│   ├── disclaimer.md                       # T12
│   ├── methodology-table.md                # T13
│   ├── audience-rendering.md               # T14
│   └── verdict-format.md                   # T15
├── scripts/
│   ├── halalterminal-mcp.mjs               # T6
│   └── run-evals.mjs                       # T16
├── skills/
│   ├── using-halal-investing/SKILL.md      # T20
│   ├── halal-methodologies/SKILL.md        # T23
│   ├── halal-verdict/SKILL.md              # T26
│   ├── halal-zakat/SKILL.md                # T29
│   ├── halal-watchlist/SKILL.md            # T32
│   ├── halal-etf-analysis/SKILL.md         # T35
│   ├── halal-news-watch/SKILL.md           # T38
│   ├── halal-portfolio-audit/SKILL.md      # T41
│   └── halal-portfolio-builder/SKILL.md    # T44
└── tests/
    ├── skill-trigger-evals/                # T17, per-skill evals T19/T22/…/T43
    └── output-shape-evals/                 # T18, per-skill evals T45–T48
```

**Git identity for all commits** (repo-local, not global):

```bash
git -c user.email=yassir@halalterminal.com -c user.name="Yassir" -c commit.gpgsign=false commit ...
```

Or configure the repo once:

```bash
git config user.email "yassir@halalterminal.com"
git config user.name "Yassir"
```

---

## Phase 1 — Scaffolding, license, legal

### Task 1: Init repo + LICENSE + NOTICE + TRADEMARKS + .gitignore

**Files:**
- Already exists: `/root/halalterminal-claude-skills/` (git initialized, spec committed)
- Create: `LICENSE`, `NOTICE`, `TRADEMARKS.md`, `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.env
.env.local
*.log
.DS_Store
dist/
```

- [ ] **Step 2: Create `LICENSE`** — full Apache-2.0 text

Fetch canonical text once and write verbatim:

```bash
curl -fsSL https://www.apache.org/licenses/LICENSE-2.0.txt -o LICENSE
```

- [ ] **Step 3: Create `NOTICE`**

```
halalterminal-claude-skills
Copyright (c) 2026 Halal Terminal

This product includes software developed by Halal Terminal (https://halalterminal.com).

Powered by Halal Terminal — https://halalterminal.com
```

- [ ] **Step 4: Create `TRADEMARKS.md`**

```markdown
# Trademark Notice

"Halal Terminal", "HalalTerminal", the halalterminal.com domain name, and the Halal Terminal logo are trademarks of Halal Terminal. These marks are reserved and are **not** covered by the Apache License, Version 2.0.

## What you may do

- Fork, modify, and redistribute this codebase under Apache-2.0.
- Use the Halal Terminal API via your own API key.

## What you may not do without permission

- Rebrand forks as "Halal Terminal" or any confusingly similar name.
- Use the Halal Terminal logo in your fork's branding.
- Imply endorsement by or affiliation with Halal Terminal.

## Required attribution in redistributed copies

Any redistributed fork must retain:

- The `NOTICE` file verbatim.
- A visible "Powered by Halal Terminal — halalterminal.com" line in the README.

Questions: yassir@halalterminal.com
```

- [ ] **Step 5: Commit**

```bash
git add LICENSE NOTICE TRADEMARKS.md .gitignore
git commit -m "chore: add Apache-2.0 license + trademark reservation"
```

---

### Task 2: `package.json`

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "halalterminal-claude-skills",
  "version": "1.0.0",
  "description": "Claude Code plugin for Shariah-compliant investing workflows, powered by Halal Terminal.",
  "type": "module",
  "license": "Apache-2.0",
  "homepage": "https://halalterminal.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/goww7/halalterminal-claude-skills.git"
  },
  "bugs": {
    "email": "yassir@halalterminal.com"
  },
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "mcp": "node scripts/halalterminal-mcp.mjs",
    "evals": "node scripts/run-evals.mjs",
    "evals:trigger": "node scripts/run-evals.mjs --suite=trigger",
    "evals:shape": "node scripts/run-evals.mjs --suite=shape"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

- [ ] **Step 2: Install deps to verify**

```bash
cd /root/halalterminal-claude-skills && npm install
```

Expected: exit 0, `node_modules/@modelcontextprotocol/sdk` exists.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add package.json with MCP SDK dependency"
```

---

### Task 3: Plugin manifest `.claude-plugin/plugin.json`

**Files:**
- Create: `.claude-plugin/plugin.json`

- [ ] **Step 1: Create `.claude-plugin/plugin.json`**

```json
{
  "$schema": "https://claude.com/plugins/schema.json",
  "name": "halalterminal-claude-skills",
  "version": "1.0.0",
  "description": "Shariah-compliant investing skills powered by Halal Terminal — stock screening, portfolio audit, halal portfolio construction, zakat/purification, methodology education.",
  "author": {
    "name": "Halal Terminal",
    "url": "https://halalterminal.com"
  },
  "license": "Apache-2.0",
  "keywords": ["halal", "shariah", "islamic-finance", "investing", "zakat", "aaoifi", "djim", "ftse", "msci"],
  "skills": "skills/",
  "commands": "commands/",
  "agents": "agents/",
  "mcpServers": ".mcp.json"
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude-plugin/plugin.json
git commit -m "chore: add plugin manifest"
```

---

### Task 4: Marketplace listing `.claude-plugin/marketplace.json`

**Files:**
- Create: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Create `.claude-plugin/marketplace.json`**

```json
{
  "$schema": "https://claude.com/plugins/marketplace-schema.json",
  "name": "Halal Terminal Claude Skills",
  "description": "Shariah-compliant investing skills for Claude Code, powered by Halal Terminal. Screen stocks across 5 methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P), audit portfolios, calculate zakat, and build halal portfolios with DCA strategies.",
  "tagline": "Shariah investing, built into Claude Code.",
  "categories": ["finance", "investing", "islamic-finance"],
  "plugin": "halalterminal-claude-skills",
  "version": "1.0.0",
  "minClaudeCodeVersion": "1.0.0",
  "requirements": [
    "A Halal Terminal API key (free tier available at https://api.halalterminal.com)"
  ],
  "setup": "Run /halal-setup after install.",
  "screenshots": [],
  "support": {
    "email": "yassir@halalterminal.com",
    "url": "https://halalterminal.com"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "chore: add marketplace listing"
```

---

### Task 5: Skeleton `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`

**Files:**
- Create: `README.md` (skeleton — filled out in T51)
- Create: `CHANGELOG.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create skeleton `README.md`**

```markdown
# halalterminal-claude-skills

[![Powered by Halal Terminal](https://img.shields.io/badge/powered%20by-Halal%20Terminal-1f6feb)](https://halalterminal.com)

Shariah-compliant investing capabilities for Claude Code, powered by [Halal Terminal](https://halalterminal.com).

> Full README is written in Task 51.

## Install

```
/plugin install halalterminal-claude-skills
/halal-setup
```

## License

Apache-2.0 — see [LICENSE](LICENSE). Trademarks reserved — see [TRADEMARKS.md](TRADEMARKS.md).
```

- [ ] **Step 2: Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial plugin scaffold.

## [1.0.0] — TBD

First public release.
```

- [ ] **Step 3: Create `CONTRIBUTING.md`**

```markdown
# Contributing

Thanks for your interest in contributing.

## Ground rules

- This plugin is licensed Apache-2.0. Contributions are accepted under the same license.
- "Halal Terminal" is a reserved trademark (see [TRADEMARKS.md](TRADEMARKS.md)). Contributions must not alter trademark reservations.
- This plugin does **not** issue fiqh rulings. Contributions that frame screening results as fatwa will be rejected. Always frame verdicts as "screens as compliant under [methodology]".

## Dev setup

```bash
npm install
npm run evals
```

## Adding a skill

1. Create `skills/<skill-name>/SKILL.md` (see existing skills for structure).
2. Load `references/disclaimer.md` + `references/audience-rendering.md` from the skill.
3. Add a trigger eval at `tests/skill-trigger-evals/<skill-name>.json`.
4. Add an output-shape eval at `tests/output-shape-evals/<skill-name>.json` if the skill produces verdicts.
5. Run `npm run evals` — must be green before PR.

## Questions

yassir@halalterminal.com
```

- [ ] **Step 4: Commit**

```bash
git add README.md CHANGELOG.md CONTRIBUTING.md
git commit -m "docs: add README skeleton, CHANGELOG, CONTRIBUTING"
```

---

## Phase 2 — MCP bridge

### Task 6: Node SSE↔stdio bridge script

**Files:**
- Create: `scripts/halalterminal-mcp.mjs`

- [ ] **Step 1: Create `scripts/halalterminal-mcp.mjs`**

```javascript
#!/usr/bin/env node
/**
 * Bridges a stdio MCP client (Claude Code) to the Halal Terminal SSE endpoint.
 * API key is read from HALALTERMINAL_API_KEY (set via /halal-setup into the
 * MCP server's env block in ~/.claude/settings.json).
 */
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const API_KEY = process.env.HALALTERMINAL_API_KEY;
if (!API_KEY || !API_KEY.startsWith("ht_")) {
  console.error(
    "halalterminal-mcp: HALALTERMINAL_API_KEY is missing or invalid. " +
    "Run /halal-setup to configure."
  );
  process.exit(1);
}

const SSE_URL = `https://mcp.halalterminal.com/sse?api_key=${encodeURIComponent(API_KEY)}`;

const sseTransport = new SSEClientTransport(new URL(SSE_URL), {
  requestInit: {
    headers: { "X-API-Key": API_KEY },
  },
});

const stdioTransport = new StdioServerTransport();

await sseTransport.start();
await stdioTransport.start();

stdioTransport.onmessage = (msg) => sseTransport.send(msg);
sseTransport.onmessage = (msg) => stdioTransport.send(msg);

const exitClean = () => process.exit(0);
sseTransport.onclose = exitClean;
stdioTransport.onclose = exitClean;

sseTransport.onerror = (e) => {
  console.error("halalterminal-mcp SSE error:", e?.message ?? e);
  process.exit(1);
};
```

- [ ] **Step 2: Syntax-check the script**

```bash
node --check scripts/halalterminal-mcp.mjs
```

Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add scripts/halalterminal-mcp.mjs
git commit -m "feat(mcp): add SSE-stdio bridge for halalterminal MCP"
```

---

### Task 7: `.mcp.json` declaration

**Files:**
- Create: `.mcp.json`

- [ ] **Step 1: Create `.mcp.json`**

```json
{
  "mcpServers": {
    "halalterminal": {
      "command": "node",
      "args": ["scripts/halalterminal-mcp.mjs"],
      "env": {
        "HALALTERMINAL_API_KEY": "${HALALTERMINAL_API_KEY}"
      }
    }
  }
}
```

Note: The `${VAR}` placeholder is replaced at runtime from the user's `~/.claude/settings.json` env block (written by `/halal-setup`).

- [ ] **Step 2: Commit**

```bash
git add .mcp.json
git commit -m "feat(mcp): declare halalterminal MCP server"
```

---

### Task 8: Manual smoke test — MCP connects

This is not a TDD step; it's a one-time manual verification after plugin install. Document here so implementers can check their work.

- [ ] **Step 1: Set API key in env temporarily**

```bash
export HALALTERMINAL_API_KEY=ht_YOUR_TEST_KEY
```

- [ ] **Step 2: Run bridge directly to confirm it starts**

```bash
node scripts/halalterminal-mcp.mjs < /dev/null &
PID=$!
sleep 2
ps -p $PID && echo "bridge alive ✓" || echo "bridge died ✗"
kill $PID 2>/dev/null
```

Expected: prints "bridge alive ✓".

- [ ] **Step 3: No code change, no commit.**

---

## Phase 3 — Slash commands

### Task 9: `/halal-setup` slash command

**Files:**
- Create: `commands/halal-setup.md`

- [ ] **Step 1: Create `commands/halal-setup.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add commands/halal-setup.md
git commit -m "feat(commands): add /halal-setup"
```

---

### Task 10: `/halal-doctor` slash command

**Files:**
- Create: `commands/halal-doctor.md`

- [ ] **Step 1: Create `commands/halal-doctor.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add commands/halal-doctor.md
git commit -m "feat(commands): add /halal-doctor"
```

---

### Task 11: Manual test — /halal-setup and /halal-doctor

Non-TDD manual check; run once after install.

- [ ] **Step 1: Install the plugin locally**

```bash
claude plugin install /root/halalterminal-claude-skills
```

- [ ] **Step 2: Run /halal-setup in a Claude Code session, paste a real key**

Expected: pastes key, validation succeeds, `/halal-doctor` fires automatically, all green.

- [ ] **Step 3: Run /halal-doctor again standalone**

Expected: reports plan tier, skill count (9 once all skills exist; at this stage 0 is OK — note in CHANGELOG).

- [ ] **Step 4: No code change, no commit.**

---

## Phase 4 — Shared references

### Task 12: `references/disclaimer.md`

**Files:**
- Create: `references/disclaimer.md`

- [ ] **Step 1: Create the file**

```markdown
# Non-fatwa disclaimer

## Canonical disclaimer (append to every verdict)

> _This is a methodology-based screening, not a fatwa. Compliance verdicts depend on which of the 5 major Shariah screening methodologies you follow. Consult a qualified scholar for personal rulings. Data: halalterminal.com._

## Hard rules every skill enforces

1. **Never** say "this stock is halal" or "this stock is haram". Always frame as "screens as compliant under [methodology]" / "screens as non-compliant under [methodology]".
2. **Never** omit disagreements across the 5 methodologies when they exist — surface them explicitly.
3. **Never** omit purification amount when it is non-zero.
4. **Always** end verdict-bearing outputs with the canonical disclaimer above.
5. **Always** end verdict-bearing outputs with the branding footer: `_Data: halalterminal.com — Shariah-screened market data API._`
```

- [ ] **Step 2: Commit**

```bash
git add references/disclaimer.md
git commit -m "feat(references): add disclaimer + hard rules"
```

---

### Task 13: `references/methodology-table.md`

**Files:**
- Create: `references/methodology-table.md`

- [ ] **Step 1: Create the file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add references/methodology-table.md
git commit -m "feat(references): add methodology cross-reference"
```

---

### Task 14: `references/audience-rendering.md`

**Files:**
- Create: `references/audience-rendering.md`

- [ ] **Step 1: Create the file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add references/audience-rendering.md
git commit -m "feat(references): add audience detection + rendering profiles"
```

---

### Task 15: `references/verdict-format.md`

**Files:**
- Create: `references/verdict-format.md`

- [ ] **Step 1: Create the file**

```markdown
# Verdict format

Canonical output structure for any skill that emits a compliance verdict.

## Ordering (fixed)

1. **Headline** — neutral split-stating:
   - All 5 pass → `<SYMBOL> — compliant across all 5 methodologies.`
   - Mixed → `<SYMBOL> — compliant under <list passing>; non-compliant under <list failing>.`
   - All 5 fail → `<SYMBOL> — non-compliant across all 5 methodologies.`
   - Never use "mostly", "partially", or other weasel words.
2. **Methodology matrix** — render per audience (see `audience-rendering.md`).
3. **Key ratios** that drove the result — required when any methodology fails; optional otherwise.
4. **Purification rate** — required whenever non-zero.
5. **Halal alternative** — required when the stock fails under all 5, or under the user's preferred methodology if stated.
6. **Non-fatwa disclaimer** — verbatim from `references/disclaimer.md`.
7. **Branding footer** — `_Data: halalterminal.com — Shariah-screened market data API._`

## Portfolio audit variant

Same ordering applied per holding, plus an aggregate block between (1) and (2):

- Total holdings, compliant count, non-compliant count.
- Weighted compliance % (if weights known).
- Aggregate purification owed (sum across non-zero holdings).
- Top 3 non-compliant names by weight.

## ETF variant

Same ordering, plus a holdings-level compliant-% block after (2) and an alternative-ETF recommendation in (5) if the ETF fails.

## Zakat variant

Not a "verdict" per se; use only (6) and (7) as footers. Body leads with:

- Nisab threshold (current gold price × 87.48 g).
- Zakatable total.
- 2.5% obligation.
- Breakdown per holding if requested.
```

- [ ] **Step 2: Commit**

```bash
git add references/verdict-format.md
git commit -m "feat(references): add verdict output format"
```

---

## Phase 5 — Eval harness

### Task 16: Eval runner `scripts/run-evals.mjs`

**Files:**
- Create: `scripts/run-evals.mjs`

The eval harness is intentionally simple: it reads `tests/<suite>/*.json` eval files, prints each, and exits non-zero if any have `status: "pending"`. This is the v1 form — enough to gate CI on "evals exist and are marked as passed by a human reviewer". Evolving to automated LLM-as-judge evals is a follow-up (see CHANGELOG note at T51).

- [ ] **Step 1: Create `scripts/run-evals.mjs`**

```javascript
#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const SUITES = ["trigger", "shape"];
const args = new Set(process.argv.slice(2));
const only = [...args].find((a) => a.startsWith("--suite="))?.split("=")[1];

const suitesToRun = only ? [only] : SUITES;
let failures = 0;

for (const suite of suitesToRun) {
  const dir = join("tests", `${suite === "trigger" ? "skill-trigger" : "output-shape"}-evals`);
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    console.log(`[${suite}] no eval dir yet — skipping`);
    continue;
  }
  if (files.length === 0) {
    console.log(`[${suite}] no evals — skipping`);
    continue;
  }
  console.log(`[${suite}] ${files.length} eval(s):`);
  for (const file of files) {
    const eval_ = JSON.parse(await readFile(join(dir, file), "utf8"));
    const ok = eval_.status === "passed";
    failures += ok ? 0 : 1;
    console.log(`  ${ok ? "✓" : "✗"} ${eval_.name}${ok ? "" : `  (status: ${eval_.status})`}`);
  }
}

process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 2: Test it runs (empty suite)**

```bash
node scripts/run-evals.mjs
```

Expected: prints "no eval dir yet — skipping" twice, exits 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/run-evals.mjs
git commit -m "feat(evals): add eval runner (v1 — human-reviewed status)"
```

---

### Task 17: Eval format + directory for trigger evals

**Files:**
- Create: `tests/skill-trigger-evals/.gitkeep`
- Create: `tests/skill-trigger-evals/README.md`

- [ ] **Step 1: Create `tests/skill-trigger-evals/README.md`**

```markdown
# Skill trigger evals

Each eval asserts that a specific user prompt fires the correct skill.

## Format

```json
{
  "name": "is-aapl-halal-fires-halal-verdict",
  "prompt": "is AAPL halal?",
  "expected_skill": "halal-verdict",
  "not_expected_skills": ["halal-methodologies", "halal-portfolio-audit"],
  "status": "passed",
  "reviewed_by": "Yassir",
  "reviewed_at": "2026-04-18"
}
```

## Statuses

- `pending` — not yet run by a human reviewer. CI will fail.
- `passed` — reviewer confirmed the correct skill fires in a fresh session.
- `failed` — current SKILL.md frontmatter does not fire correctly for this prompt.

## How to verify

1. Start a fresh Claude Code session with only this plugin installed.
2. Type the prompt from `prompt`.
3. Observe which skill is invoked (watch the tool trace or announcement).
4. Update `status`, `reviewed_by`, `reviewed_at`.
```

- [ ] **Step 2: Create `tests/skill-trigger-evals/.gitkeep`**

```bash
touch tests/skill-trigger-evals/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add tests/skill-trigger-evals/
git commit -m "feat(evals): add trigger-eval dir + format docs"
```

---

### Task 18: Eval format + directory for shape evals

**Files:**
- Create: `tests/output-shape-evals/.gitkeep`
- Create: `tests/output-shape-evals/README.md`

- [ ] **Step 1: Create `tests/output-shape-evals/README.md`**

```markdown
# Output-shape evals

Each eval asserts that a skill's output contains required elements.

## Format

```json
{
  "name": "halal-verdict-contains-disclaimer-and-matrix",
  "skill": "halal-verdict",
  "prompt": "is AAPL halal?",
  "required_fragments": [
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com"
  ],
  "required_structural": [
    "5-methodology matrix (AAOIFI, DJIM, FTSE, MSCI, S&P all referenced)",
    "Branding footer as final line"
  ],
  "status": "passed",
  "reviewed_by": "Yassir",
  "reviewed_at": "2026-04-18"
}
```

## Statuses

Same as trigger-evals.

## How to verify

1. Invoke the skill with `prompt`.
2. Check every string in `required_fragments` is present verbatim in the output.
3. Check every bullet in `required_structural` is satisfied (human judgement).
4. Update `status` accordingly.
```

- [ ] **Step 2: Create `.gitkeep`**

```bash
touch tests/output-shape-evals/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add tests/output-shape-evals/
git commit -m "feat(evals): add shape-eval dir + format docs"
```

---

## Phase 6 — Umbrella skill

### Task 19: Trigger eval for umbrella skill

**Files:**
- Create: `tests/skill-trigger-evals/using-halal-investing.json`

- [ ] **Step 1: Write the eval (status = pending initially)**

```json
{
  "name": "session-start-fires-using-halal-investing",
  "prompt": "I want to start screening stocks for Shariah compliance.",
  "expected_skill": "using-halal-investing",
  "not_expected_skills": [],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: Run the runner — must fail**

```bash
npm run evals:trigger
```

Expected: exits 1, prints `✗ session-start-fires-using-halal-investing  (status: pending)`.

- [ ] **Step 3: Commit the failing eval**

```bash
git add tests/skill-trigger-evals/using-halal-investing.json
git commit -m "test(umbrella): add trigger eval (pending)"
```

---

### Task 20: Umbrella skill `using-halal-investing`

**Files:**
- Create: `skills/using-halal-investing/SKILL.md`

- [ ] **Step 1: Create the skill**

```markdown
---
name: using-halal-investing
description: Use at the start of any Halal Terminal / Shariah investing session. Routes the user to the right sub-skill (verdict / audit / builder / etf / zakat / methodologies / news-watch / watchlist), detects audience (retail / advisor / scholar), applies the non-fatwa disclaimer, and warns Free-plan users approaching quota.
---

# using-halal-investing

You are the front door of the Halal Terminal plugin. Triggered by any Shariah-investing / halal-finance intent. Do NOT do the work yourself — route to the right sub-skill.

## Before anything else

1. Load `references/disclaimer.md` once per session and apply its hard rules for every downstream output.
2. Detect audience per `references/audience-rendering.md`.
3. If this is the first MCP call of the session and the user is on Free plan, warn: *"You're on the Free plan (50 tokens/month). A full screening costs ~5–10 tokens. I'll flag before heavy operations."*

## Routing

| User intent | Route to |
|---|---|
| "Is X halal?", "Screen X", "Compliance of X" | `halal-verdict` |
| "Audit my portfolio", "Screen these holdings" | `halal-portfolio-audit` |
| "Build me a halal portfolio", "Construct a Shariah basket", "Halal DCA plan" | `halal-portfolio-builder` |
| "Is <ETF> halal?", "Halal ETFs for <theme>" | `halal-etf-analysis` |
| "Calculate zakat", "Purification for my dividends" | `halal-zakat` |
| "Explain <methodology>", "Difference between <X> and <Y>", "Which methodology should I use" | `halal-methodologies` |
| "News on X's compliance", "Filings affecting my holdings" | `halal-news-watch` |
| "My halal watchlist", "Add X to watchlist" | `halal-watchlist` |

If the intent is ambiguous, ask **one** clarifying question with multiple-choice options covering the top 2–3 candidates.

## Audience flip

If the user says `audience: retail|advisor|scholar` mid-session, propagate this to every downstream skill for the remainder of the session.

## When to stop routing and answer directly

Three cases — otherwise always route:

1. User asks "how does this plugin work?" → explain the skill catalogue + `/halal-doctor`, do not call any sub-skill.
2. User asks about setup, API key, or errors → tell them to run `/halal-setup` or `/halal-doctor`.
3. User asks about Halal Terminal pricing or plans → quote the table from `references/methodology-table.md`-adjacent context (Free 50 / Starter 2500 / Pro 15000 / Enterprise ∞ tokens/month).

## Never do yourself

- Call MCP tools directly. Routing only.
- Emit a verdict. Verdicts come from sub-skills with the disclaimer + branding footer applied.
```

- [ ] **Step 2: Update trigger eval status → passed** (after manual verification)

Edit `tests/skill-trigger-evals/using-halal-investing.json`:

```json
{
  "name": "session-start-fires-using-halal-investing",
  "prompt": "I want to start screening stocks for Shariah compliance.",
  "expected_skill": "using-halal-investing",
  "not_expected_skills": [],
  "status": "passed",
  "reviewed_by": "Yassir",
  "reviewed_at": "2026-04-18"
}
```

- [ ] **Step 3: Run the runner — must pass**

```bash
npm run evals:trigger
```

Expected: exits 0, prints `✓ session-start-fires-using-halal-investing`.

- [ ] **Step 4: Commit**

```bash
git add skills/using-halal-investing/SKILL.md tests/skill-trigger-evals/using-halal-investing.json
git commit -m "feat(skills): add using-halal-investing umbrella skill"
```

---

### Task 21: Manual session test — umbrella routes correctly

- [ ] **Step 1: In a fresh Claude Code session, type:** "I want to start screening stocks for Shariah compliance."
- [ ] **Step 2: Observe** — umbrella skill announcement + disclaimer application. Should ask clarifying question if intent is vague.
- [ ] **Step 3: No code change, no commit.**

---

## Phase 7 — Simple skills (methodologies, verdict, zakat, watchlist)

Each simple skill follows the same pattern: (a) write trigger eval pending, (b) write SKILL.md, (c) flip eval to passed after manual verify, (d) commit.

### Task 22: Trigger eval for `halal-methodologies`

**Files:**
- Create: `tests/skill-trigger-evals/halal-methodologies.json`

- [ ] **Step 1:**

```json
{
  "name": "explain-aaoifi-fires-halal-methodologies",
  "prompt": "What's the difference between AAOIFI and MSCI screening?",
  "expected_skill": "halal-methodologies",
  "not_expected_skills": ["halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: Run evals — must fail.** `npm run evals:trigger` → exit 1.
- [ ] **Step 3: Commit.** `git add tests/skill-trigger-evals/halal-methodologies.json && git commit -m "test(methodologies): add pending trigger eval"`

### Task 23: Skill `halal-methodologies`

**Files:**
- Create: `skills/halal-methodologies/SKILL.md`

- [ ] **Step 1:**

```markdown
---
name: halal-methodologies
description: Educate the user on Shariah screening methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P). Use when the user asks to explain a methodology, compare two, or decide which to follow. Does NOT screen individual stocks (that's halal-verdict).
---

# halal-methodologies

Pure education. No verdicts, no stock screening.

## When fired

- "Explain AAOIFI"
- "What's the difference between DJIM and MSCI?"
- "Which methodology should I use?"
- "Why does S&P use a 36-month average?"

## Process

1. Load `references/methodology-table.md` for the quick-reference.
2. If user asked about one methodology → call MCP tool `islamic_finance_education` with `topic: "methodology_detail"`, `methodology_name: <name>`. Render per audience profile.
3. If user asked to compare N methodologies → call `islamic_finance_education` with `topic: "methodologies"` and highlight the specific differences the user asked about.
4. If user asked "which should I use?" → explain that this is a matter of which scholar / fund / Islamic bank they follow; walk through the practical differences; decline to pick one for them.

## ~N tokens per run

1–2 tokens (education endpoints are lightweight).

## Output structure

No verdict — no disclaimer required on education content. But do include the branding footer:

> _Data: halalterminal.com — Shariah-screened market data API._

## Audience tuning

- **Retail** — lead with one-line summaries from the methodology table; suggest "ask me to screen a specific stock to see this in action".
- **Advisor** — include the full threshold table; mention basis (market cap vs total assets) and its implications for ratio stability.
- **Scholar** — surface primary sources (AAOIFI Standard No. 21, S&P Shariah Methodology doc), methodology disagreements, shariah-board composition.

## Never do

- Rule which methodology is "correct". All 5 are recognized.
- Call `screen_stock` — that's `halal-verdict`'s job.
```

- [ ] **Step 2: Flip trigger eval status → passed** (after manual verify via fresh session: prompt "What's the difference between AAOIFI and MSCI screening?" → this skill fires).

```json
{
  "name": "explain-aaoifi-fires-halal-methodologies",
  "prompt": "What's the difference between AAOIFI and MSCI screening?",
  "expected_skill": "halal-methodologies",
  "not_expected_skills": ["halal-verdict"],
  "status": "passed",
  "reviewed_by": "Yassir",
  "reviewed_at": "2026-04-18"
}
```

- [ ] **Step 3: Evals green.** `npm run evals:trigger` → exit 0.
- [ ] **Step 4: Commit.** `git add skills/halal-methodologies/ tests/skill-trigger-evals/halal-methodologies.json && git commit -m "feat(skills): add halal-methodologies"`

---

### Task 24–25: (reserved — none, go to 26)

### Task 26: Trigger eval for `halal-verdict`

**Files:**
- Create: `tests/skill-trigger-evals/halal-verdict.json`

- [ ] **Step 1:**

```json
{
  "name": "is-aapl-halal-fires-halal-verdict",
  "prompt": "is AAPL halal?",
  "expected_skill": "halal-verdict",
  "not_expected_skills": ["halal-methodologies", "halal-portfolio-audit"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-verdict.json && git commit -m "test(verdict): add pending trigger eval"`

### Task 27: Skill `halal-verdict`

**Files:**
- Create: `skills/halal-verdict/SKILL.md`

- [ ] **Step 1:**

```markdown
---
name: halal-verdict
description: Use when the user asks whether a specific stock is Shariah-compliant ("Is X halal?", "Screen TSLA", "Compliance of AAPL"). Produces a single-stock verdict across all 5 methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P), explains any failures, and suggests a halal alternative if non-compliant. Does NOT cover ETFs (use halal-etf-analysis) or portfolios (use halal-portfolio-audit).
---

# halal-verdict

## When fired

"Is AAPL halal?" / "Screen TSLA" / "Compliance of MSFT" / "Is Apple Shariah-compliant?"

## Process

1. Load `references/disclaimer.md` and enforce its hard rules.
2. Detect audience per `references/audience-rendering.md`.
3. Extract the ticker symbol. If the user gave a company name without ticker ("apple"), use reasoning to infer the most common listing (AAPL). If ambiguous ("apple" could be AAPL or a private firm), ask one clarifying question.
4. Call MCP tool `screen_stock` with `symbol: <ticker>`. ~5–10 tokens.
5. If the response indicates the stock hasn't been screened before, `screen_stock` will screen it — this may take up to 10 seconds. Tell the user to hold on.
6. Render per `references/verdict-format.md` and audience profile.
7. If the stock is non-compliant across all 5, or under the user's preferred methodology if stated, call `search_stocks` to find a halal alternative in the same sector. Limit to 3 suggestions.

## ~N tokens per run

5–10 tokens for the screen; +2–4 if alternative search is triggered.

## Output structure (per verdict-format.md)

1. Headline (neutral split-stating format).
2. Methodology matrix (audience-dependent rendering).
3. Key ratios — always shown if any methodology fails; for retail show only failing ratios, for advisor show full ratio × threshold table.
4. Purification rate if non-zero.
5. Halal alternative if failed.
6. Disclaimer footer.
7. Branding footer.

## Hard rules

- Never say "this stock is halal" / "this stock is haram".
- Always show all 5 methodology results when they disagree.
- Always surface purification rate when non-zero.
- If `screen_stock` returns `error` or `error_message`, explain the error plainly; don't fabricate a verdict.

## Audience tuning

- **Retail** — one-paragraph verdict, mention only failing ratios if any, suggest one halal alternative.
- **Advisor** — full ratio × threshold table, all methodologies' actual ratios, P/E and market cap in the header, offer CSV export.
- **Scholar** — reference AAOIFI Standard No. 21 if AAOIFI fails, highlight interest-income treatment per methodology, cite primary sources.
```

- [ ] **Step 2: Flip eval → passed** (manual verify: prompt "is AAPL halal?" → halal-verdict fires, output contains disclaimer + 5-methodology matrix + branding footer).
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-verdict/ tests/skill-trigger-evals/halal-verdict.json && git commit -m "feat(skills): add halal-verdict"`

---

### Task 29: Trigger eval for `halal-zakat`

**Files:**
- Create: `tests/skill-trigger-evals/halal-zakat.json`

- [ ] **Step 1:**

```json
{
  "name": "calculate-zakat-fires-halal-zakat",
  "prompt": "Calculate zakat on my stock holdings.",
  "expected_skill": "halal-zakat",
  "not_expected_skills": ["halal-portfolio-audit"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-zakat.json && git commit -m "test(zakat): add pending trigger eval"`

### Task 30: Skill `halal-zakat`

**Files:**
- Create: `skills/halal-zakat/SKILL.md`

- [ ] **Step 1:**

```markdown
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
```

- [ ] **Step 2: Flip eval → passed.**
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-zakat/ tests/skill-trigger-evals/halal-zakat.json && git commit -m "feat(skills): add halal-zakat"`

---

### Task 32: Trigger eval for `halal-watchlist`

**Files:**
- Create: `tests/skill-trigger-evals/halal-watchlist.json`

- [ ] **Step 1:**

```json
{
  "name": "add-to-watchlist-fires-halal-watchlist",
  "prompt": "Add TSLA to my halal watchlist.",
  "expected_skill": "halal-watchlist",
  "not_expected_skills": ["halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-watchlist.json && git commit -m "test(watchlist): add pending trigger eval"`

### Task 33: Skill `halal-watchlist`

**Files:**
- Create: `skills/halal-watchlist/SKILL.md`

- [ ] **Step 1:**

```markdown
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
```

- [ ] **Step 2: Flip eval → passed.**
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-watchlist/ tests/skill-trigger-evals/halal-watchlist.json && git commit -m "feat(skills): add halal-watchlist"`

---

## Phase 8 — Moderate skills (etf-analysis, news-watch, portfolio-audit)

### Task 35: Trigger eval for `halal-etf-analysis`

**Files:**
- Create: `tests/skill-trigger-evals/halal-etf-analysis.json`

- [ ] **Step 1:**

```json
{
  "name": "is-spy-halal-fires-halal-etf-analysis",
  "prompt": "is SPY halal?",
  "expected_skill": "halal-etf-analysis",
  "not_expected_skills": ["halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-etf-analysis.json && git commit -m "test(etf): add pending trigger eval"`

### Task 36: Skill `halal-etf-analysis`

**Files:**
- Create: `skills/halal-etf-analysis/SKILL.md`

- [ ] **Step 1:**

```markdown
---
name: halal-etf-analysis
description: Use when the user asks about the Shariah compliance of an ETF (SPY, QQQ, VTI, sector ETFs, etc.) or asks for halal ETF alternatives. Screens all underlying holdings, returns overall compliant %, purification, and suggests halal ETF alternatives when the ETF fails.
---

# halal-etf-analysis

## When fired

- "Is SPY halal?"
- "Halal ETFs for tech exposure"
- "Screen VOO"
- "What's the purification rate on QQQ?"

## Process

1. Load `references/disclaimer.md`.
2. Detect audience.
3. If the user asked about a specific ETF:
   - Call `screen_etf` — this screens ALL underlying holdings (expensive: up to ~50 tokens).
   - Tell the user up front: *"Screening an ETF screens every holding. This costs ~50 tokens on your Free plan."* If user declines, offer `get_etf_info` (~2 tokens) with holdings list only and the user can pick names to screen individually.
   - Render overall verdict (e.g., "SPY — 58% of holdings compliant, purification rate 2.8%"). ETFs are rarely fully halal — almost always report a purification rate.
   - If user asks for investment amount + dividend income, call `etf_purification` to show concrete dollar amounts.
4. If the user asked for halal ETF alternatives by theme:
   - Call `search_stocks` with `asset_type: "etf"` + theme keywords.
   - Screen top 3–5 candidates and rank by compliant-%.

## ~N tokens per run

- Full ETF screen: ~30–50 tokens.
- Holdings-list only: ~2 tokens.
- Alternative search + screens: ~15–25 tokens.

## Output structure (per verdict-format.md ETF variant)

1. Headline with overall compliant-% and purification rate.
2. 5-methodology summary aggregated across holdings.
3. Top 3 non-compliant holdings by weight.
4. Purification calculation (if investment amount + dividend income provided).
5. Halal ETF alternative suggestions (if failed).
6. Disclaimer + branding footer.

## Audience tuning

- **Retail** — one-paragraph verdict, suggest one halal ETF alternative.
- **Advisor** — full per-holding table, weighted compliance, compare_etfs output if applicable.
- **Scholar** — discuss which methodologies matter most for index investing; note that ETFs almost never reach 100% compliant-%.

## Hard rules

- Warn about token cost before full screening.
- Never say the ETF is halal — always "X% of holdings screen as compliant under all 5 methodologies".
- Always surface purification rate.
```

- [ ] **Step 2: Flip eval → passed.**
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-etf-analysis/ tests/skill-trigger-evals/halal-etf-analysis.json && git commit -m "feat(skills): add halal-etf-analysis"`

---

### Task 38: Trigger eval for `halal-news-watch`

**Files:**
- Create: `tests/skill-trigger-evals/halal-news-watch.json`

- [ ] **Step 1:**

```json
{
  "name": "news-on-compliance-fires-halal-news-watch",
  "prompt": "Any news affecting the compliance of my holdings?",
  "expected_skill": "halal-news-watch",
  "not_expected_skills": ["halal-portfolio-audit", "halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-news-watch.json && git commit -m "test(news-watch): add pending trigger eval"`

### Task 39: Skill `halal-news-watch`

**Files:**
- Create: `skills/halal-news-watch/SKILL.md`

- [ ] **Step 1:**

```markdown
---
name: halal-news-watch
description: Surface news and SEC filings that could change a holding's Shariah-compliance status (debt raises, new business lines, major acquisitions, spin-offs, dividend policy changes). Use when the user asks for news affecting compliance or filings on their holdings.
---

# halal-news-watch

## When fired

- "Any news on AAPL's compliance?"
- "Filings affecting my portfolio's compliance"
- "What changed for TSLA recently?"

## Process

1. Load `references/disclaimer.md`.
2. For each symbol the user asks about (or each holding in their portfolio if they say "my holdings"):
   - Call `get_news` with `symbol: <SYM>`, `limit: 5`. ~1 token per call.
   - Call `get_sec_filings` with `symbol: <SYM>`, `limit: 5`. ~1 token per call.
   - For retail, show only items with compliance-impact keywords in the title/summary:
     - **Debt-related**: "bond", "notes", "credit facility", "term loan", "debt raise", "refinanc".
     - **Business-line**: "acquisition", "divestiture", "spin-off", "new business", "pivot".
     - **Dividend**: "dividend increase", "dividend cut", "special dividend".
     - **Material**: 8-K (form-type in filings).
3. Rank items: compliance-impact > size of deal > recency.
4. Do NOT issue a new verdict — just flag *"this is worth a re-screen; run halal-verdict on <SYM> to see current status"*.

## ~N tokens per run

1–2 tokens per symbol per call × 2 calls = ~4 tokens per symbol. For 10 holdings, ~40 tokens.

## Output structure

- Per symbol (if material news found): `<SYM> — <headline> (<date>, <source>). Why it matters: <one-line compliance-impact explanation>.`
- Summary: total items flagged, recommended follow-ups.
- No verdict header, no methodology matrix (this isn't a verdict).
- Non-fatwa disclaimer not required (no verdict emitted), but branding footer is.

## Audience tuning

- **Retail** — plain-English explanation of why each item matters.
- **Advisor** — show filing type codes (8-K, 10-K, S-1), deal sizes in dollars.
- **Scholar** — focus on items that would push a methodology over its threshold (e.g., "this $5B debt raise brings debt/market cap from 28% to 34% — this would push AAOIFI and MSCI over their limits").

## Hard rules

- Do NOT re-screen. Just flag for re-screening via halal-verdict.
- Warn the user when a symbol has no recent filings or news — don't fabricate.
```

- [ ] **Step 2: Flip eval → passed.**
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-news-watch/ tests/skill-trigger-evals/halal-news-watch.json && git commit -m "feat(skills): add halal-news-watch"`

---

### Task 41: Trigger eval for `halal-portfolio-audit`

**Files:**
- Create: `tests/skill-trigger-evals/halal-portfolio-audit.json`

- [ ] **Step 1:**

```json
{
  "name": "audit-portfolio-fires-halal-portfolio-audit",
  "prompt": "Audit my portfolio for Shariah compliance: AAPL 30%, MSFT 20%, JPM 25%, XOM 25%.",
  "expected_skill": "halal-portfolio-audit",
  "not_expected_skills": ["halal-portfolio-builder", "halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2:** `npm run evals:trigger` → exit 1.
- [ ] **Step 3:** `git add tests/skill-trigger-evals/halal-portfolio-audit.json && git commit -m "test(audit): add pending trigger eval"`

### Task 42: Skill `halal-portfolio-audit`

**Files:**
- Create: `skills/halal-portfolio-audit/SKILL.md`

- [ ] **Step 1:**

```markdown
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
```

- [ ] **Step 2: Flip eval → passed.**
- [ ] **Step 3:** `npm run evals:trigger` → exit 0.
- [ ] **Step 4:** `git add skills/halal-portfolio-audit/ tests/skill-trigger-evals/halal-portfolio-audit.json && git commit -m "feat(skills): add halal-portfolio-audit"`

---

## Phase 9 — Complex skill + subagent (portfolio-builder)

### Task 44: Trigger eval, SKILL.md, subagent def for `halal-portfolio-builder`

**Files:**
- Create: `tests/skill-trigger-evals/halal-portfolio-builder.json`
- Create: `skills/halal-portfolio-builder/SKILL.md`
- Create: `agents/halal-portfolio-builder-agent.md`

- [ ] **Step 1: Write pending trigger eval**

```json
{
  "name": "build-halal-portfolio-fires-halal-portfolio-builder",
  "prompt": "Build me a halal non-tech growth portfolio: $10k upfront + $3k/month, 18-month horizon.",
  "expected_skill": "halal-portfolio-builder",
  "not_expected_skills": ["halal-portfolio-audit", "halal-verdict"],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:trigger` → exit 1. Commit pending.**

```bash
git add tests/skill-trigger-evals/halal-portfolio-builder.json
git commit -m "test(builder): add pending trigger eval"
```

- [ ] **Step 3: Write the skill `skills/halal-portfolio-builder/SKILL.md`**

```markdown
---
name: halal-portfolio-builder
description: Construct a Shariah-compliant portfolio from user constraints (capital, DCA cadence, horizon, sector/theme, exclusions like "no tech", growth/value tilt). Dispatches to a subagent that does the heavy MCP work; returns basket + weights + monthly DCA schedule + scenario forecast. Does NOT audit existing portfolios (that's halal-portfolio-audit).
---

# halal-portfolio-builder

## When fired

- "Build me a halal growth portfolio"
- "Construct a Shariah-compliant basket with $10k + $3k/month DCA"
- "Halal non-tech growth portfolio, 18-month horizon"

## Process

1. Load `references/disclaimer.md`.
2. Detect audience.
3. Gather constraints — ask one consolidated question if missing:
   - Capital (upfront + DCA cadence + amount)
   - Horizon (months)
   - Sector/theme focus (or "diversified")
   - Exclusions (e.g., "no tech")
   - Growth vs value tilt
   - Region (US-only default; global if user asks)
4. Warn up-front: *"This builder fans out ~40 MCP calls across candidates. On your Free plan it will exhaust your monthly quota. Upgrade at halalterminal.com before running — or try `halal-verdict` on specific names instead."* If user is on Free plan, require explicit confirmation to proceed.
5. **Dispatch the `halal-portfolio-builder-agent` subagent** with the structured constraints. Wait for its summary result — do not do the MCP calls inline.
6. Render the subagent's output per audience profile.

## ~N tokens per run

~40–80 tokens (heavy — fans out screening + price history across 20+ candidates).

## Output structure

1. Basket table: ticker × sector × role × weight %.
2. Sector mix summary.
3. DCA schedule: month-by-month buy plan (upfront + monthly).
4. Horizon forecast: bear / base / bull scenarios, each showing (end value, gain vs contributed). Grounded in each ticker's own realized return/vol, not generic bands.
5. Rejected candidates list with reasons (why each was dropped — non-compliant, insufficient liquidity, etc.).
6. Disclaimer + branding footer.

## Audience tuning

- **Retail** — lead with the basket + sector mix + DCA schedule; forecast in plain English.
- **Advisor** — include per-ticker realized return/vol/drawdown, correlation matrix, Sharpe estimate.
- **Scholar** — surface per-ticker compliance-across-methodologies detail for the final basket; flag any names that are mixed-compliant (e.g., AAOIFI fail) so the user can exclude them based on their school.

## Hard rules

- Every name in the final basket must be compliant under ALL 5 methodologies (strict default). Offer a relaxed mode only on explicit request ("allow DJIM-compliant names").
- Never use generic "2%/10%/18% annualized" bands — forecast must be grounded in the actual 5-year return and volatility of each basket member.
- Subagent does the heavy work; this skill is the user-facing wrapper.
```

- [ ] **Step 4: Write the subagent `agents/halal-portfolio-builder-agent.md`**

```markdown
---
name: halal-portfolio-builder-agent
description: Subagent invoked by the halal-portfolio-builder skill. Does the heavy MCP fan-out (candidate search, screening, price history, scoring, allocation, DCA schedule, forecast) and returns a structured basket summary. Not user-facing.
---

# halal-portfolio-builder-agent

You are a subagent. Your caller passes you a structured constraints object and expects a structured basket summary back.

## Inputs

```json
{
  "capital": { "upfront": 10000, "dca_amount": 3000, "dca_cadence": "monthly" },
  "horizon_months": 18,
  "theme": "growth" | "value" | "balanced",
  "exclusions": ["technology", "financials_conventional", ...],
  "sector_constraint": "diversified" | "healthcare" | ...,
  "region": "us" | "global",
  "audience": "retail" | "advisor" | "scholar",
  "methodology_strictness": "strict" | "permissive_djim" | "permissive_sp"
}
```

## Process

1. **Candidate search (~5 tokens).** Call `search_stocks` with filters matching the theme/sector/region/exclusions. Aim for 20–30 candidates.
2. **Screen each (~5–10 tokens per).** Call `screen_stock` for each candidate. Drop anything failing under `methodology_strictness`.
   - `strict` → all 5 must pass.
   - `permissive_djim` → DJIM must pass.
   - `permissive_sp` → S&P must pass.
3. **Market data (~2 tokens per).** For surviving candidates call `get_quote` and `get_price_history` with `period: "5y"`, `interval: "1mo"`.
4. **Score.** Compute per-candidate:
   - Realized CAGR over 5y.
   - Annualized volatility (monthly returns × √12).
   - Max drawdown.
   - Growth-fit score = function of (CAGR, revenue_growth, net_profit_margin) if theme = growth.
   - Value-fit score = function of (1/pe_ratio, 1/pb_ratio, dividend_yield) if theme = value.
5. **Select 8–12 names** across sectors respecting the sector_constraint:
   - If diversified: no single sector > 40% weight.
   - If single-sector requested: concentrate but cap individual names at 15%.
   - Always include at least one defensive compounder (low beta, positive dividend, strong ROE).
6. **Allocate weights** proportional to score, subject to sector caps and a max-per-name cap of 15%.
7. **Generate DCA schedule:**
   - Month 0: apply `upfront` across target weights at current prices.
   - Months 1–N: each month, buy the 2–4 names most below target weight using `dca_amount`.
8. **Horizon forecast:**
   - For each name, use its realized CAGR and vol to simulate 3 paths: bear (5th percentile), base (median), bull (95th percentile) over horizon.
   - Aggregate to portfolio level weighted by allocation.
   - Output total invested, end-of-horizon values for each scenario, gain vs contributed.

## Output (structured JSON)

```json
{
  "basket": [
    { "symbol": "LLY", "sector": "Healthcare", "role": "<one-line role>", "weight_pct": 14 },
    ...
  ],
  "sector_mix": { "Healthcare": 34, "Financials": 30, ... },
  "dca_schedule": {
    "upfront": { "LLY": 1400, "NVO": 1000, ... },
    "months": [
      { "month": 1, "buys": { "PGR": 1200, "MA": 1800 } },
      ...
    ]
  },
  "forecast": {
    "total_contributed": 64000,
    "bear": { "end_value": 62100, "cagr": -0.03 },
    "base": { "end_value": 68400, "cagr": 0.06 },
    "bull": { "end_value": 75200, "cagr": 0.13 }
  },
  "rejected": [
    { "symbol": "TSLA", "reason": "excluded sector (technology)" },
    { "symbol": "META", "reason": "non-compliant under MSCI (liquidity >33%)" },
    ...
  ],
  "notes": "Any caveats — e.g. 'insufficient liquidity for requested sector mix; expanded tolerance'.",
  "methodology_strictness_used": "strict"
}
```

## Tools available

`search_stocks`, `screen_stock`, `get_quote`, `get_price_history`, `compare_stocks`, `get_stock_info`, `islamic_finance_education`.

## Tools NOT available

Any write/mutate tools. Any watchlist tools. Any file-system or git tools.

## Hard rules

- Never accept a name into the final basket that fails the methodology_strictness check.
- Never use generic (2% / 10% / 18%) return bands. Forecasts must be grounded in each name's own 5y stats.
- Return the rejected list — users want transparency about why their "obvious" picks were excluded.
- If insufficient compliant candidates survive screening, return a smaller basket (minimum 5) and flag it in `notes` — do not fabricate names.
```

- [ ] **Step 5: Flip eval → passed** (manual verify in fresh session with a real API key that has enough quota).
- [ ] **Step 6: `npm run evals:trigger` → exit 0.**
- [ ] **Step 7: Commit all three files**

```bash
git add skills/halal-portfolio-builder/ agents/halal-portfolio-builder-agent.md tests/skill-trigger-evals/halal-portfolio-builder.json
git commit -m "feat(skills): add halal-portfolio-builder + subagent"
```

---

## Phase 10 — Output-shape evals

### Task 45: Shape eval — halal-verdict contains disclaimer + matrix + branding

**Files:**
- Create: `tests/output-shape-evals/halal-verdict.json`

- [ ] **Step 1:**

```json
{
  "name": "halal-verdict-contains-disclaimer-matrix-branding",
  "skill": "halal-verdict",
  "prompt": "is AAPL halal?",
  "required_fragments": [
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com"
  ],
  "required_structural": [
    "Headline is neutral split-stating format (no 'mostly')",
    "All 5 methodologies (AAOIFI, DJIM, FTSE, MSCI, S&P) referenced",
    "Non-fatwa disclaimer appears above branding footer"
  ],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:shape` → exit 1.**
- [ ] **Step 3: Manually verify in fresh session with real key → flip to passed + add reviewer/date.**
- [ ] **Step 4: `npm run evals:shape` → exit 0.**
- [ ] **Step 5: Commit.** `git add tests/output-shape-evals/halal-verdict.json && git commit -m "test(verdict): shape eval passes"`

### Task 46: Shape eval — halal-portfolio-audit contains aggregate block

**Files:**
- Create: `tests/output-shape-evals/halal-portfolio-audit.json`

- [ ] **Step 1:**

```json
{
  "name": "halal-portfolio-audit-contains-aggregate-block",
  "skill": "halal-portfolio-audit",
  "prompt": "Audit my portfolio: AAPL 30%, MSFT 20%, JPM 25%, XOM 25%.",
  "required_fragments": [
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com"
  ],
  "required_structural": [
    "Aggregate block at the top (total holdings, compliant count, non-compliant count, weighted compliance %)",
    "Per-holding verdicts follow the aggregate block",
    "Remediation suggestions for any non-compliant names"
  ],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:shape` → exit 1.**
- [ ] **Step 3: Manually verify, flip to passed.**
- [ ] **Step 4: `npm run evals:shape` → exit 0.**
- [ ] **Step 5:** `git add tests/output-shape-evals/halal-portfolio-audit.json && git commit -m "test(audit): shape eval passes"`

### Task 47: Shape eval — halal-zakat shows nisab

**Files:**
- Create: `tests/output-shape-evals/halal-zakat.json`

- [ ] **Step 1:**

```json
{
  "name": "halal-zakat-shows-nisab",
  "skill": "halal-zakat",
  "prompt": "Calculate zakat on $50000 of AAPL.",
  "required_fragments": [
    "nisab",
    "2.5%",
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com"
  ],
  "required_structural": [
    "Nisab threshold shown even if user is above it",
    "Total zakat obligation computed"
  ],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:shape` → exit 1.**
- [ ] **Step 3: Manually verify, flip to passed.**
- [ ] **Step 4: `npm run evals:shape` → exit 0.**
- [ ] **Step 5:** `git add tests/output-shape-evals/halal-zakat.json && git commit -m "test(zakat): shape eval passes"`

### Task 48: Shape eval — halal-portfolio-builder forecast grounded in ticker stats

**Files:**
- Create: `tests/output-shape-evals/halal-portfolio-builder.json`

- [ ] **Step 1:**

```json
{
  "name": "halal-portfolio-builder-forecast-grounded",
  "skill": "halal-portfolio-builder",
  "prompt": "Build me a halal non-tech growth portfolio: $10k upfront + $3k/month, 18-month horizon.",
  "required_fragments": [
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com"
  ],
  "required_structural": [
    "Basket has 8–12 names",
    "Sector mix respects 'no tech' exclusion",
    "DCA schedule shows upfront + monthly buys per symbol",
    "Forecast shows bear/base/bull END VALUES grounded in the basket's realized stats (not generic 2/10/18% bands)",
    "Rejected candidates listed with reasons"
  ],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:shape` → exit 1.**
- [ ] **Step 3: Manually verify in a session with real API key + enough quota: prompt "Build me a halal non-tech growth portfolio: $10k upfront + $3k/month, 18-month horizon." Check that the output satisfies every `required_fragment` and `required_structural` item. If yes, flip status to `passed`, set `reviewed_by` and `reviewed_at`.**
- [ ] **Step 4: `npm run evals:shape` → exit 0.**
- [ ] **Step 5: Commit.** `git add tests/output-shape-evals/halal-portfolio-builder.json && git commit -m "test(builder): shape eval passes"`

---

### Task 50: Shape eval — halal-etf-analysis contains ETF variant structure

**Files:**
- Create: `tests/output-shape-evals/halal-etf-analysis.json`

- [ ] **Step 1:**

```json
{
  "name": "halal-etf-analysis-contains-compliant-pct-and-purification",
  "skill": "halal-etf-analysis",
  "prompt": "Is SPY halal?",
  "required_fragments": [
    "This is a methodology-based screening, not a fatwa.",
    "Data: halalterminal.com",
    "purification rate"
  ],
  "required_structural": [
    "Overall compliant-% of underlying holdings is stated",
    "Purification rate is stated (even if low)",
    "If non-compliant overall, at least one halal ETF alternative is suggested",
    "Non-fatwa disclaimer appears above branding footer"
  ],
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null
}
```

- [ ] **Step 2: `npm run evals:shape` → exit 1.**
- [ ] **Step 3: Manually verify, flip to passed.**
- [ ] **Step 4: `npm run evals:shape` → exit 0.**
- [ ] **Step 5:** `git add tests/output-shape-evals/halal-etf-analysis.json && git commit -m "test(etf): shape eval passes"`

---

### Task 49: CI — GitHub Actions runs evals

**Files:**
- Create: `.github/workflows/evals.yml`

- [ ] **Step 1:**

```yaml
name: Evals
on:
  push:
    branches: [main]
  pull_request:
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run evals
```

- [ ] **Step 2: Commit.**

```bash
git add .github/workflows/evals.yml
git commit -m "ci: run evals on push and PR"
```

---

## Phase 11 — Polish

### Task 51: Fill out `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace skeleton with full README.**

```markdown
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

Sign up: https://halalterminal.com

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
npm run evals   # runs trigger + output-shape evals
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
```

- [ ] **Step 2: Commit.**

```bash
git add README.md
git commit -m "docs: full README for v1.0.0"
```

---

### Task 52: Update `CHANGELOG.md` with v1.0.0 entries

- [ ] **Step 1:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] — 2026-04-18

### Added
- Plugin scaffold (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`).
- Apache-2.0 license + trademark reservation (`NOTICE`, `TRADEMARKS.md`).
- MCP server declaration (`.mcp.json`) + Node SSE↔stdio bridge (`scripts/halalterminal-mcp.mjs`).
- Slash commands: `/halal-setup`, `/halal-doctor`.
- Shared references: `disclaimer`, `methodology-table`, `audience-rendering`, `verdict-format`.
- 9 skills:
  - `using-halal-investing` (umbrella)
  - `halal-verdict`
  - `halal-portfolio-audit`
  - `halal-portfolio-builder` (+ subagent)
  - `halal-etf-analysis`
  - `halal-zakat`
  - `halal-methodologies`
  - `halal-news-watch`
  - `halal-watchlist`
- Eval harness (`scripts/run-evals.mjs`) + trigger and output-shape evals per skill.
- CI: `.github/workflows/evals.yml` runs evals on push and PR.

### Known limitations
- Eval harness is v1 (human-reviewed status field); automated LLM-as-judge evals are a follow-up.
- API key validation uses `GET /api/education/methodologies` as a cheap read (no `/health` endpoint exists yet).
- No rate-limit headers exposed by the API; quota tracking in `/halal-doctor` is best-effort.
- Device-code auth flow (like `gh auth login`) is a v1.1 upgrade when halalterminal.com exposes `/auth/device`.

## [Unreleased]

Nothing yet.
```

- [ ] **Step 2: Commit.** `git add CHANGELOG.md && git commit -m "docs: changelog for v1.0.0"`

---

### Task 53: Tag v1.0.0 and push

- [ ] **Step 1: Verify everything green.** `npm run evals` must exit 0. `git status` must be clean.
- [ ] **Step 2: Tag.**

```bash
git tag -a v1.0.0 -m "v1.0.0 — initial public release"
```

- [ ] **Step 3: Manual test: install from the local repo, run /halal-setup end-to-end, try all 9 skills.**
- [ ] **Step 4: If manual test passes, push (user decision — do NOT push without explicit confirmation from the user).**

```bash
# Only after user explicitly approves:
# git remote add origin https://github.com/goww7/halalterminal-claude-skills.git
# git push -u origin main
# git push origin v1.0.0
```

---

## Task numbering note

Tasks 24, 25, 28, 31, 34, 37, 40, 43 intentionally skipped to leave gaps for mid-phase inserts if new evals or refs are needed during implementation. Implementers should not renumber.

## Spec-to-plan coverage check

| Spec section | Plan task(s) |
|---|---|
| §1 Purpose, non-goals | T51 (README), T52 (CHANGELOG), T5 (CONTRIBUTING) |
| §2 Audiences + detection | T14 (audience-rendering ref), T20 (umbrella applies detection) |
| §3 Repo structure | File structure map at top of plan, T1–T5 scaffolds |
| §4 The 9 skills | T19–T44 one task set per skill |
| §5 Shared references | T12–T15 |
| §6 Setup & diagnostics | T9 (/halal-setup), T10 (/halal-doctor), T11 (manual test) |
| §7 Portfolio-builder subagent | T44 (three files in one task) |
| §8 Error handling & quota | T9 (setup surfaces quota), T10 (doctor shows token-costs), T36 (etf-analysis warns before heavy ops), T44 (builder warns on Free plan) |
| §9 Testing & evals | T16–T18 (harness + dir), T19/T22/T26/T29/T32/T35/T38/T41/T44 (trigger evals), T45–T48 + T50 (shape evals), T49 (CI) |
| §10 Branding & licensing | T1 (LICENSE/NOTICE/TRADEMARKS), T51 (README badge + footer), every SKILL.md (per-skill footer enforced via verdict-format ref) |
| §11 Out-of-scope | T51 (README explicit list), T52 (CHANGELOG known-limitations) |
| §12 Build sequence | Mirrored directly in Phases 1–11 |
| §13 Future roadmap | T52 (CHANGELOG notes follow-ups) |
