---
name: gitlab-milestone
description:
  "GitLab milestone author. Use when the user asks to create, update, or
  close a milestone on GitLab, plan a sprint or release, or group issues under a shared
  goal. Not for issue creation (→ See codeskine/gitlab-author-skills@gitlab-issue) or
  merge requests (→ See codeskine/gitlab-author-skills@gitlab-mr)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0-rc.1"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab milestone author

**Modes:**

- **Create** — generate a new milestone and publish via `glab milestone create`
- **Update** — edit title, dates, or description of an existing milestone via `glab milestone edit`
- **Close / Reopen** — manage milestone lifecycle via `glab milestone close` or `glab milestone reopen`

## Create workflow

### 1. Identify title and dates

Title must be stated by the user or proposed by the skill and confirmed explicitly. Dates: infer
from context (sprint naming, git tags, branch name); if unavailable, ask.

Determine scope: **project-level** (default) or **group-level** (add `--group <group-slug>` to
every glab command).

### 2. Explore context

**Git extraction (silent):**

```bash
git log --oneline --since="30 days ago"    # recent scope
git branch --show-current                   # infer sprint/release target
git tag --sort=-version:refname | head -5   # detect versioning scheme
```

**Existing milestones and candidate issues:**

```bash
glab milestone list --state active          # avoid duplicates
glab issue list --state opened              # candidate issues for post-creation assignment
```

### 3. Compose the draft

Read `assets/milestone.md` and fill in all sections with extracted context. Section headings and
prose follow the **user's active language** — do not hardcode any language.

### 4. Draft gate

**Do not publish yet.** Present the complete draft in chat with all sections filled in. Include
title and due date.

Wait for explicit confirmation:

> "Draft ready. Shall I create the milestone on GitLab with title '<title>', due date '<date>'?
> (yes / changes / cancel)"

If the user requests changes, apply them and re-present the draft. Repeat until approved.

### 5. Publish via glab

After explicit approval:

1. Write the approved draft to a temp file: `/tmp/milestone-<slug>.md` (slug = first 5–7 tokens
   of title, kebab-case)
2. Run:

```bash
glab milestone create \
  --title "<title>" \
  --description "$(cat /tmp/milestone-<slug>.md)" \
  --start-date "<YYYY-MM-DD>" \
  --due-date "<YYYY-MM-DD>"
```

For group-level milestones, add `--group <group-slug>`.

Anti-patterns:

- Do **not** use `--body`. Use `--description`.
- For descriptions with backticks or `$`, always use `$(cat /tmp/file.md)`.

3. Return the created milestone URL (or ID if the URL is not available in the output).

### 6. Post-creation: assign issues

If candidate issues were found in step 2, offer to assign them to the new milestone:

```bash
glab issue edit <N> --milestone "<title>"
```

Present the list and let the user confirm or exclude individual issues before running.

## Update workflow

Use when the user asks to extend a deadline, rename a milestone, or update its description.

1. List active milestones to confirm the target:
   ```bash
   glab milestone list --state active
   ```
2. Present the planned changes for confirmation before executing.
3. Apply the update:
   ```bash
   glab milestone edit <id> \
     --title "<new-title>" \
     --start-date "<YYYY-MM-DD>" \
     --due-date "<YYYY-MM-DD>"
   ```
   Only pass flags for fields being changed.

→ Full flag reference: [references/glab-milestone-commands.md](references/glab-milestone-commands.md)

## Close / Reopen workflow

Use when a sprint ends or a milestone needs to be reopened after closure.

```bash
glab milestone close <id>
glab milestone reopen <id>
```

When closing, offer to transition remaining open issues to a backlog or next active milestone:

```bash
glab issue edit <N> --milestone "<next-milestone-title>"
```

→ Full lifecycle guide: [references/milestone-lifecycle.md](references/milestone-lifecycle.md)

## References

- Template: [assets/milestone.md](assets/milestone.md)
- Full glab flag reference:
  [references/glab-milestone-commands.md](references/glab-milestone-commands.md)
- Milestone lifecycle: [references/milestone-lifecycle.md](references/milestone-lifecycle.md)
