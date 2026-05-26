# gitlab-workflow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all four skills to phase-oriented names, update plugin manifests to the extended format across three platforms, introduce a shared quality standard, enforce commit scope as `#N`, add mandatory milestone selection and branch suggestion to `gitlab-track`, and aggregate `Closes #N` from commits in `gitlab-review`.

**Architecture:** The four skill directories are renamed via `git mv`, then each `SKILL.md` receives functional updates. A new `skills/shared/references/quality-standard.md` holds quality criteria referenced by all skills. A new `.codex-plugin/plugin.json` is added alongside the updated claude and cursor manifests.

**Tech Stack:** Markdown (SKILL.md), JSON (plugin manifests, package.json), `git mv` for renames, `glab` CLI referenced in skill instructions.

---

## File Map

| File | Action |
|---|---|
| `skills/conventional-commit/` | `git mv` → `skills/gitlab-commit/` |
| `skills/gitlab-issue/` | `git mv` → `skills/gitlab-track/` |
| `skills/gitlab-mr/` | `git mv` → `skills/gitlab-review/` |
| `skills/gitlab-milestone/` | `git mv` → `skills/gitlab-plan/` |
| `skills/gitlab-commit/SKILL.md` | Rename frontmatter + remove dir-scope logic + add quality gate |
| `skills/gitlab-track/SKILL.md` | Rename frontmatter + milestone mandatory + transition branch options + quality gate |
| `skills/gitlab-review/SKILL.md` | Rename frontmatter + commit-log Closes parsing + quality gate |
| `skills/gitlab-plan/SKILL.md` | Rename frontmatter + quality gate only |
| `skills/shared/references/quality-standard.md` | New shared quality criteria |
| `package.json` | name, description, keywords, homepage, repository, files, prepack |
| `.claude-plugin/plugin.json` | Extended format, new name/skills/keywords |
| `.cursor-plugin/plugin.json` | Extended format, new name/skills/keywords, add gitlab-commit |
| `.codex-plugin/plugin.json` | New file, full extended manifest |
| `README.md` | Update title, skill table, all name references |

---

## Task 1: Rename skill directories

**Files:**
- Rename: `skills/conventional-commit/` → `skills/gitlab-commit/`
- Rename: `skills/gitlab-issue/` → `skills/gitlab-track/`
- Rename: `skills/gitlab-mr/` → `skills/gitlab-review/`
- Rename: `skills/gitlab-milestone/` → `skills/gitlab-plan/`

- [ ] **Step 1: Rename all four directories with git mv**

```bash
git mv skills/conventional-commit skills/gitlab-commit
git mv skills/gitlab-issue skills/gitlab-track
git mv skills/gitlab-mr skills/gitlab-review
git mv skills/gitlab-milestone skills/gitlab-plan
```

- [ ] **Step 2: Verify the renames**

```bash
ls skills/
```

Expected output:
```
gitlab-commit
gitlab-plan
gitlab-review
gitlab-track
shared
```
(Note: `shared/` will be created in Task 3 — at this point only the four renamed dirs should appear.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: rename skill directories to phase-oriented names"
```

---

## Task 2: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace the entire package.json content**

Replace `package.json` with:

```json
{
  "name": "gitlab-workflow",
  "version": "1.0.0",
  "description": "AI Agent Skills for managing the GitLab workflow — plan milestones, track issues, commit with traceability, and open merge requests via the glab CLI.",
  "license": "MIT",
  "author": {
    "name": "Stefano Veloccia"
  },
  "keywords": [
    "claude-code",
    "cursor",
    "codex",
    "agent-skill",
    "gitlab",
    "glab",
    "gitlab-workflow",
    "conventional-commits",
    "merge-request",
    "milestone",
    "issue-tracking",
    "traceability",
    "ai-agent",
    "agentic"
  ],
  "engines": {
    "node": ">=18"
  },
  "files": [
    "VERSION",
    "SECURITY.md",
    "LICENSE",
    "skills",
    ".claude-plugin",
    ".cursor-plugin",
    ".codex-plugin"
  ],
  "scripts": {
    "prepack": "node -e \"const fs=require('fs');for(const p of ['skills/gitlab-plan/SKILL.md','skills/gitlab-track/SKILL.md','skills/gitlab-commit/SKILL.md','skills/gitlab-review/SKILL.md','VERSION']){if(!fs.existsSync(p)){console.error('Missing '+p);process.exit(1)}}\""
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/codeskine/gitlab-workflow.git"
  },
  "homepage": "https://github.com/codeskine/gitlab-workflow#readme",
  "bugs": {
    "url": "https://github.com/codeskine/gitlab-workflow/issues"
  }
}
```

- [ ] **Step 2: Run prepack to verify paths resolve**

```bash
node -e "const fs=require('fs');for(const p of ['skills/gitlab-plan/SKILL.md','skills/gitlab-track/SKILL.md','skills/gitlab-commit/SKILL.md','skills/gitlab-review/SKILL.md','VERSION']){if(!fs.existsSync(p)){console.error('Missing '+p);process.exit(1)}else{console.log('OK '+p)}}"
```

Expected: four `OK` lines, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(package): rename to gitlab-workflow, update keywords and paths"
```

---

## Task 3: Update plugin manifests

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.cursor-plugin/plugin.json`
- Create: `.codex-plugin/plugin.json`

- [ ] **Step 1: Replace .claude-plugin/plugin.json**

```json
{
  "name": "gitlab-workflow",
  "version": "1.0.0",
  "description": "AI Agent Skills for managing the GitLab workflow — plan milestones, track issues, commit with traceability, and open merge requests via the glab CLI.",
  "homepage": "https://github.com/codeskine/gitlab-workflow",
  "repository": "https://github.com/codeskine/gitlab-workflow",
  "author": { "name": "Stefano Veloccia" },
  "license": "MIT",
  "keywords": [
    "claude-code",
    "claude-code-plugin",
    "gitlab",
    "glab",
    "gitlab-workflow",
    "skills",
    "ai-agent",
    "agentic",
    "conventional-commits",
    "merge-request",
    "milestone",
    "issue-tracking",
    "traceability"
  ],
  "skills": ["gitlab-plan", "gitlab-track", "gitlab-commit", "gitlab-review"]
}
```

- [ ] **Step 2: Replace .cursor-plugin/plugin.json**

```json
{
  "name": "gitlab-workflow",
  "version": "1.0.0",
  "description": "AI Agent Skills for managing the GitLab workflow — plan milestones, track issues, commit with traceability, and open merge requests via the glab CLI.",
  "homepage": "https://github.com/codeskine/gitlab-workflow",
  "repository": "https://github.com/codeskine/gitlab-workflow",
  "author": { "name": "Stefano Veloccia" },
  "license": "MIT",
  "keywords": [
    "cursor",
    "cursor-plugin",
    "gitlab",
    "glab",
    "gitlab-workflow",
    "skills",
    "ai-agent",
    "agentic",
    "conventional-commits",
    "merge-request",
    "milestone",
    "issue-tracking",
    "traceability"
  ],
  "skills": ["gitlab-plan", "gitlab-track", "gitlab-commit", "gitlab-review"]
}
```

- [ ] **Step 3: Create .codex-plugin/plugin.json**

```bash
mkdir -p .codex-plugin
```

Create `.codex-plugin/plugin.json`:

```json
{
  "name": "gitlab-workflow",
  "version": "1.0.0",
  "description": "AI Agent Skills for managing the GitLab workflow — plan milestones, track issues, commit with traceability, and open merge requests via the glab CLI.",
  "homepage": "https://github.com/codeskine/gitlab-workflow",
  "repository": "https://github.com/codeskine/gitlab-workflow",
  "author": { "name": "Stefano Veloccia" },
  "license": "MIT",
  "keywords": [
    "codex",
    "codex-plugin",
    "gitlab",
    "glab",
    "gitlab-workflow",
    "skills",
    "ai-agent",
    "agentic",
    "conventional-commits",
    "merge-request",
    "milestone",
    "issue-tracking",
    "traceability"
  ],
  "skills": ["gitlab-plan", "gitlab-track", "gitlab-commit", "gitlab-review"]
}
```

- [ ] **Step 4: Verify all three manifests have consistent name/version/skills**

```bash
for f in .claude-plugin/plugin.json .cursor-plugin/plugin.json .codex-plugin/plugin.json; do
  echo "=== $f ===" && python3 -c "import json,sys; d=json.load(open('$f')); print('name:', d['name'], '| version:', d['version'], '| skills:', d['skills'])"
done
```

Expected: all three print `name: gitlab-workflow | version: 1.0.0 | skills: ['gitlab-plan', 'gitlab-track', 'gitlab-commit', 'gitlab-review']`.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/plugin.json .cursor-plugin/plugin.json .codex-plugin/plugin.json
git commit -m "chore(plugins): extend manifests to full format, add codex plugin"
```

---

## Task 4: Create shared quality standard

**Files:**
- Create: `skills/shared/references/quality-standard.md`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p skills/shared/references
```

Create `skills/shared/references/quality-standard.md`:

````markdown
---
title: Quality Standard for GitLab Workflow Artifacts
---

# Quality Standard

This file defines the quality criteria applied silently by each skill before presenting a
draft to the user. Skills self-verify against the relevant section and fix violations
automatically where possible.

## Issue (`gitlab-track`)

- [ ] Title ≥ 5 words and not generic (e.g. "Fix bug" alone fails; "Fix nil pointer in user handler" passes)
- [ ] At least one fenced code snippet (5–20 lines) for `bug` and `technical-debt` issue types
- [ ] Labels include at least `type::*` + `workflow::ready`
- [ ] Active milestone is assigned — never left empty without explicit user confirmation
- [ ] No unfilled placeholders: `TBD`, `TODO`, `<...>`

## Commit (`gitlab-commit`)

- [ ] Scope is `#N` (issue ID) when branch has an issue ID; omitted otherwise
- [ ] Title ≤ 72 characters
- [ ] Footer `Closes #N` or `Related to #N` present when issue ID exists
- [ ] No placeholder text (`TBD`, `TODO`, `<...>`) in body

## Merge Request (`gitlab-review`)

- [ ] At least one fenced code snippet per significant change area
- [ ] `Closes #N` / `Related to #N` entries aggregated from commit messages (never omitted silently)
- [ ] Labels present
- [ ] Milestone present if the associated issue has a milestone
- [ ] `{Reviewer notes}` section omitted when there are no non-obvious design decisions

## Milestone (`gitlab-plan`)

- [ ] Title is consistent with project versioning or sprint naming (e.g. `v1.2.0`, `Sprint 5`, `2026-Q2`)
- [ ] Due date is present
- [ ] Description contains ≥ 2 sentences describing the goal
````

- [ ] **Step 2: Commit**

```bash
git add skills/shared/references/quality-standard.md
git commit -m "feat(shared): add quality-standard.md shared across all skills"
```

---

## Task 5: Update gitlab-plan/SKILL.md

**Files:**
- Modify: `skills/gitlab-plan/SKILL.md`

- [ ] **Step 1: Update frontmatter — name and cross-references**

Replace the frontmatter block (lines 1–14):

```yaml
---
name: gitlab-plan
description:
  "GitLab milestone author. Use when the user asks to create, update, or
  close a milestone on GitLab, plan a sprint or release, or group issues under a shared
  goal. Not for issue creation (→ See codeskine/gitlab-workflow@gitlab-track) or
  merge requests (→ See codeskine/gitlab-workflow@gitlab-review)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---
```

- [ ] **Step 2: Update the H1 title**

Replace:
```
# GitLab milestone author
```
With:
```
# GitLab plan — milestone author
```

- [ ] **Step 3: Add quality gate section before the draft gate (step 4)**

Insert this section between step 3 (Compose the draft) and step 4 (Draft gate):

```markdown
### 4. Quality gate (silent)

Before presenting the draft, verify:

- Title is consistent with project versioning or sprint naming (e.g. `v1.2.0`, `Sprint 5`)
- Due date is present
- Description contains ≥ 2 sentences about the goal

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)
```

Renumber the subsequent steps: old step 4 (Draft gate) → step 5, old step 5 (Publish via glab) → step 6, old step 6 (Post-creation) → step 7.

- [ ] **Step 4: Update cross-references in the Update and Close/Reopen workflows**

In the References section at the bottom, verify no `gitlab-author-skills` references remain:

```bash
grep "gitlab-author-skills" skills/gitlab-plan/SKILL.md
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add skills/gitlab-plan/SKILL.md
git commit -m "feat(gitlab-plan): rename from gitlab-milestone, add quality gate"
```

---

## Task 6: Update gitlab-commit/SKILL.md

**Files:**
- Modify: `skills/gitlab-commit/SKILL.md`

- [ ] **Step 1: Update frontmatter**

Replace the frontmatter block:

```yaml
---
name: gitlab-commit
description:
  "GitLab commit author. Use when the user asks to create a commit, format a git
  commit message, or finalize staged changes on a GitLab project. Also triggers when the
  user says changes are done, work is complete, or signals readiness to save progress —
  even without explicitly saying 'commit'. Formats messages following Conventional Commits
  v1.0.0 with the GitLab issue ID as scope, extracted from the branch name. Not for merge
  requests (→ See codeskine/gitlab-workflow@gitlab-review) or issue creation
  (→ See codeskine/gitlab-workflow@gitlab-track)."
user-invocable: false
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires git."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---
```

- [ ] **Step 2: Update H1 title**

Replace:
```
# GitLab conventional commit author
```
With:
```
# GitLab commit author
```

- [ ] **Step 3: Remove step 4 (Infer scope) entirely**

Delete the entire section:

```markdown
### 4. Infer scope

Take the top-level directory of the most-changed path in `--staged --stat`. Skip generic
wrapper directories (`pkg/`, `src/`, `internal/`, `lib/`) and use the next meaningful
segment instead. Examples: `skills/gitlab-issue/` → `gitlab-issue`; `src/auth/` → `auth`;
`pkg/api/handler.go` → `api`. If changes span more than two unrelated directories, omit
the scope.
```

- [ ] **Step 4: Add scope rule to step 3 (Extract issue ID)**

After the branch pattern table in step 3, add:

```markdown
**Scope rule:** The scope in the commit message is always `#N` — the issue ID. It is never
a directory name or module path. If no issue ID exists, the scope is omitted entirely.
```

- [ ] **Step 5: Add quality gate as new step 4 (renumber old step 4 → 5, old step 5 → 6)**

Insert after the updated step 3:

```markdown
### 4. Quality gate (silent)

Before presenting the draft, verify:

- Scope = `#N` is present if branch has an issue ID (never a directory name)
- Title ≤ 72 characters
- Footer `Closes #N` or `Related to #N` is present when issue ID exists
- No placeholder text (`TBD`, `TODO`, `<...>`) in body

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)
```

- [ ] **Step 6: Update draft format in step 5 (old step 4)**

Replace the format block:

```
<type>(<scope>): <description>

<optional body>

Closes #N
```

With:

```
<type>(#N): <description>

<optional body>

Closes #N
```

Update the confirmation prompt to match:

```
> "Shall I commit with this message? (yes / edit / cancel)"
```

(No change needed here — just ensure the proposed message preview shows `<type>(#N):` format.)

- [ ] **Step 7: Update examples to use #N scope**

Replace Example 1:

```
Input:  branch fix/87-nil-pointer, changed pkg/api/handler.go
Output:
fix(#87): handle nil pointer in user handler

Closes #87
```

Replace Example 2:

```
Input:  branch feature/42-oauth, changed src/auth/ and src/middleware/
Output:
feat(#42): implement OAuth2 login with Google

- Add OAuth2 flow for Google provider
- Update middleware to validate Bearer tokens

Closes #42
```

Example 3 (no issue) stays the same — scope already omitted.

- [ ] **Step 8: Verify no old scope-inference language remains**

```bash
grep -n "top-level directory\|most-changed path\|wrapper director" skills/gitlab-commit/SKILL.md
```

Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add skills/gitlab-commit/SKILL.md
git commit -m "feat(gitlab-commit): rename, enforce #N scope, add quality gate"
```

---

## Task 7: Update gitlab-track/SKILL.md

**Files:**
- Modify: `skills/gitlab-track/SKILL.md`

- [ ] **Step 1: Update frontmatter**

Replace the frontmatter block:

```yaml
---
name: gitlab-track
description: "GitLab issue author. Use when the user asks to open a bug report,
  feature request, technical debt item, or documentation issue on GitLab via glab.
  Apply when the user says 'create an issue', 'report a bug', 'track tech debt',
  or 'propose a feature'. Not for merge requests (→ See codeskine/gitlab-workflow@gitlab-review)
  or milestones (→ See codeskine/gitlab-workflow@gitlab-plan)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---
```

- [ ] **Step 2: Update H1 title**

Replace:
```
# GitLab issue author
```
With:
```
# GitLab track — issue author
```

- [ ] **Step 3: Make milestone mandatory in step 4**

Replace the closing sentence of step 4:

```
Select the most relevant active milestone based on branch name, label, or issue type. If none fits, leave empty. Suggest `workflow::ready` as the initial lifecycle label alongside the type label.
```

With:

```
Select the most relevant active milestone based on branch name, label, or issue type. If a
milestone fits, suggest it. If none fits (e.g. hotfix, out-of-sprint task), leave it empty
without asking — not every issue belongs to a milestone.

Suggest `workflow::ready` as the initial lifecycle label alongside the type label.
```

- [ ] **Step 4: Add quality gate section before the draft gate**

Insert this section between step 5 (Apply diagram policy) and step 6 (Draft gate):

```markdown
### 6. Quality gate (silent)

Before presenting the draft, verify:

- Title ≥ 5 words and not generic (`Fix bug` alone fails; `Fix nil pointer in user handler` passes)
- At least one fenced code snippet (5–20 lines) for `bug` and `technical-debt` types
- Labels include at least `type::*` + `workflow::ready`
- No placeholder text (`TBD`, `TODO`, `<...>`) in any section

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)
```

Renumber: old step 6 (Draft gate) → step 7, old step 7 (Publish via glab) → step 8.

- [ ] **Step 5: Add branch setup to transition workflow**

In the `## Transition workflow` section, append a step 7 after the existing step 6 (Confirm the transition in chat):

```markdown
7. **Branch setup (only when transitioning to `workflow::in dev`):** Offer two options:

   > "Ready to start development. How do you want to proceed?
   > A) Create branch `<type>/N-<short-title>` (e.g. `fix/87-nil-pointer-handler`)
   > B) Stay on current branch `<current-branch>`"

   If option A: run `git checkout -b <branch-name>` and confirm the new branch in chat.
   If option B: continue without branch change.

   Branch name is auto-derived: type from issue label (`type::bug` → `fix`, `type::feature` →
   `feature`, `type::technical-debt` → `refactor`, `type::documentation` → `docs`), N from
   issue ID, short-title from the first 3–4 significant words of the issue title in kebab-case.
```

- [ ] **Step 6: Verify no old cross-references remain**

```bash
grep "gitlab-author-skills\|gitlab-mr\|gitlab-milestone" skills/gitlab-track/SKILL.md
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add skills/gitlab-track/SKILL.md
git commit -m "feat(gitlab-track): rename, mandatory milestone, branch setup on in-dev transition"
```

---

## Task 8: Update gitlab-review/SKILL.md

**Files:**
- Modify: `skills/gitlab-review/SKILL.md`

- [ ] **Step 1: Update frontmatter**

Replace the frontmatter block:

```yaml
---
name: gitlab-review
description:
  "GitLab merge request author. Use when the user asks to create, draft,
  or publish a merge request on GitLab via glab. Applies to feature, bugfix, hotfix,
  and refactor branches. Not for issue creation (→ See codeskine/gitlab-workflow@gitlab-track)
  or milestones (→ See codeskine/gitlab-workflow@gitlab-plan)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---
```

- [ ] **Step 2: Update H1 title**

Replace:
```
# GitLab merge request author
```
With:
```
# GitLab review — merge request author
```

- [ ] **Step 3: Add commit reference extraction as step 2b (after Explore git context)**

Insert after step 2 (Explore git context) and before step 3 (Discover labels and milestone):

```markdown
### 2b. Extract issue references from commit history

```bash
git log <base-branch>...HEAD --format="%B"
```

Parse all commit message bodies for `Closes #\d+` and `Related to #\d+` patterns.
Deduplicate the collected issue IDs. This list drives the closing section of the MR
description.

**If the list is empty** (no issue references found in any commit), warn the user before
presenting the draft:

> "No issue references found in commit messages. The MR will have no Closes/Related to
> links. Continue anyway? (yes / add manually / cancel)"
```

- [ ] **Step 4: Update step 4 (Compose the draft) to use aggregated closing list**

In step 4, replace the sentence about the title with a note about the closing section.
After the sentence about the MR title with conventional commit prefix, add:

```markdown
For the closing section of the MR description, use the aggregated issue list from step 2b:
- Use `Closes #N` for branches prefixed `fix/` or `hotfix/` (issue will be closed on merge)
- Use `Related to #N` for `feature/` branches (issue may remain open after merge)

Do not guess or invent issue references — use only what was extracted from commit messages.
```

- [ ] **Step 5: Add quality gate before the draft gate (step 5)**

Insert between step 4 (Compose the draft) and step 5 (Draft gate):

```markdown
### 5. Quality gate (silent)

Before presenting the draft, verify:

- At least one fenced code snippet per significant change area (5–20 lines, with `path/file.ext` line N citation)
- `Closes #N` / `Related to #N` closing list is populated (warn if empty — see step 2b)
- Labels are present
- Milestone is present if the associated issue has a milestone
- `{Reviewer notes}` section is omitted if there are no non-obvious design decisions

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)
```

Renumber: old step 5 (Draft gate) → step 6, old step 6 (Publish via glab) → step 7, old step 7 (Post-creation) → step 8.

- [ ] **Step 6: Verify no old cross-references remain**

```bash
grep "gitlab-author-skills\|gitlab-issue\|gitlab-milestone" skills/gitlab-review/SKILL.md
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add skills/gitlab-review/SKILL.md
git commit -m "feat(gitlab-review): rename, aggregate Closes #N from commits, add quality gate"
```

---

## Task 9: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read the current README to identify all references to update**

```bash
grep -n "gitlab-author\|conventional-commit\|gitlab-issue\|gitlab-mr\|gitlab-milestone\|gitlab-author-skills" README.md
```

Note every line number returned — each one needs updating.

- [ ] **Step 2: Update all occurrences of old plugin and skill names**

Apply these replacements throughout the file:

| Find | Replace |
|---|---|
| `gitlab-author` | `gitlab-workflow` |
| `gitlab-author-skills` | `gitlab-workflow` |
| `conventional-commit` | `gitlab-commit` |
| `gitlab-issue` | `gitlab-track` |
| `gitlab-mr` | `gitlab-review` |
| `gitlab-milestone` | `gitlab-plan` |
| `codeskine/gitlab-author-skills` | `codeskine/gitlab-workflow` |

- [ ] **Step 3: Update the skill table in README (if present) to reflect new names and roles**

The skill table should read:

| Skill | Trigger |
|---|---|
| `gitlab-plan` | Create or manage milestones |
| `gitlab-track` | Create issues and manage lifecycle |
| `gitlab-commit` | Commit staged changes with traceability |
| `gitlab-review` | Create and publish merge requests |

- [ ] **Step 4: Verify no old names remain**

```bash
grep -n "gitlab-author\|conventional-commit\|gitlab-issue\b\|gitlab-mr\b\|gitlab-milestone" README.md
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs(readme): update all skill names and references to gitlab-workflow"
```

---

## Task 10: Final validation

- [ ] **Step 1: Run prepack to verify all SKILL.md paths exist**

```bash
node -e "const fs=require('fs');for(const p of ['skills/gitlab-plan/SKILL.md','skills/gitlab-track/SKILL.md','skills/gitlab-commit/SKILL.md','skills/gitlab-review/SKILL.md','VERSION']){if(!fs.existsSync(p)){console.error('FAIL '+p);process.exit(1)}else{console.log('OK '+p)}}"
```

Expected: all five lines print `OK`.

- [ ] **Step 2: Verify version consistency**

```bash
echo "package.json:" && grep '"version"' package.json
echo "VERSION:" && cat VERSION
echo ".claude-plugin:" && grep '"version"' .claude-plugin/plugin.json
echo ".cursor-plugin:" && grep '"version"' .cursor-plugin/plugin.json
echo ".codex-plugin:" && grep '"version"' .codex-plugin/plugin.json
echo "SKILL.md files:" && grep -r "version:" skills/*/SKILL.md | grep -v refname
```

Expected: all show `1.0.0`.

- [ ] **Step 3: Verify no old names anywhere in skills/**

```bash
grep -r "conventional-commit\|gitlab-issue\|gitlab-mr\b\|gitlab-milestone\|gitlab-author-skills" skills/
```

Expected: no output.

- [ ] **Step 4: Run prettier on all markdown**

```bash
npx prettier --write "**/*.md"
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: apply prettier formatting after gitlab-workflow redesign"
```
