# glab issue — Story / Epic Command Reference

→ See also: [../../shared/references/glab-command-index.md](../../shared/references/glab-command-index.md) for discovery commands, anti-patterns, and heredoc pattern.

## Create

Create a new story or epic issue:

```bash
glab issue create \
  --title "<title>" \
  --label "kind::<epic|story>,workflow::ready" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/story-body-<slug>.md)"
```

## Read

Read an existing issue (parent or child):

```bash
glab issue view <id> --output json
```

## Update description

Update the description of an existing parent issue (used by Add-Child, Sync, Link-MR workflows):

```bash
glab issue update <parent-id> --description "$(cat /tmp/story-<slug>.md)"
```

**Note:** `glab issue update` replaces the full description field. For metadata changes (labels, milestone, assignee), use `glab issue edit` instead.

## Link child to parent

```bash
glab issue link <child-id> --target-id <parent-id> --link-type relates_to
```

**Note:** `--link-type` accepts: `relates_to` (default), `blocks`, `is_blocked_by`.

## Read MR

Read a merge request (used in Link-MR workflow):

```bash
glab mr view <mr-id> --output json
```

## Extract MR commits

Fetch commit messages for a MR to parse `Closes #N` and `Related to #N` references:

```bash
glab api "projects/:fullpath/merge_requests/<mr-id>/commits"
```

**Note:** Each commit object has a `.message` field. Parse all `Closes #(\d+)` and `Related to #(\d+)` occurrences across all messages and deduplicate.
