# glab issue — Full Command Reference

→ See also: [../../shared/references/glab-command-index.md](../../shared/references/glab-command-index.md) for discovery commands, anti-patterns, and heredoc pattern.

## Core create command

```bash
glab issue create \
  --title "<title>" \
  --label "<labels>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/issue.md)"
```

## Complete flag table — `glab issue create`

| Flag              | Value                                       | When to use                                                              |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `--title`         | string                                      | Required. Issue title.                                                   |
| `--label`         | comma-separated                             | Labels to apply. Comma-separate multiple: `"type::bug,workflow::ready"`. |
| `--milestone`     | string                                      | Milestone title or ID.                                                   |
| `--description`   | string or `$(cat file)`                     | Issue body. Prefer `$(cat /tmp/file.md)` for multi-line content.         |
| `--assignee`      | username                                    | Assign to a project member. Discover members first (see below).          |
| `--confidential`  | flag (no value)                             | Mark issue as confidential (visible only to project members).            |
| `--weight`        | integer                                     | Issue weight (1–10 or project-defined range).                            |
| `--due-date`      | YYYY-MM-DD                                  | Due date for the issue.                                                  |
| `--linked-issues` | IIDs (comma-separated)                      | Link to related issues at creation time (by issue IID).                  |
| `--link-type`     | `relates_to` \| `blocks` \| `is_blocked_by` | Type of relationship link (default: `relates_to`).                       |
| `--repo`          | group/project                               | Cross-project creation. Requires authentication for the target project.  |

## Post-creation commands

```bash
# Link to a related issue after creation — glab has no `issue link` subcommand; use the REST API.
# link_type: relates_to (default) | blocks | is_blocked_by
glab api --method POST "projects/:id/issues/<issue-iid>/links" \
  -f target_project_id="$(glab api projects/:id --jq .id)" \
  -f target_issue_iid=<related-iid> \
  -f link_type=relates_to

# Add a comment/note to an issue
glab issue note <issue-id> --message "<comment>"

# Edit labels or lifecycle state (update handles labels, milestone, assignee, description)
glab issue update <issue-id> --label "<new-label>" --unlabel "<old-label>"

# Close an issue
glab issue close <issue-id>
```
