---
name: gitlab-story
description:
  "GitLab story and epic author. Use when the user asks to create a story,
  epic, or parent issue on GitLab, add child issues to an existing story or epic,
  sync child issue status in a parent description table, or link a merge request to
  a parent issue. Not for leaf issues (bug, feature, tech-debt →
  See codeskine/gitlab-workflow@gitlab-track) or milestones
  (→ See codeskine/gitlab-workflow@gitlab-plan)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.1.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab story — epic and story hierarchy author

**Modes:**

- **Create** — create a parent issue of type `epic` or `story`
- **Add-Child** — add child issues to an existing parent and update the children table
- **Sync** — refresh the children table with current issue state from GitLab
- **Link-MR** — attach a merge request reference to a parent issue

## Create workflow

### 1. Identify type and title

The user must specify:

- Type: `epic` (cross-sprint container) or `story` (single-sprint deliverable)
- Title: a concise goal statement

If either is missing, ask once.

### 2. Explore context (silent)

```bash
glab label list
glab milestone list --state active
```

Select the most relevant active milestone. If none fits, leave empty without asking.

### 3. Compose the draft

Read `assets/story.md` and fill in all sections with extracted context. Section headings
and prose follow the **user's active language** — do not hardcode any language.

Initialize the children table with the header and a single placeholder row:

```
| # | Title | Type | Status | MR |
|---|-------|------|--------|----|
| — | — | — | — | — |
```

### 4. Quality gate (silent)

Before presenting the draft, verify:

- Type is `epic` or `story` → mapped to label `type::epic` or `type::story`
- Children table header is present and correctly formatted
- No unfilled placeholders (`TBD`, `TODO`, `<...>`) in any section

Fix violations automatically. Do not output the checklist.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)

### 5. Draft gate

**Do not publish yet.** Present the complete draft in chat with title and labels.

> "Draft ready. Shall I create this story on GitLab with title '<title>',
> labels `<labels>`, milestone `<milestone|none>`?
> (yes / changes / cancel)"

If the user requests changes, apply them and re-present. Repeat until approved.

### 6. Publish

1. Write the approved draft to `/tmp/story-<slug>.md`
   (slug = first 5–7 tokens of the title, kebab-case)
2. Run:

```bash
glab issue create \
  --title "<title>" \
  --label "type::story,workflow::ready" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/story-<slug>.md)"
```

Use `--label "type::epic,workflow::ready"` when type is `epic`. Return the created issue URL.

Anti-patterns:

- Do **not** use `--body` (that is a `gh` flag). Use `--description`.
- For descriptions with backticks or `$`, always use `$(cat /tmp/file.md)`.
- Use `glab issue note` to comment, **not** `glab issue comment`.

## Add-Child workflow

### 1. Identify parent and children

User provides:

- Parent issue ID
- Children: existing issue IDs (e.g. `#12, #14`) **or** new issue descriptions (title + type)

### 2. Resolve each child

**For existing IDs:**

```bash
glab issue view <id> --output json
```

Extract: `.iid`, `.title`, `.labels[]` (find `type::*` and `workflow::*`), `.web_url`.

**For new issues:**

Create a minimal issue:

```bash
glab issue create \
  --title "<child-title>" \
  --label "<type-label>,workflow::ready" \
  --description "<one-paragraph description>"
```

Retrieve the IID and URL from the output. The user can enrich the issue later with
`gitlab-track`.

### 3. Link each child to the parent

```bash
glab issue link <child-id> --target-id <parent-id> --link-type relates_to
```

Run for each child.

### 4. Read current parent and build updated description

```bash
glab issue view <parent-id> --output json
```

Parse the current description:

- Locate the `| # | Title |` table
- Append one new row per child using the format in
  [references/children-table.md](references/children-table.md)

Write the full updated description to `/tmp/story-<slug>.md`.

### 5. Draft gate

Present the updated children table only. Wait for confirmation:

> "Shall I update issue #<parent-id> ('<parent-title>') to add <N> child issue(s)? (yes / changes / cancel)"

### 6. Publish update

```bash
glab issue update <parent-id> --description "$(cat /tmp/story-<slug>.md)"
```

## Sync workflow

### 1. Identify the parent

User provides parent ID, or infer from current branch using the `fix/N-` / `feature/N-`
pattern (defined in `gitlab-track`). If ambiguous, ask once.

### 2. Read the parent

```bash
glab issue view <parent-id> --output json
```

Extract child issue IDs by parsing the `| # | Title |` table:
match `\[#(\d+)\]` in each data row.

### 3. Fetch each child's current state

```bash
glab issue view <child-id> --output json
```

Extract: `.state` (`opened`/`closed`), `workflow::*` label.
Do not change the `MR` column (preserve whatever Link-MR set).

### 4. Rebuild the table

Reconstruct each row in original order with updated `Status`.

→ Status mapping: [references/children-table.md](references/children-table.md)

Write the full updated description to `/tmp/story-<slug>.md`.

### 5. Draft gate

Show a before/after comparison of the table rows that changed. Wait for confirmation:

> "Shall I sync the children table for issue #<parent-id> ('<parent-title>')? (yes / cancel)"

### 6. Publish update

```bash
glab issue update <parent-id> --description "$(cat /tmp/story-<slug>.md)"
```

## Link-MR workflow

### 1. Identify parent and MR

User provides parent issue ID + MR number.

### 2. Read the MR

```bash
glab mr view <mr-id> --output json
```

Extract: `.title`, `.web_url`. Fetch commit message bodies to parse `Closes #N` /
`Related to #N` patterns — these are the child issues this MR references.

```bash
glab api "projects/:fullpath/merge_requests/<mr-id>/commits"
```

Each commit object has a `.message` field. Parse all `Closes #(\d+)` and
`Related to #(\d+)` occurrences across all messages. Deduplicate the result.

### 3. Update the parent description

Read the current parent description:

```bash
glab issue view <parent-id> --output json
```

Apply two changes:

1. **Related MR section:** add or replace the `## {Related MR}` line with:
   `[!<mr-id>](<mr-url>) — <mr-title>`
2. **MR column in table:** for each child issue found in step 2, set its `MR` column to
   `!<mr-id>`. Rows not referenced by the MR keep their existing `MR` value.

Write the full updated description to `/tmp/story-<slug>.md`.

### 4. Draft gate

Present the full updated description. Wait for confirmation:

> "Shall I update issue #<parent-id> ('<parent-title>') to reference MR !<mr-id>? (yes / changes / cancel)"

### 5. Publish update

```bash
glab issue update <parent-id> --description "$(cat /tmp/story-<slug>.md)"
```

## References

- Template: [assets/story.md](assets/story.md)
- Children table spec: [references/children-table.md](references/children-table.md)
- Quality standard: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)
