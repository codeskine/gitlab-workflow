# Commit Draft Output

## Context exploration

- **Branch:** `fix/87-nil-pointer`
- **Staged changes:** `pkg/api/handler.go | 12 ++++++++----`
- **Recent log style:** Conventional Commits (matches project convention)

## Extracted metadata

| Field  | Value        | Source                                                    |
| ------ | ------------ | --------------------------------------------------------- |
| type   | `fix`        | Branch prefix `fix/` → `fix`                              |
| issue  | `#87`        | Branch segment `87-nil-pointer` → issue `#87`             |
| scope  | `api`        | Top-level dir of `pkg/api/handler.go` → `api`             |
| footer | `Closes #87` | Branch prefix is `fix` and this commit resolves the issue |

## Proposed commit message (draft gate)

```
fix(api): handle nil pointer in user handler

Closes #87
```

> Shall I commit with this message? (yes / edit / cancel)

---

## User confirmation

User responds: **yes**

## Final git commit command

```bash
git commit -m "$(cat <<'EOF'
fix(api): handle nil pointer in user handler

Closes #87
EOF
)"
```

(Command not executed per test-environment rules.)
