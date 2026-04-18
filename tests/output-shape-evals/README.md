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
