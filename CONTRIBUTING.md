# Contributing to agentforge

Thanks for wanting to help. Small, focused changes are the easiest to review.

## Reporting a problem

Open an [issue](https://github.com/mrzroot/agentforge/issues/new/choose) and pick a template. Say what you did, what you
expected and what happened instead, plus your OS and browser/runtime version.

## Sending a change

1. Fork the repository and create a branch from the default branch.
2. Keep one change per pull request, and write commit titles that say *why* the change is needed.
3. Do not rewrite shared history; fix a mistake with a new commit.
4. Update the README and `CHANGELOG.md` (under **Unreleased**) when behaviour that users see changes.

## Check your change

```bash
npm ci && npm test
```

## Licence

By contributing you agree that your work is released under this repository's [LICENSE](LICENSE).
