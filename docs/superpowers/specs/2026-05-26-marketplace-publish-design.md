# Design: Publish `@codeskine/gitlab-workflow` to npm

**Date:** 2026-05-26
**Status:** Approved

## Goal

Publish the `gitlab-workflow` plugin to the npm registry under the `@codeskine` org scope so
users can install it via `claude plugins install @codeskine/gitlab-workflow`. Automate future
releases with a tag-triggered GitHub Actions workflow.

## Changes

### 1. `package.json` — rename package

Change `"name"` from `"gitlab-workflow"` to `"@codeskine/gitlab-workflow"`.

The bare name `gitlab-workflow` is already taken on npm by an unrelated VS Code extension.
No other fields change: `version` stays `"1.0.0"`, `files` array is already correct,
`prepack` validation script stays as-is.

### 2. `.github/workflows/publish.yml` — tag-triggered CI publish

New file. Triggers on `push` to tags matching `v*.*.*`.

```yaml
on:
  push:
    tags: ['v*.*.*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm publish --access=public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

No `npm ci` step needed — the package has no dependencies. The `prepack` script runs
automatically before `npm publish` and validates that all skill files exist.

### 3. `README.md` — update install instructions

Replace the "coming soon" placeholder sections with the real install commands:

- **Claude Code:** `claude plugins install @codeskine/gitlab-workflow`
- **Cursor / Codex:** Keep manual copy instructions (no plugin manager yet), but remove the
  "coming soon" language since the package is now available on npm.

## Prerequisites (one-time, outside this repo)

These must be done before the first tag-triggered publish succeeds:

1. Create the `codeskine` npm organization at npmjs.com/org/codeskine (if not already done)
2. Generate an **Automation** token at npmjs.com → Account Settings → Access Tokens
3. Add it as `NPM_TOKEN` in GitHub repo Settings → Secrets and variables → Actions

## Release flow (post-merge)

```bash
# Bump version in package.json and VERSION, commit, then:
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions publishes @codeskine/gitlab-workflow@1.0.0 to npm automatically
```

## Out of scope

- Cursor or Codex plugin managers (not available yet)
- Changelog automation
- npm provenance / SLSA attestations (can be added later)
