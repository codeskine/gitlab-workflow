---
name: gitlab-mr
description:
  "GitLab merge request author. Use when the user asks to create, draft,
  or publish a merge request on GitLab via glab. Applies to feature, bugfix, hotfix,
  and refactor branches. Not for issue creation (→ See codeskine/gitlab-author-skills@gitlab-issue)
  or milestones (→ See codeskine/gitlab-author-skills@gitlab-milestone)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab merge request author

**Modes:**

- **Create** — generate a new MR from branch context and publish via `glab mr create`
- **Draft** — create a GitLab Draft MR (WIP, not ready to merge)

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

Extract issue reference from branch name:

| Branch pattern     | Reference clause  |
| ------------------ | ----------------- |
| `fix/123-desc`     | `Closes #123`     |
| `feature/456-name` | `Related to #456` |
| no pattern         | omit              |

**Guard:** if `git log <base>...HEAD --oneline` returns empty, warn the user and ask to verify the base branch before continuing.

### 2. Explore git context

```bash
git log <base-branch>...HEAD --oneline
git diff <base-branch>...HEAD --stat
git diff <base-branch>...HEAD
```

If `--stat` shows >20 modified files, limit snippets to ≤3 significant change areas and add a note: "large diff: only critical points highlighted."

### 3. Discover labels and milestone

```bash
glab label list
glab milestone list --state active
```

Select the most relevant active milestone. If none fits, leave empty. Use real project labels only — do not invent labels.

### 4. Compose the draft

Read `assets/mr.md` and fill in all sections with extracted context. Section headings and prose follow the **user's active language** — do not hardcode any language.

For the `{Changes}` section, include **5–20 line snippets** per significant point with exact `path/file.ext` line N citation and language-appropriate syntax highlighting.

Set the MR **title** with a conventional commit prefix matching the branch intent: `feat`, `fix`, `refactor`, `docs`, etc.

Determine mode:

- **Draft MR**: user asked for WIP/Draft, or the branch is not ready to merge → include `--draft` at publish
- **Ready MR**: standard case → no `--draft`

Omit the `{Reviewer notes}` section if there are no design decisions or non-obvious choices to highlight.

### 5. Draft gate

**Do not publish yet.** Present the complete draft in chat with all sections filled in.

Wait for explicit confirmation:

> "Draft ready. Shall I create the MR on GitLab with title '<title>', labels `<labels>`, milestone `<milestone|none>`? (yes / changes / cancel)"

If the user requests changes, apply them and re-present the draft. Repeat until approved.

### 6. Publish via glab

After explicit approval:

1. Write the approved draft to a temp file: `/tmp/mr-<slug>.md` (slug = first 5–7 tokens of the title, kebab-case)
2. Run:

```bash
glab mr create \
  --title "<title>" \
  --label "<labels>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/mr-<slug>.md)" \
  --source-branch "<current-branch>" \
  --target-branch "<base-branch>"
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

Anti-patterns:

- Do **not** use `--body` (that is a `gh` flag). Use `--description`.
- For descriptions with backticks or `$`, always use `$(cat /tmp/file.md)`.
- Use `glab mr note` to comment, **not** `glab mr comment`.

3. Return the created MR URL.

→ Full flag reference: [references/glab-mr-commands.md](references/glab-mr-commands.md)

### 7. Post-creation (optional)

If the MR closes or is related to an issue, update its workflow state:

```bash
glab issue edit <N> --label "workflow::in review" --unlabel "workflow::in dev"
```

Confirm the transition in chat.

→ Full state machine: [references/mr-lifecycle.md](references/mr-lifecycle.md)

## References

- Template: [assets/mr.md](assets/mr.md)
- Full glab flag reference: [references/glab-mr-commands.md](references/glab-mr-commands.md)
- MR lifecycle: [references/mr-lifecycle.md](references/mr-lifecycle.md)
