---
name: gitlab-issue
description: "GitLab issue author. Use when the user asks to open a bug report,
  feature request, technical debt item, or documentation issue on GitLab via glab.
  Apply when the user says 'create an issue', 'report a bug', 'track tech debt',
  or 'propose a feature'. Not for merge requests (→ See codeskine/gitlab-author-skills@gitlab-mr)
  or milestones (→ See codeskine/gitlab-author-skills@gitlab-milestone)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0-rc.1"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab issue author

**Modes:**

- **Create** — generate a new issue from context and publish via `glab issue create`
- **Transition** — change the lifecycle state of an existing issue via `glab issue edit`

## Supported types

| Type             | Template                                             | Default label          |
| ---------------- | ---------------------------------------------------- | ---------------------- |
| `bug`            | [assets/bug.md](assets/bug.md)                       | `type::bug`            |
| `feature`        | [assets/feature.md](assets/feature.md)               | `type::feature`        |
| `technical-debt` | [assets/technical-debt.md](assets/technical-debt.md) | `type::technical-debt` |
| `documentation`  | [assets/documentation.md](assets/documentation.md)   | `type::documentation`  |

Default labels are starting points. Override with `--label` when the project uses different scoped labels.

## Create workflow

### 1. Identify the issue type

The user must specify the type in the prompt (e.g. _"create a bug issue for..."_, _"open a technical debt on..."_). If missing, ask once:

> "What type of issue do you want to open? bug / feature / technical-debt / documentation"

### 2. Load the template

Read only `assets/<type>.md` for the chosen type.

### 3. Explore context

**Automatic git extraction** (silent):

```bash
git log --oneline -20        # recent work area
git diff HEAD                # files and symbols involved
```

For `bug` or `technical-debt`, also run:

```bash
git blame <file> -L <start>,<end>   # author and date of affected lines
```

**Codebase exploration:** Use `Read`, `Grep`, `Glob` to open identified files, resolve symbolic references (function name, struct, package → `file:line`), and find relevant callers when useful for diagrams.

**Snippet policy:** Include fenced code blocks of 5–20 lines per significant point, with exact `path/file.ext` line N citation. Use language-appropriate syntax highlighting.

Context gathering is silent — no intermediate output. Everything converges in the draft.

### 4. Discover labels and milestone

```bash
glab label list              # discover real project labels before suggesting
glab milestone list --state active
```

Select the most relevant active milestone based on branch name, label, or issue type. If none fits, leave empty. Suggest `workflow::ready` as the initial lifecycle label alongside the type label.

### 5. Apply diagram policy

Decide whether to include a diagram and which pattern to use, then generate it.

→ Policy table and reusable patterns: [references/mermaid-diagrams.md](references/mermaid-diagrams.md)

### 6. Draft gate

**Do not publish yet.** Present the complete draft in chat with all template sections filled in. Include the proposed title and labels.

Wait for explicit confirmation:

> "Draft ready. Shall I create the issue on GitLab with title '<title>', labels `<labels>`, milestone `<milestone|none>`? (yes / changes / cancel)"

If the user requests changes, apply them and re-present the draft. Repeat until approved.

### 7. Publish via glab

After explicit approval:

1. Write the approved draft to a temp file: `/tmp/issue-<type>-<slug>.md` (slug = first 5–7 tokens of the title, kebab-case)
2. Run:

```bash
glab issue create \
  --title "<title>" \
  --label "<type-label>,workflow::ready" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/issue-<type>-<slug>.md)"
```

Optional flags (use when the user specifies):

```bash
  --assignee "<username>"      # discover members first: glab member list
  --confidential               # for sensitive issues
  --repo "<group/project>"     # cross-project creation
```

Anti-patterns:

- Do **not** use `--body` (that is a `gh` flag, not `glab`). Use `--description`.
- For descriptions with backticks or `$`, use `$(cat /tmp/file.md)` or heredoc with single-quoted delimiter `<< 'EOF'`.
- Use `glab issue note` to comment, **not** `glab issue comment`.

3. Return the created issue URL.

**Post-creation:** If the user mentioned related issues, link them:

```bash
glab issue link <new-issue-id> --target-id <related-id>
```

→ Full flag reference: [references/glab-issue-commands.md](references/glab-issue-commands.md)

## Transition workflow

Use when the user says "start working on #N", "lavora la issue #N", "resolve #N", or similar lifecycle phrases.

1. Read current issue state:
   ```bash
   glab issue view <N> --output json
   ```
2. Determine the current `workflow::` label.
3. Look up the valid transition in [references/issue-lifecycle.md](references/issue-lifecycle.md).
4. Warn if the requested transition is invalid (e.g. issue is already `workflow::in dev`).
5. Apply the transition:
   ```bash
   glab issue edit <N> --label "<new-state>" --unlabel "<current-state>"
   ```
6. Confirm the transition in chat.

Full state machine: [references/issue-lifecycle.md](references/issue-lifecycle.md)

## References

- Mermaid patterns: [references/mermaid-diagrams.md](references/mermaid-diagrams.md)
- Issue lifecycle: [references/issue-lifecycle.md](references/issue-lifecycle.md)
- Full glab flag reference: [references/glab-issue-commands.md](references/glab-issue-commands.md)
- Templates: [assets/bug.md](assets/bug.md), [assets/feature.md](assets/feature.md), [assets/technical-debt.md](assets/technical-debt.md), [assets/documentation.md](assets/documentation.md)
