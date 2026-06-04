# glab milestone — command reference

→ See also: [../../shared/references/glab-command-index.md](../../shared/references/glab-command-index.md) for anti-patterns and heredoc pattern.

## Create

```bash
glab milestone create \
  --title "<title>" \
  --description "$(cat /tmp/milestone-<slug>.md)" \
  --start-date "<YYYY-MM-DD>" \
  --due-date "<YYYY-MM-DD>"
```

| Flag             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `--title`        | Milestone title (required)                              |
| `--description`  | Markdown body; use `$(cat file)` for multiline content  |
| `--start-date`   | Start date in `YYYY-MM-DD` format                       |
| `--due-date`     | Due date in `YYYY-MM-DD` format                         |
| `--group <slug>` | Create a group-level milestone instead of project-level |

## Edit

```bash
glab milestone edit <id> \
  --title "<new-title>" \
  --start-date "<YYYY-MM-DD>" \
  --due-date "<YYYY-MM-DD>"
```

Pass only flags for the fields being changed. `<id>` is the numeric milestone ID from
`glab milestone list`.

## List

```bash
glab milestone list --state active      # active milestones
glab milestone list --state closed      # closed milestones
glab milestone list --state all         # all milestones
glab milestone list --output json       # machine-readable, includes IDs
```

## Close / Reopen

```bash
glab milestone close <id>
glab milestone reopen <id>
```

## Common patterns

**Find milestone ID by title:**

```bash
glab milestone list --state active --output json | \
  jq '.[] | select(.title == "<title>") | .id'
```

**Assign an issue to a milestone:**

```bash
glab issue edit <issue-id> --milestone "<milestone-title>"
```

**List open issues in a milestone:**

```bash
glab issue list --milestone "<title>" --state opened
```
