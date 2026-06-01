---
name: gitlab-track
description: "GitLab issue author. Use when the user asks to open a bug report,
  feature request, technical debt item, or documentation issue on GitLab via glab.
  Apply when the user says 'create an issue', 'report a bug', 'track tech debt',
  or 'propose a feature'. Not for merge requests (→ See codeskine/gitlab-workflow@gitlab-review)
  or milestones (→ See codeskine/gitlab-workflow@gitlab-plan)."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Bash(glab:*) Agent AskUserQuestion
---

# GitLab track — issue author

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

Select the most relevant active milestone based on branch name, label, or issue type. If a
milestone fits, suggest it. If none fits (e.g. hotfix, out-of-sprint task), leave it empty
without asking — not every issue belongs to a milestone.

Suggest `workflow::ready` as the initial lifecycle label alongside the type label.

### 5. Apply diagram policy

Decide whether to include a diagram and which pattern to use, then generate it.

→ Policy table and reusable patterns: [references/mermaid-diagrams.md](references/mermaid-diagrams.md)

### 6. Quality gate (silent)

Before presenting the draft, verify:

- Title ≥ 5 words and not generic (`Fix bug` alone fails; `Fix nil pointer in user handler` passes)
- At least one fenced code snippet (5–20 lines) for `bug` and `technical-debt` types
- Labels include at least `type::*` + `workflow::ready`
- No placeholder text (`TBD`, `TODO`, `<...>`) in any section

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)

### 7. Draft gate

**Create `docs/gitlab/` if missing:**

```bash
mkdir -p docs/gitlab
```

Write the draft to `docs/gitlab/YYYY-MM-DD-<slug>.md` (slug = first 5–7 tokens of the title, kebab-case). Use today's date for `YYYY-MM-DD`:

```markdown
---
kind: issue
type: <type>
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
5. Present the planned transition for confirmation before executing:

   > "Shall I move issue #N from `<current-state>` to `<new-state>`? (yes / cancel)"

6. Apply the transition on confirmation:
   ```bash
   glab issue edit <N> --label "<new-state>" --unlabel "<current-state>"
   ```
   Report the applied change in chat.
7. **Branch setup (only when transitioning to `workflow::in dev`):** Offer two options:

   > "Ready to start development. How do you want to proceed?
   > A) Create branch `<type>/N-<short-title>` (e.g. `fix/87-nil-pointer-handler`)
   > B) Stay on current branch `<current-branch>`"

   If option A: run `git checkout -b <branch-name>` and confirm the new branch in chat.
   If option B: continue without branch change.

   Branch name is auto-derived: type from issue label (`type::bug` → `fix`, `type::feature` →
   `feature`, `type::technical-debt` → `refactor`, `type::documentation` → `docs`), N from
   issue ID, short-title from the first 3–4 significant words of the issue title in kebab-case.

Full state machine: [references/issue-lifecycle.md](references/issue-lifecycle.md)

## References

- Mermaid patterns: [references/mermaid-diagrams.md](references/mermaid-diagrams.md)
- Issue lifecycle: [references/issue-lifecycle.md](references/issue-lifecycle.md)
- Full glab flag reference: [references/glab-issue-commands.md](references/glab-issue-commands.md)
- Templates: [assets/bug.md](assets/bug.md), [assets/feature.md](assets/feature.md), [assets/technical-debt.md](assets/technical-debt.md), [assets/documentation.md](assets/documentation.md)
