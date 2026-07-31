# Commit guide

StockFlow is a portfolio project. Commit history should help mentors and recruiters understand *what* changed and *why*.

## Message format

```text
type: short summary in imperative mood

Optional body with bullets when the change needs context:
- what changed
- why it mattered
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `style` | Visual / CSS / layout polish (not Prettier-only noise) |
| `refactor` | Internal cleanup without changing behavior |
| `docs` | README, CHANGELOG, guides |
| `chore` | Tooling, version bumps, config |

### Examples

```text
feat: add per-section search and pagination

- keep filters independent per urgency section
- default page size to 10 for large dairy files
```

```text
docs: add building journey README and v0.1.0 changelog
```

## Rules of thumb

- One logical change per commit when practical  
- Prefer specific verbs: `add`, `fix`, `rename`, `remove`  
- Avoid: `updates`, `stuff`, `wip`, `fix again`  
- Do not rewrite history on `main` for storytelling—use README and CHANGELOG  

## Weekly rhythm

1. Open a PR with clear commits  
2. Merge to `main`  
3. Update `CHANGELOG.md` + `package.json` version  
4. Tag `vX.Y.Z` and push the tag  
5. Confirm the Netlify deploy for `main`  
