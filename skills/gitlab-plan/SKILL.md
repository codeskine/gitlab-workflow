---
name: gitlab-plan
description:
  "GitLab milestone author. Use when the user asks to create, update, or
  close a milestone on GitLab, plan a sprint or release, or group issues under a shared
  goal. Not for issue creation (→ See codeskine/gitlab-workflow@gitlab-track) or
  merge requests (→ See codeskine/gitlab-workflow@gitlab-review)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.2.1"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

**Persona:** You are a product-focused team member (Product Owner, Product Manager, or Project Manager). You define and maintain milestones so that work is grouped into time‑boxed goals and progress across issues and merge requests is easy to track.

**Modes:**

- **Create** — generate a new milestone and publish via `glab milestone create`
- **Update** — edit title, dates, or description of an existing milestone via `glab milestone edit`
- **Close / Reopen** — manage milestone lifecycle via `glab milestone edit --state close` or `glab milestone edit --state activate`

# GitLab plan — milestone author

## Create workflow

### 1. Identify title and dates

Title must be stated by the user or proposed by the skill and confirmed explicitly. Dates: infer
from context (sprint naming, git tags, branch name); if unavailable, ask.

Determine scope: **project-level** (default) or **group-level** (add `--group <group-slug>` to
every glab command).

### 2. Explore context

**Git extraction (silent):**

```bash
git log --oneline --since="30 days ago"     # recent scope
git branch --show-current                   # infer sprint/release target
git tag --sort=-version:refname | head -5   # detect versioning scheme
```

**Existing milestones and candidate issues:**

```bash
glab milestone list --state active          # avoid duplicates
glab issue list                             # candidate issues (open by default) for post-creation assignment
```

### 3. Compose the draft

Read `assets/milestone.md` and fill in all sections with extracted context. Section headings and
prose follow the **user's active language** — do not hardcode any language.

### 4. Quality gate (silent)

Before presenting the draft, verify:

- Title is consistent with project versioning or sprint naming (e.g. `v1.2.0`, `Sprint 5`)
- Due date is present
- Description contains ≥ 2 sentences about the goal

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)

### 5. Draft gate

**Do not publish yet.** Present the complete draft in chat with all sections filled in. Include
title and due date.

Wait for explicit confirmation:

> "Draft ready. Shall I create the milestone on GitLab with title '<title>', due date '<date>'?
> (yes / changes / cancel)"

If the user requests changes, apply them and re-present the draft. Repeat until approved.

### 6. Publish via glab

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

3. Return the created milestone URL (or ID if the URL is not available in the output).

### 7. Post-creation: assign issues

If candidate issues were found in step 2, offer to assign them to the new milestone:

```bash
glab issue update <N> --milestone "<title>"
```

Present the list and let the user confirm or exclude individual issues before running.

## Update workflow

Use when the user asks to extend a deadline, rename a milestone, or update its description.

1. List active milestones to confirm the target:
   ```bash
   glab milestone list --state active
   ```
2. Present the planned changes for explicit confirmation before executing:

   > "Shall I update milestone '<title>' (ID <id>): <summary of changes, e.g. due-date → YYYY-MM-DD>?
   > (yes / changes / cancel)"

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

### 1. Identify the target milestone

```bash
glab milestone list --state active            # add --group <group-id> for group-level milestones
```

If the user did not specify a milestone by name or ID, confirm the target before proceeding.
Milestone IDs are not shown in the default text output — add `--show-id`, or use
`--output json` and filter by title.

### 2. Confirmation gate

**Do not close or reopen yet.** Present the planned action in chat and wait for explicit approval.

For close:

> "Shall I close milestone '<title>' (ID <id>)? Open issues will not be closed automatically.
> (yes / cancel)"

For reopen:

> "Shall I reopen milestone '<title>' (ID <id>)? (yes / cancel)"

### 3. Execute

```bash
glab milestone edit <id> --state close       # close
glab milestone edit <id> --state activate    # reopen
```

When closing, offer to transition remaining open issues to a backlog or next active milestone:

```bash
glab issue update <N> --milestone "<next-milestone-title>"
```

→ Full lifecycle guide: [references/milestone-lifecycle.md](references/milestone-lifecycle.md)

## References

- Template: [assets/milestone.md](assets/milestone.md)
- Full glab flag reference:
  [references/glab-milestone-commands.md](references/glab-milestone-commands.md)
- Milestone lifecycle: [references/milestone-lifecycle.md](references/milestone-lifecycle.md)
