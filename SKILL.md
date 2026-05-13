---
name: gitlab-author-skills
description: Collezione di Agent Skills per autorare artefatti GitLab (issue, milestone, merge request) tramite la CLI glab. Include sub-skill specializzate per ciascun tipo di artefatto, con template embedded in italiano, snippet di codice 5-20 righe e diagrammi mermaid quando rilevanti. Usare quando l'utente chiede di creare, redigere o pubblicare issue, milestone o MR su GitLab.
---

# gitlab-author-skills

Collezione di Cursor Agent Skills per **autorare artefatti GitLab** (issue, milestone, merge request) e pubblicarli tramite la CLI [`glab`](https://gitlab.com/gitlab-org/cli).

## Sub-skill disponibili

| Sub-skill                                    | Scopo                                                                                          | Stato     |
|----------------------------------------------|------------------------------------------------------------------------------------------------|-----------|
| [`gitlab-issue`](./gitlab-issue)             | Genera issue (bug, documentation, technical-debt, feature) con template italiani + snippet + mermaid. | Disponibile |
| [`gitlab-milestone`](./gitlab-milestone)     | Genera milestone con scope, deliverables e date target.                                        | Disponibile |
| [`gitlab-mr`](./gitlab-mr)                   | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Disponibile |

Ogni sub-skill e' una directory a livello root con il proprio `SKILL.md` ed eventuali sotto-cartelle `templates/`, `references/`. Quando si aggiunge una nuova sub-skill, `scripts/install.js` la rileva automaticamente via discovery (cartella root con `SKILL.md`).

## Quick start

```bash
# Installa tutte le sub-skill nella home Cursor (~/.cursor/skills/)
npx gitlab-author install

# Installa solo nel repository corrente (./.cursor/skills/)
npx gitlab-author install --project --force

# Installa solo una sub-skill specifica
npx gitlab-author install --skill gitlab-issue

# Elenco delle sub-skill disponibili
npx gitlab-author list
```

Prerequisiti:

- [`glab`](https://gitlab.com/gitlab-org/cli) (`brew install glab`)
- Autenticazione: `glab auth login`

## Quando usare questa skill

L'agente attiva automaticamente la sub-skill corretta quando l'utente chiede di:

- aprire una issue (bug, documentation, technical-debt, feature)
- creare/aggiornare una milestone
- redigere la descrizione di una merge request

## Struttura del repository

```
gitlab-author-skills/
├── SKILL.md                       # orchestratore (questo file)
├── VERSION                        # versione del pacchetto
├── README.md
├── LICENSE                        # MIT
├── SECURITY.md
├── package.json                   # bin: gitlab-author (npx)
├── gitlab-issue/                  # sub-skill: issue
│   ├── SKILL.md
│   ├── templates/
│   │   ├── bug.md
│   │   ├── documentation.md
│   │   ├── feature.md
│   │   └── technical-debt.md
│   └── references/
│       └── mermaid-diagrams.md
├── gitlab-milestone/              # sub-skill: milestone
│   ├── SKILL.md
│   └── templates/
│       └── milestone.md
├── gitlab-mr/                     # sub-skill: merge request
│   ├── SKILL.md
│   └── templates/
│       └── mr.md
└── scripts/
    └── install.js                 # CLI di installazione con discovery
```

## Stile canonico trasversale

Tutte le sub-skill condividono lo stile:

- Titoli di sezione **in italiano** (`## Descrizione`, `## Impatto`, `## File coinvolti`, ecc.)
- Frasi tecniche dense e affermative. No emoji, no preamboli decorativi.
- Riferimenti `path/file.ext` riga N per ogni snippet di codice (5-20 righe).
- Diagrammi mermaid quando il contesto lo giustifica (vedi policy nelle singole sub-skill).
- Draft gate: l'agente mostra la bozza in chat e attende conferma esplicita prima di pubblicare via `glab`.

## Riferimenti

- Convenzione del layout ispirata a [`vince-winkintel/gitlab-cli-skills`](https://github.com/vince-winkintel/gitlab-cli-skills)
- Template ufficiali GitLab: [`.gitlab/issue_templates/`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/.gitlab/issue_templates) e [`.gitlab/merge_request_templates/`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/.gitlab/merge_request_templates)
