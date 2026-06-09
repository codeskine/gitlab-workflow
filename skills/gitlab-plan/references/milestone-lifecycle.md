# Milestone lifecycle

## Contents

- [States](#states)
- [Lifecycle transitions](#lifecycle-transitions)
- [Integration with issue workflow labels](#integration-with-issue-workflow-labels)
- [Project-level vs group-level milestones](#project-level-vs-group-level-milestones)
- [Naming conventions](#naming-conventions)

## States

| State    | Meaning                                             |
| -------- | --------------------------------------------------- |
| `active` | Ongoing sprint or release; issues are being worked  |
| `closed` | Completed or abandoned; no further issue assignment |

GitLab does not have an intermediate "upcoming" state — milestones are either active or closed.

## Lifecycle transitions

```
[created] → active → closed
                ↑       |
                └───────┘  (reopen)
```

- **Create** — milestone becomes `active` immediately upon creation.
- **Close** — marks the milestone complete. Open issues remain open and must be manually
  reassigned.
- **Reopen** — returns a closed milestone to `active`. Use when a release is delayed or the
  sprint is extended.

## Integration with issue workflow labels

When a milestone transitions to `closed`, open issues associated with it typically move to the
next sprint. Recommended sequence:

1. List remaining open issues:
   ```bash
   glab issue list --milestone "<title>"
   ```
2. Move unfinished issues to the next milestone or backlog:
   ```bash
   glab issue update <N> --milestone "<next-milestone-title>"
   ```
3. Close the milestone:
   ```bash
   glab milestone edit <id> --state close
   ```

## Project-level vs group-level milestones

| Scope   | Command suffix         | Visibility                              |
| ------- | ---------------------- | --------------------------------------- |
| Project | _(default)_            | Issues in the current project only      |
| Group   | `--group <group-slug>` | Issues across all projects in the group |

Group milestones are useful for cross-project releases. Project-level milestones are the default
for sprint planning within a single repository.

## Naming conventions

| Pattern       | Example     | Use case                     |
| ------------- | ----------- | ---------------------------- |
| Sprint number | `Sprint 42` | Scrum-style iteration        |
| Version       | `v1.4.0`    | Semantic versioning releases |
| Date-based    | `2025-Q3`   | Quarterly planning           |

Choose a convention and apply it consistently. The branch name and git tags are the authoritative
source for inferring the target.
