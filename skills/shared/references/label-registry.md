---
title: Label Registry
---

# Label Registry

Centralized definition of all GitLab labels used across skills. Run the
`glab label create` blocks below once per project to set up the required labels.

## workflow::\* labels

Lifecycle state labels. Scoped labels (`workflow::*`) enforce a single active state
per issue or MR. These labels map directly to Issue Board columns
(GitLab → Project → Plan → Issue Boards).

| Name                  | Color     | Description                          | Used by                                   |
| --------------------- | --------- | ------------------------------------ | ----------------------------------------- |
| `workflow::ready`     | `#428BCA` | Issue defined, ready to be picked up | gitlab-track, gitlab-story, gitlab-review |
| `workflow::in dev`    | `#F0AD4E` | Actively being worked on             | gitlab-track, gitlab-review               |
| `workflow::in review` | `#5CB85C` | MR open, waiting for merge           | gitlab-track, gitlab-review               |
| `workflow::complete`  | `#5BC0DE` | Done, issue closed                   | gitlab-track, gitlab-review               |

```bash
glab label create "workflow::ready"     --color "#428BCA" --description "Issue defined, ready to be picked up"
glab label create "workflow::in dev"    --color "#F0AD4E" --description "Actively being worked on"
glab label create "workflow::in review" --color "#5CB85C" --description "MR open, waiting for merge"
glab label create "workflow::complete"  --color "#5BC0DE" --description "Done, issue closed"
```

## type::\* labels

Issue type labels. Each issue type maps to a template and a default `type::*` label.

| Name                   | Color     | Description                         | Used by      |
| ---------------------- | --------- | ----------------------------------- | ------------ |
| `type::bug`            | `#D9534F` | Defect or regression                | gitlab-track |
| `type::feature`        | `#5CB85C` | New functionality                   | gitlab-track |
| `type::technical-debt` | `#F0AD4E` | Refactoring or internal improvement | gitlab-track |
| `type::documentation`  | `#428BCA` | Docs update                         | gitlab-track |

```bash
glab label create "type::bug"            --color "#D9534F" --description "Defect or regression"
glab label create "type::feature"        --color "#5CB85C" --description "New functionality"
glab label create "type::technical-debt" --color "#F0AD4E" --description "Refactoring or internal improvement"
glab label create "type::documentation"  --color "#428BCA" --description "Docs update"
```

## kind::\* labels

Hierarchy labels for epic/story grouping.

| Name          | Color     | Description                           | Used by      |
| ------------- | --------- | ------------------------------------- | ------------ |
| `kind::epic`  | `#6F42C1` | Parent epic grouping multiple stories | gitlab-story |
| `kind::story` | `#9B59B6` | User story under an epic              | gitlab-story |

```bash
glab label create "kind::epic"  --color "#6F42C1" --description "Parent epic grouping multiple stories"
glab label create "kind::story" --color "#9B59B6" --description "User story under an epic"
```
