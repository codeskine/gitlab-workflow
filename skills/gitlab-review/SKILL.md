---
name: gitlab-review
description:
  "GitLab merge request author. Use when the user asks to create, draft,
  or publish a merge request on GitLab via glab. Applies to feature, bugfix, hotfix,
  and refactor branches. Not for issue creation (→ See codeskine/gitlab-workflow@gitlab-track)
  or milestones (→ See codeskine/gitlab-workflow@gitlab-plan)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.3.1"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

**Persona:** You are a software developer. You follow clean branching practices and aim to deliver well-structured changes through merge requests that are easy to review and integrate.

**Modes:**

- **Create** — generate a new MR from branch context and publish via `glab mr create`
- **Draft** — create a GitLab Draft MR (WIP, not ready to merge)

# GitLab review — merge request author

## Workflow

### 1. Detect branch and base

```bash
git branch --show-current
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'
```

If `git symbolic-ref` returns nothing, fall back to:

```bash
git remote show origin | grep 'HEAD branch' | awk '{print $NF}'
```

If still ambiguous, ask the user for the target branch explicitly.

**Guard:** if `git log <base>...HEAD --oneline` returns empty, warn the user and ask to verify the base branch before continuing.

### 2. Explore git context

```bash
git log <base-branch>...HEAD --oneline
git diff <base-branch>...HEAD --stat
git diff <base-branch>...HEAD
```

If `--stat` shows >20 modified files, limit snippets to ≤3 significant change areas and add a note: "large diff: only critical points highlighted."

### 3. Extract issue references from commit history

```bash
git log <base-branch>...HEAD --format="%B"
```

Parse all commit message bodies for `Closes #\d+` and `Related to #\d+` patterns.
Deduplicate the collected issue IDs. This list drives the closing section of the MR
description. If the list is empty, the quality gate will surface the warning before
the draft is presented — no early interrupt here.

### 4. Discover labels and milestone

```bash
glab label list
glab milestone list --state active
```

Select the most relevant active milestone. If none fits, leave empty. Use real project labels only — do not invent labels.

### 5. Compose the draft

Read `assets/mr.md` and fill in all sections with extracted context. Section headings and prose follow the **user's active language** — do not hardcode any language.

For the `{Changes}` section, include **5–20 line snippets** per significant point with exact `path/file.ext` line N citation and language-appropriate syntax highlighting.

Set the MR **title** with a conventional commit prefix matching the branch intent: `feat`, `fix`, `refactor`, `docs`, etc.

For the closing section of the MR description, use the aggregated issue list from step 3:

- Use `Closes #N, #N, #N ...` for branches prefixed `fix/` or `hotfix/` (issue will be closed on merge)
- Use `Related to #N, #N, #N...` for `feature/` branches (issue may remain open after merge)

Do not guess or invent issue references — use only what was extracted from commit messages.

Determine mode:

- **Draft MR**: user asked for WIP/Draft, or the branch is not ready to merge → include `--draft` at publish
- **Ready MR**: standard case → no `--draft`

Omit the `{Reviewer notes}` section if there are no design decisions or non-obvious choices to highlight.

### 6. Quality gate (silent)

Before presenting the draft, verify:

- At least one fenced code snippet per significant change area (5–20 lines, with `path/file.ext` line N citation)
- `Closes #N` / `Related to #N` closing list is populated (warn if empty — see step 3)
- Labels are present
- Milestone is present if the associated issue has a milestone
- `{Reviewer notes}` section is omitted if there are no non-obvious design decisions

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)

### 7. Draft gate

**Create `docs/gitlab/` if missing:**

```bash
mkdir -p docs/gitlab
```

Write the draft to `docs/gitlab/YYYY-MM-DD-<slug>.md` (slug = first 5–7 tokens of the title, kebab-case). Use today's date for `YYYY-MM-DD`. Omit the `type` field for MRs:

```markdown
---
kind: mr
title: "<title>"
labels: "<labels>"
milestone: "<milestone or empty>"
status: draft
created_at: <YYYY-MM-DD>
---

<body>
```

**Do not publish yet.** Present the confirmation in chat referencing the file path:

> "Draft saved to `docs/gitlab/<YYYY-MM-DD-slug>.md`. Open it for a full review, then confirm: publish to GitLab with title '<title>', labels `<labels>`, milestone `<milestone|none>`? (yes / changes / cancel)"

If the user requests changes, update the file in `docs/gitlab/` and re-present. Repeat until approved.

### 8. Publish via glab

After explicit approval:

1. Strip the YAML frontmatter and publish:

```bash
awk 'BEGIN{n=0} /^---$/{n++; next} n==2{print}' \
  docs/gitlab/YYYY-MM-DD-<slug>.md > /tmp/mr-body-<slug>.md

glab mr create \
  --title "<title>" \
  --label "<labels>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/mr-body-<slug>.md)" \
  --source-branch "<current-branch>" \
  --target-branch "<base-branch>"
```

2. After `glab` returns the MR URL, update `docs/gitlab/YYYY-MM-DD-<slug>.md` frontmatter in-place — replace `status: draft` with:

```yaml
status: published
gitlab_url: <returned-url>
published_at: <YYYY-MM-DD>
```

Optional flags — add when the user specifies or context makes them appropriate:

```bash
  --assignee "<username>"        # discover: glab member list
  --reviewer "<username>"        # discover: glab member list
  --remove-source-branch         # common project convention
  --squash                       # squash on merge
  --draft                        # Draft/WIP MR
  --repo "<group/project>"       # cross-project creation
```

3. Return the created MR URL.

→ Full flag reference: [references/glab-mr-commands.md](references/glab-mr-commands.md)

### 9. Post-creation

If the MR closes or is related to an issue, offer to update its workflow state. Before
running the command, confirm with the user:

> "Shall I move issue #N from workflow::in dev to workflow::in review? (yes / skip)"

On confirmation:

```bash
glab issue update <N> --label "workflow::in review" --unlabel "workflow::in dev"
```

→ Full state machine: [references/mr-lifecycle.md](references/mr-lifecycle.md)

## References

- Template: [assets/mr.md](assets/mr.md)
- Full glab flag reference: [references/glab-mr-commands.md](references/glab-mr-commands.md)
- MR lifecycle: [references/mr-lifecycle.md](references/mr-lifecycle.md)
