# Design: gitlab-workflow — Skill Rename, Commit Standard & Traceability Chain

**Date:** 2026-05-26
**Status:** Approved

## Overview

Redesign the `gitlab-author` plugin into `gitlab-workflow`: rename all skills to phase-oriented
names, introduce a shared quality standard for generated artifacts, define a canonical commit
format, and enforce an explicit traceability chain from commit to issue to MR to milestone.

## 1. Plugin Rename

| Current | New |
| --- | --- |
| `"name": "gitlab-author"` (package.json) | `"name": "gitlab-workflow"` |
| `.claude-plugin/plugin.json` name | `gitlab-workflow` |
| `.cursor-plugin/plugin.json` name | `gitlab-workflow` |
| README title and references | updated throughout |

## 2. Skill Renames

Skills are renamed to reflect their role in the development lifecycle, not just the artifact
they create.

| Current directory | New directory | New `name` frontmatter | Role |
| --- | --- | --- | --- |
| `skills/conventional-commit/` | `skills/gitlab-commit/` | `gitlab-commit` | Save progress with explicit issue reference |
| `skills/gitlab-issue/` | `skills/gitlab-track/` | `gitlab-track` | Create and manage issue lifecycle |
| `skills/gitlab-mr/` | `skills/gitlab-review/` | `gitlab-review` | Publish work for review |
| `skills/gitlab-milestone/` | `skills/gitlab-plan/` | `gitlab-plan` | Plan sprints and releases |

All SKILL.md frontmatter `name:` fields, `description:` cross-references (`→ See
codeskine/gitlab-author-skills@<name>`), and internal relative links updated accordingly.
`package.json` `prepack` script and `files` array updated with new paths.

## 3. Commit Format Standard

Every commit on a GitLab-tracked branch must follow this format:

```
<type>(#N): <short title>

<optional description>
Closes #N
```

### Rules

- **Scope is always `#N`** (the issue ID), never a directory or module name.
- If the branch has no issue ID, scope is omitted: `chore: update deps`.
- **Footer is mandatory** when an issue exists: `Closes #N` if the issue is resolved by this
  commit, `Related to #N` if it remains open.
- Issue ID is extracted from branch name (`fix/87-desc` → `#87`). If no ID found, the skill
  asks once: _"Which GitLab issue does this commit reference? (#N or 'none')"_
- Title ≤ 72 characters.

### Rationale

Using `#N` as scope makes every issue immediately visible in `git log --oneline`. In branches
that address multiple issues, the one-line history shows exactly which commits belong to which
issue — without opening each commit individually.

```
abc1234 feat(#42): add OAuth login
def5678 fix(#87): handle nil pointer in handler
ffe9012 docs(#42): update authentication guide
```

### Changes to `gitlab-commit`

- Remove scope inference from directory paths (current behavior).
- Scope = `#N` extracted from branch name; omitted if no issue.
- Footer `Closes #N` / `Related to #N` is required, not optional.
- Quality gate (see §5) runs before presenting the draft.

## 4. Traceability Chain

The full chain is: **milestone → issue → branch → commits → MR**.

```
[gitlab-plan]   →  milestone (create new, or select existing active milestone)
gitlab-track    →  issue created and assigned to an active milestone
                →  transition "→ in dev":
                     option A: create branch  git checkout -b fix/N-desc  or  feature/N-desc
                     option B: use current branch (user is already on the right branch)
gitlab-commit   →  fix(#N): title
                   Closes #N          ← per-commit issue reference
gitlab-review   →  git log base...HEAD --format="%B"
                →  extract all Closes #N / Related to #N from commit messages
                →  deduplicate and aggregate in MR description
                →  result: MR explicitly closes every issue addressed in the branch
```

### Notes

- `gitlab-plan` is **optional and independent** — the milestone may already exist. `gitlab-track`
  always runs `glab milestone list --state active` and lets the user select.
- Branch creation is proposed during the **transition to `workflow::in dev`**, not at issue
  creation. Two options are always offered: create a new branch or stay on the current one.
- `gitlab-review` uses `Closes #N` for branches prefixed `fix/` or `hotfix/`, and `Related to #N`
  for `feature/` branches where the issue may stay open after merge. Aggregation is always
  derived from commit messages, never guessed.

### Changes to `gitlab-track`

- Create workflow: milestone selection is mandatory. If no active milestone fits, the skill
  asks explicitly — never leaves the field empty silently.
- Transition workflow (`→ in dev`): after applying the label change, offer branch options:
  1. _"Create new branch `fix/N-short-title`?"_ (auto-derived from issue ID + title)
  2. _"Stay on current branch `<branch-name>`?"_

### Changes to `gitlab-review`

- After `git log` context extraction, parse all commit message bodies for
  `Closes #\d+` and `Related to #\d+` patterns.
- Deduplicate, then inject the aggregated list into the MR description closing section.
- If the list is empty (no references found in commits), warn the user before presenting
  the draft.

## 5. Quality Checklist (Integrated)

A shared file `references/quality-standard.md` defines quality criteria for all artifact
types. Each SKILL.md references it. The skill runs the checklist silently before presenting
the draft — no output to the user, corrections applied automatically where possible.

### Criteria by artifact

**Issue (`gitlab-track`)**

- Title ≥ 5 words, not generic.
- At least one code snippet if type is `bug` or `technical-debt`.
- Labels: at least `type::*` + `workflow::ready`.
- Active milestone assigned (never left empty — ask explicitly if none fits).
- No unfilled placeholders (`TBD`, `TODO`, `<...>`).

**Commit (`gitlab-commit`)**

- Scope = `#N` present if branch has issue ID.
- Title ≤ 72 characters.
- Footer `Closes #N` or `Related to #N` present.
- No placeholders in body.

**MR (`gitlab-review`)**

- At least one snippet per significant change area.
- `Closes #N` / `Related to #N` aggregated from commits (never omitted).
- Labels present.
- Milestone present if associated issue has a milestone.
- `{Reviewer notes}` section omitted if no non-obvious design decisions.

**Milestone (`gitlab-plan`)**

- Title consistent with project versioning or sprint naming.
- Due date present.
- Description ≥ 2 sentences about the goal.

### New file

`skills/shared/references/quality-standard.md` — a new `skills/shared/` directory holds
content shared across all skills. Each SKILL.md links to it with a relative path
(`../shared/references/quality-standard.md`).

## 6. Platform Plugin Manifests

All three platform plugin manifests must be consistent and include all four skills.

### Target state for all manifests

```json
{
  "name": "gitlab-workflow",
  "version": "1.0.0",
  "description": "<platform> Agent Skills plugin for managing the GitLab workflow (plan, track, commit, review) via the glab CLI.",
  "skills": ["gitlab-plan", "gitlab-track", "gitlab-commit", "gitlab-review"],
  "repository": "https://github.com/codeskine/gitlab-author-skills"
}
```

### Platform-specific notes

| File | Status | Changes |
| --- | --- | --- |
| `.claude-plugin/plugin.json` | exists | `name` → `gitlab-workflow`; `skills` updated; `description` updated |
| `.cursor-plugin/plugin.json` | exists — missing `gitlab-commit` | `name` → `gitlab-workflow`; add `gitlab-commit` to `skills`; `description` updated |
| `.codex-plugin/plugin.json` | **new** | Create with full manifest; all 4 skills |

### Validation criteria (all manifests)

- `name` is identical across all three files: `gitlab-workflow`
- `version` matches `package.json` version field
- `skills` array contains all four skill names in the same order: `["gitlab-plan", "gitlab-track", "gitlab-commit", "gitlab-review"]`
- `repository` URL is present and identical across all three files
- No platform has a subset of skills without explicit justification

### `package.json` changes

- `name`: `gitlab-author` → `gitlab-workflow`
- `files` array: add `.codex-plugin`
- `prepack` script: update all four SKILL.md paths to new names

## 7. Files Touched

| File / directory | Change |
| --- | --- |
| `skills/conventional-commit/` | Renamed to `skills/gitlab-commit/` |
| `skills/gitlab-issue/` | Renamed to `skills/gitlab-track/` |
| `skills/gitlab-mr/` | Renamed to `skills/gitlab-review/` |
| `skills/gitlab-milestone/` | Renamed to `skills/gitlab-plan/` |
| All four `SKILL.md` files | Frontmatter, cross-references, workflow sections updated |
| `skills/shared/references/quality-standard.md` | New shared quality criteria file |
| `package.json` | `name`, `prepack` script, `files` array updated |
| `.claude-plugin/plugin.json` | `name`, `skills`, `description` updated |
| `.cursor-plugin/plugin.json` | `name`, `skills` (add `gitlab-commit`), `description` updated |
| `.codex-plugin/plugin.json` | **New file** — full manifest with all 4 skills |
| `README.md` | Title, skill table, all name references updated |
