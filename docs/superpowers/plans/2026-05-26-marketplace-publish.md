# Marketplace Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the plugin as `@codeskine/gitlab-workflow` on npm and automate future releases with a tag-triggered GitHub Actions workflow.

**Architecture:** Three targeted changes — rename the package in `package.json`, add a `.github/workflows/publish.yml` that triggers on `v*.*.*` tags, and update `README.md` to show the real install command. No new dependencies, no structural changes.

**Tech Stack:** npm (scoped public package), GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`), Node 18.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify line 2 | Package name → `@codeskine/gitlab-workflow` |
| `.github/workflows/publish.yml` | Create | Tag-triggered npm publish CI |
| `README.md` | Modify lines 24–50 | Replace "coming soon" install section with real commands |

---

### Task 1: Rename package in `package.json`

**Files:**
- Modify: `package.json:2`

- [ ] **Step 1: Update the `name` field**

Open `package.json` and change line 2 from:
```json
  "name": "gitlab-workflow",
```
to:
```json
  "name": "@codeskine/gitlab-workflow",
```

No other fields change. The `version`, `files`, `scripts`, `repository`, `homepage`, and `bugs` fields all stay as-is.

- [ ] **Step 2: Verify the package validates with a dry-run pack**

Run:
```bash
npm pack --dry-run
```

Expected output: a list of files that would be included in the tarball, starting with:
```
npm notice package: @codeskine/gitlab-workflow@1.0.0
npm notice === Tarball Contents ===
npm notice ...VERSION
npm notice ...SECURITY.md
npm notice ...LICENSE
npm notice ...skills/gitlab-plan/SKILL.md
npm notice ...skills/gitlab-track/SKILL.md
npm notice ...skills/gitlab-commit/SKILL.md
npm notice ...skills/gitlab-review/SKILL.md
...
```

If you see `npm error Missing skills/...` the prepack script caught a missing file — check that the `skills/` directory is intact.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: rename package to @codeskine/gitlab-workflow"
```

---

### Task 2: Create the GitHub Actions publish workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create the workflow directory and file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/publish.yml` with this exact content:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Publish to npm
        run: npm publish --access=public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Notes:
- `registry-url` is required — `actions/setup-node` uses it to write the `.npmrc` that injects `NODE_AUTH_TOKEN` as the auth token.
- `permissions: contents: read` is minimal — the job only reads the repo, it does not push.
- `npm publish` triggers the `prepack` script automatically, which validates all skill files exist before packaging.
- No `npm ci` step: the package has no dependencies, so there is nothing to install.

- [ ] **Step 2: Verify the YAML is valid**

Run:
```bash
npx js-yaml .github/workflows/publish.yml && echo "YAML valid"
```

Expected output:
```
YAML valid
```

If you see a parse error, fix the indentation in the file.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: add tag-triggered npm publish workflow"
```

---

### Task 3: Update README install instructions

**Files:**
- Modify: `README.md:24–50`

- [ ] **Step 1: Replace the Installation section**

In `README.md`, replace the entire block from line 24 to line 50:

**Remove** (lines 24–50):
```markdown
## Installation

> **Note:** Marketplace listings are coming soon. In the meantime, install manually by cloning
> the repository and pointing your agent's skills directory at `skills/`.

```bash
git clone https://github.com/codeskine/gitlab-workflow.git
```

### Claude Code

_Plugin marketplace listing coming soon._

Until then, copy or symlink the `skills/` directory into your project's `.claude/plugins/`
or configure it as a local plugin path.

### Cursor

_Plugin marketplace listing coming soon._

Until then, copy the `skills/` directory into your project's `.cursor/skills/`.

### Codex

_Plugin marketplace listing coming soon._

Until then, copy the `skills/` directory into your project's `.codex/skills/`.
```

**Replace with:**
```markdown
## Installation

### Claude Code

```bash
claude plugins install @codeskine/gitlab-workflow
```

### Cursor

Copy the `skills/` directory into your project's `.cursor/skills/`:

```bash
git clone https://github.com/codeskine/gitlab-workflow.git /tmp/gitlab-workflow
cp -r /tmp/gitlab-workflow/skills .cursor/
```

### Codex

Copy the `skills/` directory into your project's `.codex/skills/`:

```bash
git clone https://github.com/codeskine/gitlab-workflow.git /tmp/gitlab-workflow
cp -r /tmp/gitlab-workflow/skills .codex/
```
```

- [ ] **Step 2: Verify the Quickstart link still resolves**

Check that the `[Claude Code](#claude-code)` anchor on line 8 still resolves to the `### Claude Code` heading. GitHub auto-generates anchors from headings — `### Claude Code` → `#claude-code`. No change needed, but visually confirm the heading is still `### Claude Code` (not renamed).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update install instructions with real npm package name"
```

---

## Prerequisites Reminder (one-time, outside this repo)

Before pushing a tag, complete these steps in the browser:

1. **npm org:** Confirm `codeskine` org exists at [npmjs.com/org/codeskine](https://www.npmjs.com/org/codeskine). If not, create it (free for public packages).
2. **npm token:** Go to npmjs.com → avatar → Access Tokens → Generate New Token → **Automation** type. Copy the token.
3. **GitHub secret:** Go to the GitHub repo → Settings → Secrets and variables → Actions → New repository secret. Name: `NPM_TOKEN`, value: the token from step 2.

## First Release

After merging to `main` and completing the prerequisites:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will run `npm publish --access=public` and the package will appear at:
`https://www.npmjs.com/package/@codeskine/gitlab-workflow`
