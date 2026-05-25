# CLAUDE.md

## Project Overview

`gitlab-author-skills` is a Claude Code / Cursor Agent Skills plugin for authoring GitLab
artifacts — issues, milestones, and merge requests — and publishing them via the
[`glab`](https://gitlab.com/gitlab-org/cli) CLI. The repository is open source and designed
for two audiences: developers who install the skills into their projects to streamline GitLab
workflow, and contributors who extend or improve the plugin.

Artifacts are language-agnostic: templates define structure and sections, while the language
of generated content follows the user's active language at runtime.

## Project Structure

Skills live at repository root — one directory per sub-skill:

```
<skill-name>/       # sub-skill root (gitlab-issue, gitlab-milestone, gitlab-mr)
  SKILL.md          # Required: frontmatter + workflow instructions
  templates/        # Required: one .md file per artifact type
  references/       # Optional: deep documentation loaded on demand
SKILL.md            # Root orchestrator — sub-skill routing table
scripts/
  install.js        # npm CLI (gitlab-author) for installation
package.json        # Plugin manifest and install script entry point
```

## Agent Skills Specification

All skills MUST conform to the [Agent Skills specification](https://agentskills.io/specification.md).
Project-specific requirements below are the source of truth where they differ from the spec.

## Frontmatter

New skills go in `<skill-name>/SKILL.md`. Each file requires YAML frontmatter.
This project does **not** use `openclaw` metadata.

| Field | Required | Constraints |
| --- | --- | --- |
| `name` | Spec-required | 1–64 chars. Lowercase `a-z`, digits, hyphens. No leading/trailing/consecutive hyphens. Must match parent directory name. |
| `description` | Spec-required | 1–1024 chars. Must include a "Use when" or "Apply when" trigger clause. Must contain the word `GitLab`. |
| `license` | Project-required | `MIT` |
| `compatibility` | Project-required | Base: `Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated.` Extend when the skill has additional requirements. |
| `metadata` | Project-required | Must include `author` (string) and `version` (semver `a.b.c`, e.g. `"1.0.0"`). No `openclaw` block. |
| `user-invocable` | Project-required | Boolean. `true` for slash-command skills, `false` for contextual auto-trigger. |
| `allowed-tools` | Project-required | Space-delimited list. See [Allowed Tools](#allowed-tools). |

Example frontmatter:

```yaml
---
name: gitlab-example
description: "GitLab skill for X. Use when the user asks to create or update Y on GitLab."
user-invocable: false
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated.
metadata:
  author: your-username
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---
```

**Version discipline:** Versions follow semver (`a.b.c`). New skills start at `1.0.0`. When
modifying a skill, increment its `metadata.version` and bump the `version` field in
`package.json` before merging. Do not auto-increment — remind the developer as a next step.

### Description quality

Descriptions are the primary triggering mechanism. A poorly calibrated description wastes
context (too broad) or never fires (too vague).

Every description **MUST** contain the word `GitLab` — skills must not activate on
non-GitLab requests.

**Too vague** — no trigger context, ignored:

```yaml
# Bad — no trigger clause
description: Creates GitLab artifacts

# Good — specific trigger scenarios
description: "GitLab issue author. Use when the user asks to create a bug report,
  feature request, technical debt item, or documentation issue on GitLab via glab."
```

**Too broad** — matches all GitLab work, floods context:

```yaml
# Bad — triggers on every GitLab task
description: Use when working with GitLab or glab for any task.

# Good — scoped to merge requests only
description: "GitLab merge request author. Use when the user asks to create or draft
  a merge request description, or publish a branch via glab mr create."
```

**Overlap** — add explicit boundary disclaimers with `→ See` cross-references:

```yaml
# Good — clear boundary between sub-skills
description: "...Not for merge requests (→ See codeskine/gitlab-author-skills@gitlab-mr)."
```

## Allowed Tools

## Skill Body

## Workflows
