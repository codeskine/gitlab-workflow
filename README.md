# gitlab-workflow

AI Agent Skills for managing the complete GitLab workflow — plan milestones,
track issues, commit with traceability, and open merge requests via the [`glab`](https://gitlab.com/gitlab-org/cli) CLI.

## Quickstart

Install for your agent: [Claude Code](#claude-code) · [Cursor](#cursor) · [Codex](#codex)

## How it works

When you ask your agent to open an issue, create a milestone, commit staged changes, or draft a
merge request, `gitlab-workflow` activates automatically. It reads the codebase, pulls relevant
context, and builds a complete artifact draft — title, labels, milestone, code snippets with
exact `path/file.ext:line` citations, and Mermaid diagrams where the policy calls for them.

Before running a single `glab` command, the agent shows you the full draft and waits for
explicit approval. If you request changes, it applies them and re-presents. Only when you
confirm does it publish to GitLab.

Artifacts are language-agnostic: section headings and prose follow your active language at
runtime. No language is hardcoded.

## Installation

> **Note:** Marketplace listings are coming soon. In the meantime, install manually by cloning
> the repository and pointing your agent's skills directory at `skills/`.

```bash
git clone https://github.com/codeskine/gitlab-workflow.git
```

### Claude Code

_Plugin marketplace listing coming soon._

Until then, copy or symlink the `skills/` directory into your project's `.claude/plugins/`
or configure it as a local plugin path.

### Cursor

_Plugin marketplace listing coming soon._

Until then, copy the `skills/` directory into your project's `.cursor/skills/`.

### Codex

_Plugin marketplace listing coming soon._

Until then, copy the `skills/` directory into your project's `.codex/skills/`.

## Available Skills

| Skill                                     | Scope                                                              | Example trigger                                          |
| ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| [`gitlab-plan`](./skills/gitlab-plan)     | Creates milestones with scope, deliverables, and target dates      | "Create a milestone for the 2.1 release"                 |
| [`gitlab-track`](./skills/gitlab-track)   | Opens issues: bug, feature, technical debt, documentation          | "Open a bug for the double-close in main.go"             |
| [`gitlab-commit`](./skills/gitlab-commit) | Commits staged changes with conventional messages and traceability | "Commit the staged changes"                              |
| [`gitlab-review`](./skills/gitlab-review) | Drafts merge request descriptions with issue references and diffs  | "Write the MR description for this branch and close #42" |

## Usage Examples

After installing, open any project in your agent and try these prompts:

```
"Open a bug for the double-close on the done channel in main.go"
"Track technical debt for repeated allocations in AzureClientController"
"Propose a feature to improve CI onboarding"
"Create a documentation issue for feature flag X introduced in !224136"
"Create a milestone for the 2.1 release using the open issues from the auth component"
"Write the MR description for this branch and close issue #42"
```

The agent:

1. Identifies the artifact type and activates the matching skill
2. Loads only the relevant template
3. Explores the codebase and inserts 5–20 line code snippets with `file:line` references
4. Adds a Mermaid diagram when the skill policy calls for one
5. Presents the full draft and waits for explicit confirmation (draft gate)
6. Publishes with the appropriate `glab` command (`issue create`, `mr create`, etc.)

## Artifact Style

Conventions applied across all skills:

- Dense, affirmative technical prose — no emoji, no filler preambles
- `path/file.ext` line N citation for every snippet
- `- [ ]` checklists for activities and requirements
- Mermaid diagrams for flows and component relationships where relevant

Section headings and prose follow your active language at runtime.

## Requirements

- **[`glab`](https://gitlab.com/gitlab-org/cli)** authenticated (`brew install glab && glab auth login`)
- **Agent with skills support** — Claude Code, Cursor, or Codex

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

## License

[MIT](./LICENSE)
