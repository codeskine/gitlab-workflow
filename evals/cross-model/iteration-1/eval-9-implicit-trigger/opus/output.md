# Response

Triggered skill: **conventional-commit** (auto-triggered on "I'm done with the OAuth2 changes" / "Everything looks good" — readiness-to-save signal).

## 1. Guard: staged changes verified

```
src/auth/oauth.go      | 45 +++++++++++
src/middleware/auth.go | 18 ++++-
```

Staged changes are present — proceeding.

## 2. Context exploration (silent)

- Branch: `feature/42-oauth`
- Recent log: 5 commits, conventional-commit style in use.

## 3. Extract type and issue

- Branch prefix `feature/` → type `feat`
- Issue ID from branch: `#42`

## 4. Infer scope

Most-changed path: `src/auth/oauth.go` (45 lines, vs. 18 in `src/middleware/auth.go`). Both touch authentication; top-level meaningful scope → `auth`.

## 5. Draft gate

Proposed commit message:

```
feat(auth): implement OAuth2 login

- Add OAuth2 flow in src/auth/oauth.go
- Update middleware to validate OAuth2 tokens in src/middleware/auth.go

Closes #42
```

**Shall I commit with this message? (yes / edit / cancel)**

_(Stopping here at the draft gate — not executing `git commit` until you confirm.)_
