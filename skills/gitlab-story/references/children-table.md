# Children table spec

## Format

| #         | Title      | Type            | Status             | MR  |
| --------- | ---------- | --------------- | ------------------ | --- |
| [#N](url) | Title text | `type::feature` | `workflow::in dev` | !42 |

## Columns

| Column   | Source                                                                 | Format                                 |
| -------- | ---------------------------------------------------------------------- | -------------------------------------- |
| `#`      | Issue IID — `glab issue view <id> --output json` → `.iid` + `.web_url` | `[#N](url)`                            |
| `Title`  | `.title` field                                                         | plain text, no markdown                |
| `Type`   | First label matching `type::*`                                         | inline backtick: `` `type::feature` `` |
| `Status` | First label matching `workflow::*`; if issue is `closed`: `closed`     | inline backtick                        |
| `MR`     | Set by Link-MR mode only                                               | `!N` or `—`                            |

## Status mapping

| GitLab issue state | `workflow::*` label   | Table display                     |
| ------------------ | --------------------- | --------------------------------- |
| `opened`           | `workflow::ready`     | `` `workflow::ready` ``           |
| `opened`           | `workflow::in dev`    | `` `workflow::in dev` ``          |
| `opened`           | `workflow::in review` | `` `workflow::in review` ``       |
| `opened`           | `workflow::done`      | `` `workflow::done` ``            |
| `closed`           | any                   | `` `closed` ``                    |
| `opened`           | none                  | `` `workflow::ready` `` (default) |

## Parsing rules

Parsing is line-by-line. No external markdown parser required.

**Table header identification:**
Line matches the prefix `| # | Title |` (ignore trailing columns).

**Data row identification:**

- Line starts with `| [#` → existing child row
- Line starts with `| —` → placeholder/empty row
- Line starts with `|---|` → separator row, skip

**Extracting child IDs from a data row:**
Match the pattern `\[#(\d+)\]` in the `#` column to get the issue IID.

**Row construction template:**

```
| [#N](url) | Title | `type::X` | `workflow::Y` | !Z |
```

- Missing MR column value: use `—`
- Missing `workflow::*` label: default to `workflow::ready`

## Append vs. rebuild

| Mode      | Behavior                                                                       |
| --------- | ------------------------------------------------------------------------------ |
| Add-Child | Append new rows at the end of the existing table                               |
| Sync      | Rebuild all data rows in original order (preserves `Title` edits)              |
| Link-MR   | Patch only the `MR` column for affected rows; keep all other columns unchanged |
