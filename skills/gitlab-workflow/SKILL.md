---
name: gitlab-workflow
description: "GitLab workflow orchestrator. Use when the user asks a general GitLab
  question, needs help choosing the right action, or mentions GitLab without specifying
  issue, MR, milestone, story, or commit. Routes to: gitlab-plan (milestones/sprint),
  gitlab-track (issues), gitlab-story (epics/stories), gitlab-review (merge requests),
  gitlab-commit (commits). Also use when the user asks what this plugin can do."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.2.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab workflow orchestrator

This skill coordinates the full GitLab development lifecycle. Use it to route
ambiguous or compound requests to the right sub-skill.

## Routing table

| The user wants to… | Invoke |
|---|---|
| Plan a sprint, create or close a milestone | `gitlab-plan` |
| Open a bug, feature request, tech debt or documentation issue | `gitlab-track` |
| Create a story or epic, add child issues, sync story status | `gitlab-story` |
| Create or publish a merge request | `gitlab-review` |
| Commit staged changes with a conventional commit message | `gitlab-commit` |

## How to handle requests

**Single action** — if the request maps clearly to one row, invoke that skill directly.

**Compound request** — address actions in logical order: plan → track → commit → review.

**Ambiguous request** — ask one focused question to identify the task type, then route.

**"What can you do?"** — present the routing table above as a quick overview.
