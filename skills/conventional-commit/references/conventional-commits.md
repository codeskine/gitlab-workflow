# Conventional Commits — reference

Spec: [conventionalcommits.org/en/v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- **type**: required — category of change (see table below)
- **scope**: optional — area affected, in parentheses: `feat(auth):`
- **description**: required — short imperative summary, no period at end
- **body**: optional — motivation, what changed and why
- **footers**: optional — issue references, breaking changes, co-authors

## Types

| Type       | When to use                              | Example                                     |
| ---------- | ---------------------------------------- | ------------------------------------------- |
| `feat`     | New feature visible to users             | `feat(auth): add OAuth2 login`              |
| `fix`      | Bug fix                                  | `fix(api): handle nil pointer in handler`   |
| `docs`     | Documentation only                       | `docs(readme): update installation steps`   |
| `style`    | Formatting, whitespace — no logic change | `style: apply prettier formatting`          |
| `refactor` | Code restructure, no feature or fix      | `refactor(core): extract validation helper` |
| `perf`     | Performance improvement                  | `perf(db): add index on users.email`        |
| `test`     | Adding or fixing tests                   | `test(auth): add login unit tests`          |
| `build`    | Build system or tooling                  | `build: upgrade webpack to v5`              |
| `ci`       | CI/CD configuration                      | `ci: add deploy workflow`                   |
| `chore`    | Maintenance — deps, scripts, config      | `chore: update dependencies`                |
| `revert`   | Revert a previous commit                 | `revert: undo feat(auth): add OAuth2 login` |

## Breaking changes

Append `!` after the type (or type+scope), and add a `BREAKING CHANGE:` footer explaining
the impact and migration path.

```
feat(api)!: change response format to camelCase

All JSON keys are now camelCase. Clients using snake_case keys must update.

BREAKING CHANGE: snake_case keys removed from all API responses.
```

## GitLab issue footers

GitLab parses these footers and acts on them when the MR is merged:

| Footer          | Effect on GitLab issue       |
| --------------- | ---------------------------- |
| `Closes #N`     | Closes the issue on MR merge |
| `Fixes #N`      | Closes the issue on MR merge |
| `Resolves #N`   | Closes the issue on MR merge |
| `Related to #N` | Cross-links without closing  |
| `Refs #N`       | Cross-links without closing  |

Multiple references are allowed:

```
Closes #42
Related to #38
```

## Complete examples

### Feature with scope

```
feat(auth): implement JWT token refresh

- Add /auth/refresh endpoint
- Store refresh tokens with 30-day TTL
- Update middleware to accept Bearer tokens

Closes #56
```

### Bug fix

```
fix(api): prevent duplicate user creation

Race condition allowed concurrent signups with the same email.
Added unique constraint and application-level idempotency check.

Fixes #123
```

### Documentation update

```
docs(contributing): add worktree setup instructions

Related to #89
```

### Breaking change

```
feat(api)!: remove v1 endpoints

All /v1/* routes have been removed. Use /v2/* instead.
See migration guide in docs/v2-migration.md.

BREAKING CHANGE: /v1/users and /v1/posts are no longer available.

Closes #201
```

### Chore (no issue)

```
chore: update prettier to v3 and reformat all markdown
```
