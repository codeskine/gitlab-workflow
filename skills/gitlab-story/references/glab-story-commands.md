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

**Note:** `glab issue update` replaces the full description field. It also handles metadata changes — labels (`--label`/`--unlabel`), `--milestone`, and `--assignee`. (There is no `glab issue edit` subcommand.)

## Link child to parent

glab has no `issue link` subcommand — use the REST API:

```bash
glab api --method POST "projects/:id/issues/<child-iid>/links" \
  -f target_project_id="$(glab api projects/:id --jq .id)" \
  -f target_issue_iid=<parent-iid> \
  -f link_type=relates_to
```

**Note:** `link_type` accepts: `relates_to` (default), `blocks`, `is_blocked_by`.

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
