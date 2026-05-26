---
name: gitlab-commit
description:
  "GitLab commit author. Use when the user asks to create a commit, format a git
  commit message, or finalize staged changes on a GitLab project. Also triggers when the
  user says changes are done, work is complete, or signals readiness to save progress —
  even without explicitly saying 'commit'. Formats messages following Conventional Commits
  v1.0.0 with the GitLab issue ID as scope, extracted from the branch name. Not for merge
  requests (→ See codeskine/gitlab-workflow@gitlab-review) or issue creation
  (→ See codeskine/gitlab-workflow@gitlab-track)."
user-invocable: false
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires git."
metadata:
  author: codeskine
  version: "1.0.0"
allowed-tools: Read Edit Write Glob Grep Bash(git:*) Agent AskUserQuestion
---

# GitLab commit author

## Workflow

### 1. Guard: verify staged changes

```bash
git diff --staged --stat
```

If nothing is staged, stop and tell the user. Do not auto-stage — staging is an explicit
choice.

### 2. Explore context (silent)

```bash
git branch --show-current          # extract type and issue ID
git diff --staged --stat           # infer scope from changed paths
git log --oneline -5               # match the project's existing commit style
```

### 3. Extract issue ID and type from branch name

| Branch pattern                         | type            | issue         |
| -------------------------------------- | --------------- | ------------- |
| `fix/123-description`                  | `fix`           | `#123`        |
| `hotfix/123-description`               | `fix`           | `#123`        |
| `bugfix/123-description`               | `fix`           | `#123`        |
| `feature/456-name`                     | `feat`          | `#456`        |
| `refactor/789-cleanup`                 | `refactor`      | `#789`        |
| `docs/101-readme`                      | `docs`          | `#101`        |
| `test/202-coverage`                    | `test`          | `#202`        |
| `perf/303-caching`                     | `perf`          | `#303`        |
| `build/404-deps`                       | `build`         | `#404`        |
| `ci/505-pipeline`                      | `ci`            | `#505`        |
| `chore/no-issue`                       | `chore`         | none          |
| `123-description` (bare number prefix) | infer from diff | `#123`        |
| `main` / `develop` / unrecognised      | infer from diff | ask user once |

If no issue ID is found in the branch, ask the user once:

> "Which GitLab issue does this commit reference? (enter #N or 'none')"

**Scope rule:** The scope in the commit message is always `#N` — the issue ID extracted above. It is never a directory name or module path. If no issue ID exists, the scope is omitted entirely.

### 4. Quality gate (silent)

Before presenting the draft, verify:

- Scope = `#N` is present if branch has an issue ID (never a directory name)
- Title ≤ 72 characters
- Footer `Closes #N` or `Related to #N` is present when issue ID exists
- No placeholder text (`TBD`, `TODO`, `<...>`) in body

Fix any violations automatically. Do not output the checklist to the user.

→ Full criteria: [../shared/references/quality-standard.md](../shared/references/quality-standard.md)

### 5. Draft gate

**Do not commit yet.** Propose the complete message in chat.

Format:

```
<type>(#N): <description>

<optional body>

Closes #N
```

Use `Closes #N` when the branch prefix is `fix` or `feat` and the work resolves the issue.
Use `Related to #N` for partial work, support changes (`chore`, `docs`, `refactor`), or when
the issue stays open after this commit.

Wait for explicit confirmation:

> "Shall I commit with this message? (yes / edit / cancel)"

If the user edits the message, re-present it before executing. If the edited message no
longer follows conventional commit format, note the deviation and ask for confirmation.

### 6. Execute

```bash
git commit -m "$(cat <<'EOF'
<type>(#N): <description>

Closes #N
EOF
)"
```

Return the short commit hash. Do not push.

## Examples

**Example 1 — bug fix on a `fix/` branch:**

```
Input:  branch fix/87-nil-pointer, changed pkg/api/handler.go
Output:
fix(#87): handle nil pointer in user handler

Closes #87
```

**Example 2 — feature with multiple changed areas:**

```
Input:  branch feature/42-oauth, changed src/auth/ and src/middleware/
Output:
feat(#42): implement OAuth2 login with Google

- Add OAuth2 flow for Google provider
- Update middleware to validate Bearer tokens

Closes #42
```

**Example 3 — chore with no issue:**

```
Input:  branch chore/update-deps, changed package.json and go.mod
Output:
chore: update dependencies to latest patch versions
```

→ More examples and breaking change patterns:
[references/conventional-commits.md](references/conventional-commits.md)

## References

- Conventional Commits spec and examples:
  [references/conventional-commits.md](references/conventional-commits.md)
