# Examples

Real-world artifacts produced by the `gitlab-workflow` skills, **genericized**: every internal
host/path has been replaced with `gitlab.example.com/acme/platform-scraper`. They illustrate the
structure each skill generates — YAML frontmatter, sections, fenced code snippets with
`path/file.ext line N` citations, Mermaid diagrams, and `Closes #N` / `Related to #N` footers.

## Milestones — produced by `gitlab-plan`

| File                                                                                   | Highlights                                                                              |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [v1.4.0 — platform-scraper hardening](milestones/v1.4.0-platform-scraper-hardening.md) | objective, deliverables, linked epics, completion criteria (from `assets/milestone.md`) |

## Issues — produced by `gitlab-track`

| File                                                                                   | Type                   | Highlights                      |
| -------------------------------------------------------------------------------------- | ---------------------- | ------------------------------- |
| [ERR-001 — abort on tracer init failure](issues/err-001-abort-tracer-init-failure.md)  | `type::bug`            | repro steps, snippet, impact    |
| [CONC-004 — idempotent Shutdown with sync.Once](issues/conc-004-shutdown-sync-once.md) | `type::technical-debt` | Mermaid sequence, tasks         |
| [SEC-003 — enforce TLS 1.2 on the HTTP client](issues/sec-003-tls-minversion-http.md)  | `type::bug`            | security, DREAD score, Mermaid  |
| [PERF-001 — reuse a single http.Client](issues/perf-001-single-http-client.md)         | `type::technical-debt` | before/after code, pprof impact |

## Merge requests — produced by `gitlab-review`

| File                                                                                                               | Type   | Highlights                                  |
| ------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------- |
| [feat: apiclient with TCP pool & retry](merge-requests/feat-apiclient-pool-retry.md)                               | `feat` | multi-issue close, snippets, reviewer notes |
| [fix: error-handling consistency (OTel v2, fatal startup)](merge-requests/error-handling-otel-v2-fatal-startup.md) | `fix`  | closes 3 issues, ADR refs, reviewer notes   |

> These are illustrative outputs. The Mermaid diagrams are part of what the skills generate when
> the policy calls for them; section headings follow the user's active language at runtime (here,
> English).
