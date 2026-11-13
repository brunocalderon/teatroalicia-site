# Agent instructions

Guidance for AI coding agents working in this repository.

## Git commits

When creating or managing git commits:

1. **Use the `/git-commit` skill** — read and follow `git-commit` (Conventional Commits workflow: analyze the diff, stage appropriately, generate the message, then commit).
2. **Always use Conventional Commits** — every commit message must match the format enforced by [Conventional Commits](https://www.conventionalcommits.org/) and this repo’s `@commitlint/config-conventional` setup (see `commitlint.config.js`).

Format:

```
<type>[optional scope]: <description>
```

Use standard types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`). Write the description in imperative mood, present tense, and keep the subject line under 72 characters.

Do not commit unless the user explicitly asks. Never commit secrets (`.env`, credentials, keys). Follow the Git Safety Protocol in project user rules: no `--no-verify`, no destructive git operations without explicit request, and do not amend unless those rules allow it.
