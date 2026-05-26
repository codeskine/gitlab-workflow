# glab issue — Full Command Reference

## Core create command

```bash
glab issue create \
  --title "<title>" \
  --label "<labels>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/issue.md)"
```

## Complete flag table — `glab issue create`

| Flag                 | Value                                       | When to use                                                              |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `--title`            | string                                      | Required. Issue title.                                                   |
| `--label`            | comma-separated                             | Labels to apply. Comma-separate multiple: `"type::bug,workflow::ready"`. |
| `--milestone`        | string                                      | Milestone title or ID.                                                   |
| `--description`      | string or `$(cat file)`                     | Issue body. Prefer `$(cat /tmp/file.md)` for multi-line content.         |
| `--assignee`         | username                                    | Assign to a project member. Discover members first (see below).          |
| `--confidential`     | flag (no value)                             | Mark issue as confidential (visible only to project members).            |
| `--weight`           | integer                                     | Issue weight (1–10 or project-defined range).                            |
| `--due-date`         | YYYY-MM-DD                                  | Due date for the issue.                                                  |
| `--related-issue-id` | integer                                     | Link to a related issue at creation time.                                |
| `--link-type`        | `relates_to` \| `blocks` \| `is_blocked_by` | Type of relationship link (default: `relates_to`).                       |
| `--repo`             | group/project                               | Cross-project creation. Requires authentication for the target project.  |

## Discovery commands

Run before suggesting labels, assignees, or milestones:

```bash
# Discover project labels
glab label list

# Discover project members (for --assignee)
glab member list

# List open issues (for context or linking)
glab issue list --state opened
```

## Post-creation commands

```bash
# Link to a related issue after creation
glab issue link <issue-id> --target-id <related-id>
glab issue link <issue-id> --target-id <related-id> --link-type blocks

# Add a comment/note to an issue
glab issue note <issue-id> --message "<comment>"

# Edit labels or lifecycle state
glab issue edit <issue-id> --label "<new-label>" --unlabel "<old-label>"

# Close an issue
glab issue close <issue-id>
```

## Anti-patterns

| Wrong                             | Correct                                | Why                                                               |
| --------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `--body "..."`                    | `--description "..."`                  | `--body` is a GitHub CLI (`gh`) flag; `glab` uses `--description` |
| Inline description with backticks | `--description "$(cat /tmp/file.md)"`  | Shell expansion breaks on backticks and unquoted `$`              |
| `glab issue comment <id>`         | `glab issue note <id> --message "..."` | `comment` is not a valid `glab issue` subcommand                  |
| `--description "multi\nline"`     | Write to file, use `$(cat file)`       | Shell quoting fails on embedded newlines                          |

## Heredoc pattern

Use when the description contains backticks, `$` variables, or multi-line content:

```bash
cat << 'EOF' > /tmp/issue-bug-slug.md
## {Description}

Content with `backticks` and $variables is safe inside a single-quoted heredoc.
EOF

glab issue create \
  --title "Fix the thing" \
  --label "type::bug,workflow::ready" \
  --description "$(cat /tmp/issue-bug-slug.md)"
```
