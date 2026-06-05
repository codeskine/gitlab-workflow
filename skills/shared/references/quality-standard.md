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
- [ ] Labels include at least one `type::*` label and `workflow::ready` (→ See [label-registry.md](label-registry.md))
- [ ] Milestone suggested if an active one fits; left empty without asking if none fits (e.g. hotfix)
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

## Story / Epic (`gitlab-story`)

- [ ] Type is `epic` or `story` → correct `kind::*` label applied (→ See [label-registry.md](label-registry.md))
- [ ] Label `workflow::ready` is present on the parent issue
- [ ] Children table header `| # | Title | Type | Status | MR |` is present in the description
- [ ] No placeholder `—` in `Title` or `Type` columns when data rows exist
- [ ] No unfilled placeholders (`TBD`, `TODO`, `<...>`) in any section
