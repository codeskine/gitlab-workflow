# glab mr — Full Command Reference

## Core create command

```bash
glab mr create \
  --title "<title>" \
  --label "<labels>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/mr-<slug>.md)" \
  --source-branch "<branch>" \
  --target-branch "<branch>"
```

## Complete flag table — `glab mr create`

| Flag                     | Value                   | When to use                                                                   |
| ------------------------ | ----------------------- | ----------------------------------------------------------------------------- |
| `--title`                | string                  | Required. MR title.                                                           |
| `--label`                | comma-separated         | Labels to apply. Comma-separate multiple: `"type::feature,workflow::review"`. |
| `--milestone`            | string                  | Milestone title or ID.                                                        |
| `--description`          | string or `$(cat file)` | MR body. Prefer `$(cat /tmp/file.md)` for multi-line content.                 |
| `--source-branch`        | branch name             | Source branch. Defaults to current branch if omitted.                         |
| `--target-branch`        | branch name             | Target branch. Defaults to project default branch.                            |
| `--assignee`             | username                | Assign to a project member. Discover members first (see below).               |
| `--reviewer`             | username                | Request a review. Discover members first (see below).                         |
| `--draft`                | flag (no value)         | Create as a Draft (WIP) MR — cannot be merged until removed.                  |
| `--remove-source-branch` | flag (no value)         | Delete source branch after merge (common project convention).                 |
| `--squash`               | flag (no value)         | Squash commits when merging.                                                  |
| `--repo`                 | group/project           | Cross-project creation. Requires authentication for the target project.       |

## Discovery commands

Run before suggesting labels, assignees, reviewers, or milestones:

```bash
# Discover project labels
glab label list

# Discover project members (for --assignee / --reviewer)
glab member list

# List open MRs (for context)
glab mr list --state opened
```

## Editing an existing MR

```bash
glab mr edit <id> \
  --title "<new-title>" \
  --label "<add-label>" \
  --unlabel "<remove-label>" \
  --milestone "<milestone>" \
  --ready                          # remove Draft status
  --draft                          # set Draft status
```

## Viewing an MR

```bash
glab mr view <id>
glab mr view <id> --output json
glab mr view                       # current branch's MR
```

## Adding a comment

```bash
glab mr note <id> --message "<comment>"
# Use this — NOT glab mr comment (does not exist)
```

## Merging

```bash
glab mr merge <id> \
  --squash \
  --remove-source-branch \
  --rebase
```

## Anti-patterns

| Wrong                             | Correct                               | Why                                                               |
| --------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `--body "..."`                    | `--description "..."`                 | `--body` is a GitHub CLI (`gh`) flag; `glab` uses `--description` |
| Inline description with backticks | `--description "$(cat /tmp/file.md)"` | Shell expansion breaks on backticks and unquoted `$`              |
| `glab mr comment <id>`            | `glab mr note <id> --message "..."`   | `comment` is not a valid `glab mr` subcommand                     |
| `--description "multi\nline"`     | Write to file, use `$(cat file)`      | Shell quoting fails on embedded newlines                          |

## Heredoc pattern

Use when the description contains backticks, `$` variables, or multi-line content:

```bash
cat << 'EOF' > /tmp/mr-feat-my-feature.md
## {Summary}

Content with `backticks` and $variables is safe inside a single-quoted heredoc.
EOF

glab mr create \
  --title "feat(scope): my feature" \
  --label "type::feature,workflow::review" \
  --description "$(cat /tmp/mr-feat-my-feature.md)"
```
