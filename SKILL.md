---
name: gitlab-author-skills
description: Usare quando l'utente chiede di creare, redigere o pubblicare issue, milestone o MR su GitLab tramite la CLI glab.
---

# gitlab-author-skills

Collezione di Cursor Agent Skills per **autorare artefatti GitLab** (issue, milestone, merge request) e pubblicarli tramite la CLI [`glab`](https://gitlab.com/gitlab-org/cli).

## Sub-skill disponibili

| Sub-skill                                    | Scopo                                                                                          | Stato     |
|----------------------------------------------|------------------------------------------------------------------------------------------------|-----------|
| [`gitlab-issue`](./gitlab-issue)             | Genera issue (bug, documentation, technical-debt, feature) con template italiani + snippet + mermaid. | Disponibile |
| [`gitlab-milestone`](./gitlab-milestone)     | Genera milestone con scope, deliverables e date target.                                        | Disponibile |
| [`gitlab-mr`](./gitlab-mr)                   | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Disponibile |

## Stile canonico trasversale

Tutte le sub-skill condividono lo stile:

- Titoli di sezione **in italiano** (`## Descrizione`, `## Impatto`, `## File coinvolti`, ecc.)
- Frasi tecniche dense e affermative. No emoji, no preamboli decorativi.
- Riferimenti `path/file.ext` riga N per ogni snippet di codice (5-20 righe).
- Diagrammi mermaid quando il contesto lo giustifica (vedi policy nelle singole sub-skill).
- Draft gate: l'agente mostra la bozza in chat e attende conferma esplicita prima di pubblicare via `glab`.