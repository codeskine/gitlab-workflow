---
title: glab Command Index
---

# glab Command Index

Centralized reference for `glab` commands used across all skills. Use these patterns when
implementing discovery, output, and artifact creation workflows.

## Discovery

Run these commands silently to populate dynamic fields (labels, milestones, assignees) before
presenting a draft to the user:

```bash
glab label list                          # Discover project labels
glab milestone list --state active       # Active milestones only
glab milestone list                      # All milestones (closed + active)
glab api "projects/:fullpath/members"    # Project members (for --assignee / --reviewer)
glab issue list                          # Open issues — defaults to open if --closed not used
glab mr list                             # Open merge requests (defaults to open)
```

To find a milestone ID by title:

```bash
glab milestone list --output json | jq '.[] | select(.title == "<title>") | .id'
```

## Output machine-readable

Use `--output json` for parsing artifact data in scripts:

```bash
glab issue view <id> --output json       # Full issue data
glab mr view <id> --output json          # Full merge request data
glab milestone list --output json        # All milestones as JSON array
```

## Anti-patterns

| Wrong                                  | Correct                                                                                                     | Why                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--body "..."`                         | `--description "..."`                                                                                       | `--body` is a `gh` (GitHub CLI) flag; `glab` uses `--description`                              |
| `glab issue comment <id>`              | `glab issue note <id> --message "..."`                                                                      | `comment` is not a valid `glab issue` subcommand                                               |
| `glab mr comment <id>`                 | `glab mr note <id> --message "..."`                                                                         | `comment` is not a valid `glab mr` subcommand                                                  |
| `glab issue edit <id>`                 | `glab issue update <id>`                                                                                    | `edit` is not a valid subcommand; `update` handles title/labels/milestone/assignee/description |
| `glab mr edit <id>`                    | `glab mr update <id>`                                                                                       | `edit` is not a valid subcommand; `update` handles title/labels/milestone/`--ready`/`--draft`  |
| `glab issue link <id> --target-id <n>` | `glab api --method POST "projects/:id/issues/<iid>/links" -f target_project_id=... -f target_issue_iid=<n>` | there is no `issue link` subcommand; use the REST API                                          |
| `glab milestone close/reopen <id>`     | `glab milestone edit <id> --state close` / `--state activate`                                               | there is no `close`/`reopen` milestone subcommand                                              |
| inline description with backticks      | `--description "$(cat /tmp/file.md)"`                                                                       | shell expansion breaks on backticks and unquoted `$`                                           |
| `--description "multi\nline"`          | write to file, use `$(cat file)`                                                                            | shell quoting fails on embedded newlines                                                       |

## Heredoc pattern

For multi-line descriptions with backticks, `$` variables, or literal newlines, use a
single-quoted heredoc:

```bash
cat << 'EOF' > /tmp/<artifact>-<slug>.md
## {Section}

Content with `backticks` and $variables is safe inside a single-quoted heredoc.
EOF

glab <command> --description "$(cat /tmp/<artifact>-<slug>.md)"
```

The single-quoted `<< 'EOF'` delimiter prevents shell expansion. Use this pattern whenever
the description contains backticks, variables, or multi-line content.
