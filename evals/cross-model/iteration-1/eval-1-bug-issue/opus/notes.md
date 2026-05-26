# Eval notes — gitlab-issue / bug

## Workflow steps followed

1. **Identify type** — user said "Create a bug issue", so type = `bug`. No clarification needed.
2. **Load template** — read `skills/gitlab-issue/assets/bug.md` to get section structure
   (Description / Impact / Related issues / Files affected / Activities).
3. **Explore context** — simulated per test rules:
   - `git log` would show recent commits on branch `fix/87-nil-pointer`.
   - `pkg/api/handler.go` does not exist on disk; simulated a plausible Go handler around
     line 87 showing `r.Header.Get("X-User-Id")` then `h.svc.GetUser(ctx, userID)` with
     the returned error swallowed and `user.Name` dereferenced unconditionally.
   - Applied snippet policy: one 13-line fenced Go block with exact `pkg/api/handler.go
     line 82-94` citation; plus a short curl/log reproduction block.
4. **Discover labels and milestone** — skipped `glab label list` and `glab milestone list`
   per the test rule "Do NOT run any glab commands". Fell back to defaults:
   `type::bug` + `workflow::ready`, milestone `none`.
5. **Apply diagram policy** — single-actor bug (one handler, one downstream call, no race
   or multi-goroutine ordering). Per `references/mermaid-diagrams.md` → "Isolated bug on a
   single actor / pure function → no diagram". Skipped diagram.
6. **Draft gate** — produced the full draft, included title / labels / milestone in the
   confirmation prompt, stopped before any `glab issue create` call (also enforced by the
   test rules).
7. **Publish via glab** — skipped (test rule + draft gate not yet approved).

## Steps skipped and why

- `git log --oneline -20`, `git diff HEAD`, `git blame` — not executed; instead used the
  simulated branch name `fix/87-nil-pointer` as instructed.
- `glab label list`, `glab milestone list --state active` — skipped per "Do NOT run any
  glab commands". Used template-default labels.
- `glab issue create`, temp file write to `/tmp/issue-bug-<slug>.md` — skipped; draft
  gate not approved and `glab` calls forbidden in this eval.
- Mermaid diagram — intentionally skipped per the diagram policy for single-actor bugs.

## Ambiguities encountered

- **Header name casing.** Prompt said `user_id`; in idiomatic Go HTTP that maps to
  `X-User-Id` via `r.Header.Get`. I chose `X-User-Id` and made the choice visible in the
  snippet and title — easy to adjust at draft-gate revision if the user meant a query
  parameter or a different header name.
- **Milestone selection.** SKILL.md step 4 says "Select the most relevant active milestone
  based on branch name, label, or issue type. If none fits, leave empty." With `glab`
  calls disallowed, there is no list to match against; I left it empty.
- **Title prefix style.** The skill does not prescribe a Conventional-Commit-style title.
  I used `bug(api): ...` as a compact, descriptive prefix consistent with the bug type
  label and the file's package. Easy to change at the gate.
- **Activities checklist length.** The template ends with a `{Add / update unit tests}`
  line that reads like a placeholder name. I kept it literally as the last checklist item
  and added concrete preceding items, on the assumption the placeholder is the canonical
  "tests" entry rather than something to delete.
