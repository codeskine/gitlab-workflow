# glab mr — Full Command Reference

→ See also: [../../shared/references/glab-command-index.md](../../shared/references/glab-command-index.md) for discovery commands, anti-patterns, and heredoc pattern.

## Contents

- [Core create command](#core-create-command)
- [Complete flag table — glab mr create](#complete-flag-table--glab-mr-create)
- [Editing an existing MR](#editing-an-existing-mr)
- [Viewing an MR](#viewing-an-mr)
- [Adding a comment](#adding-a-comment)
- [Merging](#merging)

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

## Editing an existing MR

```bash
glab mr update <id> \
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
