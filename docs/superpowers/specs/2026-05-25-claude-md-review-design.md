# CLAUDE.md Design Spec — gitlab-author-skills

**Date:** 2026-05-25
**Status:** Approved
**Author:** Stefano Veloccia

## Context

`gitlab-author-skills` is a Claude Code / Cursor Agent Skills plugin for authoring GitLab artifacts (issues, milestones, merge requests) and publishing them via the `glab` CLI. The project is transitioning from a private beta to open source.

No `CLAUDE.md` exists in the repository. This spec defines the content and structure for creating it from scratch.

## Goals

- Instruct Claude Code context efficiently (lean, token-conscious).
- Serve as human-readable onboarding documentation for contributors.
- Establish project-specific conventions that extend the Agent Skills specification.
- Encode four non-negotiable quality invariants.

## Non-goals

- Replacing or duplicating `SKILL.md` execution logic — workflow stays in sub-skill files.
- Mandating a language for generated artifacts (templates define structure; language is runtime-controlled).
- Implementing `openclaw` / ClawHub metadata — not required for this project.

## Reference

Structure and conventions adapted from [`samber/cc-skills-golang` CLAUDE.md](https://raw.githubusercontent.com/samber/cc-skills-golang/refs/heads/main/CLAUDE.md). Sections below map to that reference where applicable.

---

## Proposed Structure

```
## Project Overview
## Project Structure
## Agent Skills Specification
## Frontmatter
### Description quality
## Allowed Tools
## Skill Body
## Workflows
```

---

## Section Designs

### Project Overview

One paragraph. Covers:

- What the plugin does: authors GitLab artifacts (issue, milestone, MR) with structured templates, published via `glab`.
- Dual audience: users who install the skills into their projects, contributors who extend or improve the plugin.
- Open-source goal: high-quality, standardized GitLab workflow integration for agentic development.
- Language policy: artifacts are language-agnostic — templates define structure, language follows the user at runtime.

### Project Structure

Directory tree matching the actual layout. Key distinction from the `samber/cc-skills-golang` reference: skills live at root level, not under a `skills/` wrapper. No `.claude-plugin/`, `.cursor-plugin/`, or `gemini-extension.json` — the package manifest is `package.json`.

```
<skill-name>/       # one directory per sub-skill (gitlab-issue, gitlab-milestone, gitlab-mr)
  SKILL.md          # Required: frontmatter + workflow instructions
  templates/        # Required: one .md file per artifact type
  references/       # Optional: deep docs loaded on demand
SKILL.md            # Root orchestrator — sub-skill routing table
scripts/
  install.js        # npm CLI (gitlab-author) for installation
package.json        # Plugin manifest and install script entry point
```

### Agent Skills Specification

Single pointer: "All skills MUST conform to the [Agent Skills specification](https://agentskills.io/specification.md). Project-specific requirements below are the source of truth where they differ."

### Frontmatter

Required fields table — **no `openclaw` block**:

| Field            | Required         | Constraints                                                                                           |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `name`           | Spec-required    | 1–64 chars. Lowercase `a-z`, digits, hyphens. Must match parent directory name.                       |
| `description`    | Spec-required    | 1–1024 chars. Must include "Use when" or "Apply when" trigger clause. Must contain the word `GitLab`. |
| `license`        | Project-required | `MIT`                                                                                                 |
| `compatibility`  | Project-required | Base: `Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated.`        |
| `metadata`       | Project-required | `author` (string) + `version` (semver `a.b.c`). No `openclaw` block.                                  |
| `user-invocable` | Project-required | Boolean. `true` for slash-command skills, `false` for contextual auto-trigger.                        |
| `allowed-tools`  | Project-required | Space-delimited list. See Allowed Tools section.                                                      |

Example frontmatter block included (using a `gitlab-example` placeholder skill).

**Version discipline:** semver (`a.b.c`). New skills start at `1.0.0`. Developer must increment `metadata.version` on every change and bump `package.json` version before merge. Do not auto-increment — remind the developer as a next step.

#### Description quality

Same quality rules as the reference, adapted for GitLab domain:

- Every description MUST contain the word `GitLab` — skills must not fire on non-GitLab requests.
- Must include a "Use when" or "Apply when" trigger clause with specific scenarios.
- Avoid over-triggering phrases: "whenever using glab", "for any GitLab task".
- Avoid under-triggering: one-liners with no trigger context.
- Overlap between sub-skills: add `→ See` cross-references using `owner/repo@skill` notation.

Good/bad examples use `gitlab-issue`, `gitlab-mr`, `gitlab-milestone` as reference points.

### Allowed Tools

**Default set** (include in every sub-skill):

```
Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
```

Skill-specific extras table:

| Extra tool  | When to add                                  |
| ----------- | -------------------------------------------- |
| `WebFetch`  | Skills that fetch external docs or resources |
| `WebSearch` | Skills requiring research or discovery       |

### Skill Body

Four project-invariants, all mandatory:

1. **Draft gate** — Every skill MUST present the full artifact draft in chat and wait for explicit user confirmation (`si` / `modifiche` / `annulla` or equivalent) before executing any `glab` command. Non-negotiable. Violation = incomplete skill.

2. **Snippet policy** — Every artifact referencing code MUST include blocks of 5–20 lines per significant point, with exact `path/file.ext` line N citation. Use language-appropriate fenced code blocks.

3. **Language-agnostic templates** — Template files define structure only (sections, order, checklist shape). The language of section headings and prose follows the user's active language at runtime. No language is hardcoded as mandatory.

4. **No duplication** — Workflow logic (steps, conditions, commands) lives exclusively in `SKILL.md`. Structure and content shape live exclusively in `templates/`. Never repeat SKILL.md instructions inside template files.

Token budgets (same limits as reference):

- ~100 tokens per description (loaded at startup).
- < 2,500 tokens per SKILL.md (project recommendation).
- < 5,000 tokens per SKILL.md (spec limit).
- < 500 lines per SKILL.md — move depth to `references/`.

Top-of-body directives (all optional for this domain): Persona, Thinking mode, Modes.

### Workflows

Three subsections:

**Working in worktrees** — All implementation work MUST happen in a git worktree under `.claude/worktrees/`. Never work directly on the checked-out branch. Propose a branch name before starting, run `git worktree list` to check for reusable worktrees covering the same skill.

**Adding a new sub-skill** — Checklist:

1. Create `<name>/SKILL.md` with correct frontmatter (all project-required fields).
2. Create `<name>/templates/<type>.md` for each artifact type.
3. Optionally create `<name>/references/` for deep documentation.
4. Update root `SKILL.md` sub-skill table.
5. Add `"<name>"` to the `files` array in `package.json`.
6. Run description quality check (contains `GitLab`, has trigger clause, no over-triggering patterns).

**After updating a skill** — Checklist:

1. Format with `npx prettier --write "**/*.md"`.
2. Measure token counts for description, SKILL.md, and full directory.
3. Increment `metadata.version` in the changed SKILL.md.
4. Bump `version` in `package.json`.

---

## Decisions

| Decision              | Choice                 | Rationale                                                                    |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `openclaw` metadata   | Excluded               | Not required; adds tokens without value for this project scope               |
| Language of artifacts | Language-agnostic      | Templates define structure; language controlled at runtime                   |
| Skill location        | Root-level directories | Matches current layout; no `skills/` wrapper needed                          |
| Evaluation framework  | Excluded from v1       | Out of scope for initial CLAUDE.md; can be added later                       |
| Plugin config files   | `package.json` only    | No `.claude-plugin/` needed until multi-platform plugin manifest is required |
