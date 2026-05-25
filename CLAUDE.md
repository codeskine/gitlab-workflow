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

## Frontmatter

### Description quality

## Allowed Tools

## Skill Body

## Workflows
