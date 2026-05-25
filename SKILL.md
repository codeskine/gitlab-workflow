---
name: gitlab-author-skills
description: "GitLab artifact author. Use when the user asks to create or publish
  an issue, milestone, or merge request on GitLab via glab. Routes to the correct
  sub-skill: gitlab-issue for issues, gitlab-milestone for milestones,
  gitlab-mr for merge requests."
user-invocable: false
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "2.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# gitlab-author-skills

GitLab artifact authoring for Claude Code / AI coding agents. Routes to the correct sub-skill based on the artifact type requested.

## Available sub-skills

| Sub-skill                                    | Purpose                                                                           | Status    |
|----------------------------------------------|-----------------------------------------------------------------------------------|-----------|
| [`gitlab-issue`](./gitlab-issue)             | Bug reports, feature requests, technical debt, documentation issues.              | Available |
| [`gitlab-milestone`](./gitlab-milestone)     | Milestone with scope, deliverables and target dates.                              | Available |
| [`gitlab-mr`](./gitlab-mr)                   | Merge request descriptions with issue references and diff summary.                | Available |

Cross-cutting conventions (draft gate, snippet policy, language-agnostic templates, no duplication) are defined in [CLAUDE.md](../CLAUDE.md).