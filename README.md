# gitlab-author-skills

Cursor Agent Skills per autorare artefatti GitLab (**issue**, **milestone**, **merge request**) con template in italiano, snippet di codice e diagrammi Mermaid quando rilevanti. Pubblicazione tramite [`glab`](https://gitlab.com/gitlab-org/cli).

Layout multi-skill ispirato a [`vince-winkintel/gitlab-cli-skills`](https://github.com/vince-winkintel/gitlab-cli-skills): ogni sub-skill e' una directory a livello root del repository con il proprio `SKILL.md`.

## Sub-skill disponibili

| Sub-skill                                              | Scopo                                                                                          | Stato       |
|--------------------------------------------------------|------------------------------------------------------------------------------------------------|-------------|
| [`gitlab-issue`](./gitlab-issue)         | Genera issue (bug, documentation, technical-debt, feature) con template italiani + snippet + mermaid. | Disponibile |
| [`gitlab-milestone`](./gitlab-milestone)               | Genera milestone con scope, deliverables e date target.                                        | Disponibile |
| [`gitlab-mr`](./gitlab-mr)                             | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Disponibile |

## Installazione

### Via npx (consigliata)

```bash
# Installazione globale (~/.cursor/skills/)
npx gitlab-author install

# Solo nel repository corrente (./.cursor/skills/)
npx gitlab-author install --project --force

# Solo una sub-skill specifica
npx gitlab-author install --skill gitlab-issue

# Elenco delle sub-skill disponibili
npx gitlab-author list
```

### Via npm install globale

```bash
npm install -g gitlab-author
gitlab-author install --force
```

### Opzioni `install`

| Opzione           | Effetto                                                              |
|-------------------|----------------------------------------------------------------------|
| `--project`       | Destinazione: `./.cursor/skills/` invece di `~/.cursor/skills/`      |
| `--skill <nome>`  | Installa solo la sub-skill indicata (default: tutte)                 |
| `--force`         | Sovrascrive le directory di destinazione se esistono                 |
| `-h`, `--help`    | Mostra l'aiuto                                                       |

## Struttura del repository

```
gitlab-author-skills/
├── SKILL.md                       # orchestratore di alto livello
├── VERSION
├── README.md
├── LICENSE
├── SECURITY.md
├── .gitignore
├── .gitattributes
├── package.json                   # name: gitlab-author, bin: gitlab-author
├── gitlab-issue/           # sub-skill: issue
│   ├── SKILL.md
│   ├── templates/
│   │   ├── bug.md
│   │   ├── documentation.md
│   │   ├── feature.md
│   │   └── technical-debt.md
│   └── references/
│       └── mermaid-diagrams.md
└── scripts/
    └── install.js                 # CLI di installazione (bin npm) con discovery
```

## Esempi d'uso (post-installazione)

Dopo `npx gitlab-author install`, in qualsiasi progetto aperto in Cursor:

```
"Crea una issue di tipo bug per il double-close del canale done in main.go"
"Apri un debito tecnico per le allocazioni ripetute in AzureClientController"
"Proponi una feature per migliorare l'onboarding CI"
"Crea una issue di documentazione per il feature flag X introdotto da !224136"
```

L'agente:

1. Identifica il tipo di artefatto e di sub-skill da attivare
2. Carica solo il template corrispondente
3. Esplora il codice e inserisce snippet 5-20 righe con riferimenti `file:riga`
4. Aggiunge un diagramma Mermaid se la policy lo prevede
5. Mostra la bozza e chiede conferma esplicita (draft gate)
6. Pubblica con il comando `glab` appropriato (`issue create`, `mr create`, ecc.)

## Requisiti

- **Node.js >= 18** per lo script di installazione
- **[`glab`](https://gitlab.com/gitlab-org/cli)** autenticato (`brew install glab && glab auth login`)
- **Cursor** con supporto Agent Skills

## Stile degli artefatti generati

Convenzioni trasversali a tutte le sub-skill:

- Titoli sezione **in italiano** (`## Descrizione`, `## Impatto`, `## File coinvolti`, ecc.)
- Frasi tecniche dense e affermative, senza emoji ne' preamboli
- Riferimenti `path/file.ext` riga N per ogni snippet
- Checklist `- [ ]` per attivita' / requisiti
- Nessuna riga "Aprire una Merge Request" nelle attivita' della issue (l'MR e' fuori scope della issue stessa)

Dettagli per tipo:

- [`gitlab-issue/SKILL.md`](./gitlab-issue/SKILL.md)

## Aggiungere una nuova sub-skill

`scripts/install.js` rileva automaticamente le sub-skill via discovery: ogni directory a livello root del repository che contiene un file `SKILL.md` viene installata. Per aggiungere `gitlab-milestone`:

1. Crea `gitlab-milestone/SKILL.md` con frontmatter `name` e `description`
2. Aggiungi eventuali `templates/` e `references/`
3. `npx gitlab-author list` mostrera' la nuova sub-skill senza modifiche al `package.json`

## Licenza

[MIT](./LICENSE)

## Riferimenti

- Layout ispirato a [`vince-winkintel/gitlab-cli-skills`](https://github.com/vince-winkintel/gitlab-cli-skills)
- Template ufficiali GitLab issues: [`.gitlab/issue_templates/`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/.gitlab/issue_templates)
- Template ufficiali GitLab MR: [`.gitlab/merge_request_templates/`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/.gitlab/merge_request_templates)
