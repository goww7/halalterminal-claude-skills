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
