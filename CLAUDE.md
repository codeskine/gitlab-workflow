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

```
skills/               # Claude Code skill definitions
  <skill-name>/
    SKILL.md          # Required: metadata + instructions
    references/       # Optional: detailed documentation loaded on demand
    scripts/          # Optional: executable code
    assets/           # Optional: templates, resources, linter configs (.golangci.yml, etc.)
.claude-plugin/       # Plugin metadata and configuration
.cursor-plugin/       # Plugin metadata and configuration (version must match .claude-plugin/plugin.json)
.codex-plugin/        # Plugin metadata and configuration (version must match .claude-plugin/plugin.json)
```

## Agent Skills Specification

All skills MUST conform to the [Agent Skills specification](https://agentskills.io/specification.md).
Project-specific requirements below are the source of truth where they differ from the spec.

## Frontmatter

New skills go in `<skill-name>/SKILL.md`. Each file requires YAML frontmatter.
This project does **not** use `openclaw` metadata.

| Field            | Required         | Constraints                                                                                                                                       |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`           | Spec-required    | 1–64 chars. Lowercase `a-z`, digits, hyphens. No leading/trailing/consecutive hyphens. Must match parent directory name.                          |
| `description`    | Spec-required    | 1–1024 chars. Must include a "Use when" or "Apply when" trigger clause. Must contain the word `GitLab`.                                           |
| `license`        | Project-required | `MIT`                                                                                                                                             |
| `compatibility`  | Project-required | Base: `Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated.` Extend when the skill has additional requirements. |
| `metadata`       | Project-required | Must include `author` (string) and `version` (semver `a.b.c`, e.g. `"1.0.0"`). No `openclaw` block.                                               |
| `user-invocable` | Project-required | Boolean. `true` for slash-command skills, `false` for contextual auto-trigger.                                                                    |
| `allowed-tools`  | Project-required | Space-delimited list. See [Allowed Tools](#allowed-tools).                                                                                        |

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
description: "...Not for merge requests (→ See codeskine/gitlab-workflow@gitlab-review)."
```

The cross-reference format is `→ See <npm-package-name>@<skill-name>`, where the package
name matches the `"name"` field in `.claude-plugin/plugin.json`. Use it in the description
whenever two skills share overlapping trigger phrases — it tells the model exactly where to
route the request instead.

## Allowed Tools

Every skill MUST declare an `allowed-tools` field. Start from the **default set** and add
skill-specific extras as needed.

**Default set** (include in every skill):

```
Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
```

**Skill-specific extras:**

| Extra tool  | When to add                                           |
| ----------- | ----------------------------------------------------- |
| `WebFetch`  | Skills that fetch external documentation or resources |
| `WebSearch` | Skills requiring research or external discovery       |

## Skill Body

The body contains step-by-step workflow instructions. Use `references/` files for depth
(referenced via relative links from SKILL.md). Keep references one level deep — avoid
deeply nested chains.

### Token budgets

- **~100 tokens per description** — loaded at startup for all skills
- **< 2,500 tokens per SKILL.md** — project recommendation
- **< 5,000 tokens per SKILL.md** — spec limit
- **< 500 lines per SKILL.md** — move detailed content to `references/`

A lean SKILL.md is better. Stay well below limits when possible.

### Mandatory invariants

Four invariants apply to every skill in this project. Violating any of them is a defect.

**1. Draft gate**

Every skill MUST present the complete artifact draft in chat and wait for explicit user
confirmation before executing any `glab` command. The confirmation prompt must include title,
labels, and milestone. If the user requests changes, apply them and re-present the draft.
Repeat until approved.

**2. Snippet policy**

Every artifact that references code MUST include fenced code blocks of 5–20 lines per
significant point, with exact `path/file.ext` line N citation. Use language-appropriate
syntax highlighting.

**3. Language-agnostic templates**

Template files define structure — sections, ordering, checklist shape — not language.
Section headings and prose in generated artifacts follow the user's active language at
runtime. No language is hardcoded. Existing templates remain valid; new templates must not
hardcode any language.

**4. No duplication**

Workflow logic (steps, conditions, commands) lives exclusively in `SKILL.md`. Structure and
content shape live exclusively in `templates/`. Never copy SKILL.md instructions into
template files.

### Top-of-body directives (optional)

These directives go before the first heading, in this order:

| Directive         | Format                                                    | When to include                                               |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| **Persona**       | `**Persona:** You are a <role>. <mindset>.`               | Skills with a defined analytical or generative domain         |
| **Thinking mode** | `**Thinking mode:** Use \`ultrathink\` for <task>.`       | Deep analysis tasks                                           |
| **Modes**         | `**Modes:**` section listing distinct invocation contexts | Skills with multiple execution paths (draft, review, publish) |

All three are optional. Most skills in this project are procedural and need none.

## Workflows

### Working in worktrees

All implementation work MUST happen in a git worktree under `.claude/worktrees/`. Never
work directly on a checked-out branch.

Before starting any task, propose a branch name and ask the developer to confirm. Run
`git worktree list` first — if an existing worktree covers the same skill or topic, suggest
reusing it.

### Adding a new sub-skill

1. Create `<name>/SKILL.md` with all project-required frontmatter fields.
2. Create `<name>/assets/<type>.md` for each artifact type the skill handles.
3. Optionally create `<name>/references/` for deep documentation.
4. Add `"<name>"` to the `skills` array in `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, and `.codex-plugin/plugin.json`.
5. Run the description quality check: contains `GitLab`, has "Use when" trigger clause,
   no over-triggering patterns, no `openclaw` block.

### After updating a skill

After making changes, suggest the following as next steps. Do NOT execute automatically.

1. Format markdowns: `npx prettier --write "**/*.md"`
2. Measure token counts:
   - Description: `awk 'NR==1 && /^---$/{found=1; next} found && /^---$/{exit} found && /^description:/{print}' <name>/SKILL.md | tiktoken-cli`
   - SKILL.md body: `tiktoken-cli <name>/SKILL.md`
3. Increment `metadata.version` in the changed SKILL.md.
4. Bump `version` in `package.json`.
