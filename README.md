# gitlab-workflow

AI Agent Skills for managing the complete GitLab workflow — plan milestones, track issues,
commit with traceability, open merge requests, and manage story/epic hierarchies via the
[`glab`](https://gitlab.com/gitlab-org/cli) CLI.

## Quickstart

![gitlab-workflow](assets/images/headers.png)

Install for your agent: [Claude Code](#claude-code) · [Cursor](#cursor) · [Codex](#codex)

## How it works

When you ask your agent to open an issue, create a milestone, commit staged changes, draft a
merge request, or manage a story hierarchy, `gitlab-workflow` activates automatically. It reads
the codebase, pulls relevant context from git and GitLab, and builds a complete artifact draft —
title, labels, milestone, code snippets with exact `path/file.ext:line` citations, and Mermaid
diagrams where the policy calls for them.

Before running a single `glab` command, the agent shows you the full draft and waits for
explicit approval. If you request changes, it applies them and re-presents. Only when you confirm
does it publish to GitLab.

Artifacts are language-agnostic: section headings and prose follow your active language at
runtime. No language is hardcoded.

## Workflow overview

The five skills cover the full GitLab development lifecycle from sprint planning to merge:

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant A as AI Agent
    participant GL as GitLab

    Dev->>A: "Plan sprint 3: auth migration"
    A->>GL: glab milestone create
    GL-->>A: milestone/3
    A-->>Dev: ✓ Milestone #3 created

    Dev->>A: "Create a story for the auth migration"
    A->>GL: glab label list + milestone list
    A-->>Dev: Draft story — approve?
    Dev->>A: yes
    A->>GL: glab issue create (kind::story)
    GL-->>A: issue #10
    A-->>Dev: ✓ Story #10 created

    Dev->>A: "Add issues #11 #12 as children of #10"
    A->>GL: glab issue view #11 / #12
    A->>GL: glab issue link #11 --target-id #10
    A->>GL: glab issue link #12 --target-id #10
    A-->>Dev: Updated children table — approve?
    Dev->>A: yes
    A->>GL: glab issue update #10
    A-->>Dev: ✓ Children linked

    Dev->>A: "Start working on issue #11"
    A->>GL: glab issue edit #11 (workflow::in dev)
    A-->>Dev: ✓ Branch fix/11-oauth-handler created

    Note over Dev,GL: ... development ...

    Dev->>A: "Commit staged changes"
    A-->>Dev: fix(#11): handle OAuth token expiry — approve?
    Dev->>A: yes
    A->>A: git commit
    A-->>Dev: ✓ Committed abc1234

    Dev->>A: "Create MR for this branch and close #11"
    A->>GL: glab label list + diff analysis
    A-->>Dev: Draft MR — approve?
    Dev->>A: yes
    A->>GL: glab mr create
    GL-->>A: MR !5
    A-->>Dev: ✓ MR !5 created

    Dev->>A: "Link MR !5 to story #10"
    A->>GL: glab mr view !5 + commits
    A-->>Dev: Updated parent issue — approve?
    Dev->>A: yes
    A->>GL: glab issue update #10
    A-->>Dev: ✓ Story #10 updated with MR reference

    Dev->>A: "Sync story #10 children status"
    A->>GL: glab issue view #11 + #12
    A-->>Dev: Before/after table diff — approve?
    Dev->>A: yes
    A->>GL: glab issue update #10
    A-->>Dev: ✓ Children table synced
```

## Skills

### `gitlab-plan` — Milestone author

**Trigger phrases:** "Create a milestone", "Plan sprint 5", "Start release v2.1",
"Close the current milestone", "Extend the due date of sprint 3"

**What it produces:**

- Milestone with title, start date, due date, and a goal description
- Candidate issues from the current backlog suggested for assignment
- Consistent naming with project versioning (`v1.2.0`, `Sprint 5`, `2026-Q2`)

**Modes:**

| Mode           | Command                         | When to use                                 |
| -------------- | ------------------------------- | ------------------------------------------- |
| Create         | `glab milestone create`         | New sprint or release                       |
| Update         | `glab milestone edit`           | Extend deadline, rename, update description |
| Close / Reopen | `glab milestone close / reopen` | End of sprint; re-open if work resumes      |

**Context extracted silently:** recent git log, active branches, existing milestones, open issues.

**Boundary:** not for issue creation (→ `gitlab-track`) or merge requests (→ `gitlab-review`).

---

### `gitlab-track` — Issue author

**Trigger phrases:** "Open a bug for…", "Track technical debt in…", "Propose a feature to…",
"Create a documentation issue for…", "Start working on #N", "Move #N to in review"

**Issue types:**

| Type             | Default label          | Template                                                    |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| `bug`            | `type::bug`            | Steps to reproduce, root cause, affected area, code snippet |
| `feature`        | `type::feature`        | Problem, proposal, MVC, acceptance criteria, open questions |
| `technical-debt` | `type::technical-debt` | Current state, impact, proposed fix, effort estimate        |
| `documentation`  | `type::documentation`  | Scope, audience, sections to add or update                  |

**What it produces:**

- Issue with title (≥ 5 meaningful words), scoped labels, optional milestone
- Fenced code snippets of 5–20 lines with exact `path/file.ext line N` citations
- Mermaid diagrams for flows, component relationships, and state machines where relevant
- `workflow::ready` as initial lifecycle label

**Lifecycle transitions** (Transition mode):

```
workflow::ready → workflow::in dev → workflow::in review → workflow::done → closed
```

On transition to `workflow::in dev`, the skill offers to create a branch following the
`<type>/<issue-id>-<short-title>` convention (e.g. `fix/87-nil-pointer-handler`).

**Context extracted silently:** `git log`, `git diff HEAD`, `git blame` (bug/tech-debt),
codebase exploration with `Read`, `Grep`, `Glob`.

**Boundary:** not for merge requests (→ `gitlab-review`) or milestones (→ `gitlab-plan`).

---

### `gitlab-commit` — Commit author

**Trigger phrases:** "Commit staged changes", "Save progress", "Finalize this", or implicitly
when the agent signals that implementation work is complete.

**What it produces:**

Conventional Commit message ([v1.0.0 spec](https://www.conventionalcommits.org/)) with the
GitLab issue ID as scope, extracted from the branch name:

```
fix(#87): handle nil pointer in user handler

Closes #87
```

**Branch-to-type mapping:**

| Branch prefix                | Commit type | Footer          |
| ---------------------------- | ----------- | --------------- |
| `fix/`, `hotfix/`, `bugfix/` | `fix`       | `Closes #N`     |
| `feature/`                   | `feat`      | `Closes #N`     |
| `refactor/`                  | `refactor`  | `Related to #N` |
| `docs/`                      | `docs`      | `Related to #N` |
| `chore/`                     | `chore`     | (none)          |

The scope is always `#N` (issue ID), never a directory name.

**Guard:** does not auto-stage files. Stops if nothing is staged.

**Context extracted silently:** `git branch --show-current`, `git diff --staged --stat`,
`git log --oneline -5`.

**Boundary:** does not push. Does not create MRs (→ `gitlab-review`).

---

### `gitlab-review` — Merge request author

**Trigger phrases:** "Create MR for this branch", "Write the MR description", "Draft merge
request and close #42", "Open a WIP MR"

**What it produces:**

- MR title with conventional commit prefix matching branch intent
- Description with change summary, code snippets (5–20 lines, `path/file.ext line N`),
  reviewer notes (omitted if no non-obvious design decisions), and closing references
- `Closes #N` / `Related to #N` aggregated from commit history — never guessed
- Labels and milestone inferred from associated issues

**Modes:**

| Mode  | Flag      | When to use                             |
| ----- | --------- | --------------------------------------- |
| Ready | (none)    | Branch is ready to merge                |
| Draft | `--draft` | Work in progress, early feedback needed |

**Context extracted silently:** `git log <base>...HEAD`, `git diff <base>...HEAD`, commit
message bodies parsed for `Closes #N` / `Related to #N` patterns.

**Post-creation:** offers to move the linked issue to `workflow::in review`.

**Boundary:** not for issue creation (→ `gitlab-track`) or milestones (→ `gitlab-plan`).

---

### `gitlab-story` — Story and epic hierarchy author _(v1.1.0)_

**Trigger phrases:** "Create a story for…", "Create an epic for…", "Add issue #12 to story #10",
"Sync the children of story #10", "Link MR !5 to story #10"

**What it produces:**

Parent issue with `kind::story` or `kind::epic` label, a structured description, and a live
markdown children table tracking all child issues:

```
| # | Title | Type | Status | MR |
|---|-------|------|--------|----|
| [#11](…) | Handle OAuth token expiry | `type::feature` | `workflow::in dev` | !5 |
| [#12](…) | Add refresh token rotation | `type::feature` | `workflow::ready` | — |
```

Child issues are linked to the parent via `glab issue link --link-type relates_to`.

**Modes:**

| Mode          | When to use                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| **Create**    | Start a new epic or story with an empty children table                                |
| **Add-Child** | Link existing issues or create new minimal issues as children                         |
| **Sync**      | Refresh all child statuses from GitLab into the parent description table              |
| **Link-MR**   | Attach an MR reference to the parent and update the MR column for referenced children |

**Simulates Scrum hierarchy on GitLab Free:**

```
epic (kind::epic)
└── story (kind::story)
    ├── feature issue #11  (type::feature, workflow::in dev, MR !5)
    └── feature issue #12  (type::feature, workflow::ready)
```

No GitLab Premium required. Hierarchy state is persisted entirely in the parent issue description.

**Boundary:** not for leaf issues (→ `gitlab-track`) or milestones (→ `gitlab-plan`).

---

## Installation

### Claude Code

```bash
claude plugins install @codeskine/gitlab-workflow
```

### Cursor

```bash
rm -rf /tmp/gitlab-workflow
git clone https://github.com/codeskine/gitlab-workflow.git /tmp/gitlab-workflow
mkdir -p .cursor/skills && cp -r /tmp/gitlab-workflow/skills/. .cursor/skills/
```

### Codex

```bash
rm -rf /tmp/gitlab-workflow
git clone https://github.com/codeskine/gitlab-workflow.git /tmp/gitlab-workflow
mkdir -p .codex/skills && cp -r /tmp/gitlab-workflow/skills/. .codex/skills/
```

## Usage examples

### Sprint planning

```
"Create a milestone for the Q3 auth migration release, due 2026-09-30"
"Create a story for the OAuth2 integration — target milestone Sprint 3"
"Add issues #11, #12, and #13 as children of story #10"
```

### Issue tracking

```
"Open a bug for the double-close on the done channel in pkg/worker/main.go"
"Track technical debt for repeated allocations in AzureClientController"
"Propose a feature to improve CI onboarding for new contributors"
"Create a documentation issue for the feature flag introduced in !224136"
"Start working on issue #11"
```

### Development cycle

```
"Commit the staged changes"
"Commit — this fixes the token expiry bug"
"Write the MR description for this branch and close issue #42"
"Open a Draft MR for early feedback on the auth refactor"
```

### Story management

```
"Sync the children table of story #10"
"Link MR !5 to story #10"
"Show me the status of the auth migration epic"
```

### Full sprint cycle (sequence)

```
1. "Create milestone Sprint 3"                          → gitlab-plan
2. "Create a story for OAuth migration"                 → gitlab-story (Create)
3. "Add issues #11 #12 as children of story #10"       → gitlab-story (Add-Child)
4. "Start working on issue #11"                         → gitlab-track (Transition)
5. "Commit staged changes"                              → gitlab-commit
6. "Create MR for this branch and close #11"           → gitlab-review
7. "Link MR !5 to story #10"                           → gitlab-story (Link-MR)
8. "Sync story #10 children status"                    → gitlab-story (Sync)
```

## Artifact style

Conventions applied across all skills:

- Dense, affirmative technical prose — no emoji, no filler preambles
- `path/file.ext line N` citation for every code snippet
- Fenced code blocks of 5–20 lines per significant point
- `- [ ]` checklists for activities and requirements
- Mermaid diagrams for flows and component relationships where relevant
- All glab commands use `--description "$(cat /tmp/file.md)"` — never `--body`

Section headings and prose follow your active language at runtime.

## Requirements

| Dependency                                  | Version        | Install                          |
| ------------------------------------------- | -------------- | -------------------------------- |
| [`glab`](https://gitlab.com/gitlab-org/cli) | ≥ 1.40         | `brew install glab`              |
| `glab` authenticated                        | —              | `glab auth login`                |
| Agent with skills support                   | —              | Claude Code, Cursor, or Codex    |
| Git                                         | ≥ 2.30         | pre-installed on most systems    |
| GitLab tier                                 | Free or higher | All features work on GitLab Free |

> **Note:** `gitlab-story` does **not** require GitLab Premium. It simulates epic/story hierarchy
> using labels and description tables on GitLab Free.

## References

| Resource                            | URL                                                                |
| ----------------------------------- | ------------------------------------------------------------------ |
| `glab` CLI documentation            | https://gitlab.com/gitlab-org/cli/-/blob/main/docs/source/index.md |
| GitLab REST API                     | https://docs.gitlab.com/ee/api/rest/                               |
| GitLab Issue Links API              | https://docs.gitlab.com/ee/api/issue_links.html                    |
| Conventional Commits v1.0.0         | https://www.conventionalcommits.org/en/v1.0.0/                     |
| Mermaid diagram syntax              | https://mermaid.js.org/syntax/sequenceDiagram.html                 |
| Agent Skills specification          | https://agentskills.io/specification.md                            |
| `@codeskine/gitlab-workflow` on npm | https://www.npmjs.com/package/@codeskine/gitlab-workflow           |

## Contributing

### Adding a new sub-skill

1. Create `skills/<name>/SKILL.md` with all required frontmatter fields (see [CLAUDE.md](./CLAUDE.md))
2. Add `assets/<type>.md` templates for each artifact type the skill handles
3. Optionally add `references/` for detailed documentation
4. Add `"<name>"` to the `skills` array in `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, and `.codex-plugin/plugin.json`
5. Run the description quality check: contains `GitLab`, has "Use when" trigger clause, no over-triggering patterns

### Modifying an existing skill

After changes:

1. Increment `metadata.version` in the changed `SKILL.md`
2. Bump `version` in `package.json`
3. Format: `npx prettier --write "**/*.md"`
4. Measure token count: `npx tiktoken-cli skills/<name>/SKILL.md` (target: < 2500)

## License

[MIT](./LICENSE)
