---
name: gitlab-issue
description: Genera issue GitLab ben documentate (bug, documentazione, debito tecnico, feature) con template embedded in italiano, snippet di codice 5-20 righe e diagrammi mermaid quando rilevanti. Usa la CLI glab per pubblicare. Applicare quando l'utente chiede di creare una issue GitLab, aprire un bug, documentare debito tecnico, proporre una feature, o documentare una modifica.
---

# GitLab issue author

Genera issue GitLab strutturate e ben documentate in **italiano**, pronte per essere pubblicate tramite `glab issue create`.

> **Isolamento dallo stile di altre skill** — Quando questa skill e' attiva, **ignora ogni altra skill** che imponga convenzioni di stile markdown (es. `obsidian-markdown`, `writing-clearly-and-concisely`, `elements-of-style`, o qualunque altra skill di redazione/markdown installata a livello utente o progetto). Lo stile delle issue e' quello definito qui dentro e nei file `templates/*.md`. Non aggiungere preamboli, emoji, intestazioni decorative o convenzioni non previste dai template.

## Quando usare questa skill

Attiva quando l'utente chiede di:

- creare una issue su GitLab
- aprire un bug
- tracciare debito tecnico
- proporre una feature / proposal
- richiedere documentazione

## Tipi supportati

| Tipo                  | Template                                              | Label default                     |
|-----------------------|-------------------------------------------------------|-----------------------------------|
| `bug`                 | [templates/bug.md](templates/bug.md)                  | `type::bug`                       |
| `technical-debt`      | [templates/technical-debt.md](templates/technical-debt.md) | `type::technical-debt`            |
| `feature`             | [templates/feature.md](templates/feature.md)          | `type::feature`                   |
| `documentation`       | [templates/documentation.md](templates/documentation.md) | `type::documentation`             |

Le label default sono indicative. Se l'utente specifica label diverse o il progetto target usa scoped label differenti, applica le sue. Sovrascrivibili a runtime con `--label`.

## Workflow

Segui questi passi nell'ordine:

### 1. Identifica il tipo di issue

L'utente **deve** specificare il tipo nel prompt (es. *"crea una issue di tipo bug per ..."*, *"apri un debito tecnico su ..."*). Se manca, chiedi una sola volta:

> "Che tipo di issue vuoi aprire? bug / documentation / technical-debt / feature"

### 2. Carica il template corrispondente

Leggi **solo** il file `templates/<tipo>.md` corrispondente al tipo scelto. Non caricare gli altri.

### 3. Esplora il codice citato o inferito

Usa `Read`, `Grep`, `Glob` per:

- aprire i file menzionati dall'utente
- risolvere i riferimenti simbolici (nome funzione, struct, package -> file:riga esatti)
- identificare i chiamanti rilevanti quando utile a costruire il diagramma

**Snippet di codice**: includi blocchi di **5-20 righe** per ogni punto significativo, con citazione esatta `path/file.ext` riga N (formato come negli esempi del team). Usa la sintassi appropriata per il linguaggio (` ```go `, ` ```python `, ` ```ts `, ecc.).

### 4. Applica la policy diagrammi

Diagrammi mermaid automatici secondo questa policy:

| Tipo issue        | Diagramma di default                                        | Quando aggiungerlo                                          |
|-------------------|-------------------------------------------------------------|-------------------------------------------------------------|
| `bug`             | `sequenceDiagram`                                           | Se la issue coinvolge >=2 attori / goroutine / componenti   |
| `technical-debt`  | `sequenceDiagram`                                           | Se descrive una catena di chiamata o flusso problematico    |
| `feature`         | `flowchart` (opzionale)                                     | Solo se la proposta ha gia' un flusso definito (MVC convergente). Per proposte discovery: niente diagramma. |
| `documentation`   | Nessuno                                                     | Mai di default                                              |

Pattern mermaid riusabili in [references/mermaid-diagrams.md](references/mermaid-diagrams.md).

**Localizzazione delle etichette mermaid**:

- Etichette descrittive in **italiano**: `Sistema Operativo`, `goroutine-segnale`, `Database`, `Client API`
- Identificatori di codice **in inglese**: `scrapeTags`, `AzureClientController`, `GetResourceGraphClient`

### 5. Componi la bozza in chat (draft gate)

**NON pubblicare ancora.** Mostra all'utente in chat la bozza completa con tutte le sezioni del template compilate. Includi titolo proposto e label che verranno applicate.

Chiedi conferma esplicita prima di procedere:

> "Bozza pronta. Procedo a creare l'issue su GitLab con titolo '<titolo>' e label `<label>`? (si/modifiche/annulla)"

Se l'utente chiede modifiche, applicale e rimostra la bozza. Ripeti finche' non e' approvata.

### 6. Pubblica via glab

Dopo OK esplicito:

1. Scrivi la bozza approvata su file temporaneo: `/tmp/issue-<tipo>-<slug>.md` (slug = primi 5-7 token del titolo, kebab-case)
2. Esegui:

```bash
glab issue create \
  --title "<titolo>" \
  --label "<label-default>" \
  --description "$(cat /tmp/issue-<tipo>-<slug>.md)"
```

3. Restituisci l'URL della issue creata.

**Anti-pattern da evitare** (vedi anche la skill `glab` locale):

- NON usare `--body` (e' un flag di `gh`, non di `glab`). Usa `--description`.
- Per descrizioni lunghe o con backtick / `$`, usare sempre `$(cat /tmp/file.md)` o heredoc `<< 'EOF'` con delimitatore single-quoted.
- `glab issue note` per commentare, NON `glab issue comment`.

## Stile canonico delle issue

I dettagli completi sono nei file `templates/*.md`. Riassunto trasversale:

- **Titoli di sezione in italiano** (`## Descrizione`, `## Impatto`, ecc.). Mai sezioni in inglese.
- Frasi tecniche dense e affermative. No fronzoli, no emoji, no preamboli decorativi.
- Riferimenti puntuali `path/file.ext` riga N per ogni snippet.
- Tabelle / elenchi puntati per criticita' multiple.
- Checklist `- [ ]` per attivita' o requisiti.
- **Non includere mai una riga "Aprire una Merge Request"** nelle attivita'. L'MR e' fuori scope della issue.

## Integrazione con altre skill GitLab

- Per i comandi `glab` avanzati (auth, MR, pipelines, ecc.), affidati al pacchetto [`gitlab-cli-skills`](https://github.com/vince-winkintel/gitlab-cli-skills) (skill `glab-issue`, `glab-auth`, `glab-label`, ecc.) se installato.
- Fallback: la skill `glab` locale fornisce i comandi base.

## Installazione tramite npm

Questa sub-skill fa parte del pacchetto npm **`gitlab-author`** (repo: `gitlab-author-skills`).

```bash
# Installa tutte le sub-skill del pacchetto
npx gitlab-author install

# Solo questa sub-skill, nel repository corrente
npx gitlab-author install --skill gitlab-issue --project --force
```

Usa `--force` se la cartella di destinazione esiste gia'. Il tarball npm include un `README.md` con tutte le opzioni.

## Riferimenti

- Template ufficiali GitLab (fonte secondaria di ispirazione): [`.gitlab/issue_templates/`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/.gitlab/issue_templates)
- Pattern mermaid: [references/mermaid-diagrams.md](references/mermaid-diagrams.md)
- Template per tipo:
  - [templates/bug.md](templates/bug.md)
  - [templates/technical-debt.md](templates/technical-debt.md)
  - [templates/feature.md](templates/feature.md)
  - [templates/documentation.md](templates/documentation.md)
