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
