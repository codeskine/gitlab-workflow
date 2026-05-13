# gitlab-author-skills v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiornare `gitlab-issue` con estrazione automatica da git e milestone suggestion, e creare le sub-skill `gitlab-milestone` e `gitlab-mr` con template, workflow e pubblicazione via `glab`.

**Architecture:** Tre SKILL.md autonomi (letti dall'agente in isolamento) che condividono gli stessi pattern di estrazione da git, draft gate e stile canonico in italiano. Ogni sub-skill ha la propria directory con `SKILL.md` e `templates/`. Il discovery automatico di `scripts/install.js` rileva le nuove directory senza modifiche alla logica dello script.

**Tech Stack:** Markdown (SKILL.md + template), Node.js >= 18 (install script), `glab` CLI, `git`.

---

## File Map

| Azione | File |
|--------|------|
| Modifica | `gitlab-issue/SKILL.md` — passi 3, 3b, draft gate, comando publish |
| Crea | `gitlab-milestone/SKILL.md` |
| Crea | `gitlab-milestone/templates/milestone.md` |
| Crea | `gitlab-mr/SKILL.md` |
| Crea | `gitlab-mr/templates/mr.md` |
| Modifica | `package.json` — `files` array + `prepack` script |
| Modifica | `SKILL.md` (root) — stato sub-skill nella tabella |
| Modifica | `README.md` — stato sub-skill nella tabella |

---

## Task 1: Aggiorna `gitlab-issue/SKILL.md`

**Files:**
- Modify: `gitlab-issue/SKILL.md`

Aggiunge estrazione automatica da git (passo 3), milestone suggestion (passo 3b), aggiorna il draft gate e il comando di pubblicazione.

- [ ] **Step 1: Sostituisci il passo 3**

In `gitlab-issue/SKILL.md` trova il blocco:

```
### 3. Esplora il codice citato o inferito

Usa `Read`, `Grep`, `Glob` per:

- aprire i file menzionati dall'utente
- risolvere i riferimenti simbolici (nome funzione, struct, package -> file:riga esatti)
- identificare i chiamanti rilevanti quando utile a costruire il diagramma

**Snippet di codice**: includi blocchi di **5-20 righe** per ogni punto significativo, con citazione esatta `path/file.ext` riga N (formato come negli esempi del team). Usa la sintassi appropriata per il linguaggio (` ```go `, ` ```python `, ` ```ts `, ecc.).
```

Sostituiscilo con:

```
### 3. Esplora il contesto

**Estrazione automatica da git** (eseguita sempre, in silenzio):

```bash
git log --oneline -20                     # area di lavoro recente
git diff HEAD                             # file e simboli coinvolti
```

Se tipo `bug` o `technical-debt`, esegui anche:

```bash
git blame <file> -L <inizio>,<fine>       # autore/data delle righe incriminate
```

**Estrazione dalla codebase:**

Usa `Read`, `Grep`, `Glob` per:

- aprire i file identificati dal diff o menzionati dall'utente
- risolvere i riferimenti simbolici (nome funzione, struct, package -> file:riga esatti)
- identificare i chiamanti rilevanti quando utile a costruire il diagramma

**Snippet di codice**: includi blocchi di **5-20 righe** per ogni punto significativo, con citazione esatta `path/file.ext` riga N. Usa la sintassi appropriata per il linguaggio (` ```go `, ` ```python `, ` ```ts `, ecc.).

L'enricchimento e' silenzioso: nessun output intermedio. Tutto converge nella bozza.

### 3b. Suggerisci la milestone

```bash
glab milestone list --state active
```

Scegli la milestone piu' pertinente al contesto (branch name, label, tipo di issue). Se nessuna e' pertinente, lascia vuoto. La scelta viene mostrata nel draft gate.
```

- [ ] **Step 2: Aggiorna il draft gate (passo 5)**

Trova:
```
> "Bozza pronta. Procedo a creare l'issue su GitLab con titolo '<titolo>' e label `<label>`? (si/modifiche/annulla)"
```

Sostituisci con:
```
> "Bozza pronta. Procedo a creare l'issue su GitLab con titolo '<titolo>', label `<label>`, milestone `<milestone|nessuna>`? (si/modifiche/annulla)"
```

- [ ] **Step 3: Aggiorna il comando glab (passo 6)**

Trova:
```bash
glab issue create \
  --title "<titolo>" \
  --label "<label-default>" \
  --description "$(cat /tmp/issue-<tipo>-<slug>.md)"
```

Sostituisci con:
```bash
glab issue create \
  --title "<titolo>" \
  --label "<label-default>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/issue-<tipo>-<slug>.md)"
```

- [ ] **Step 4: Verifica**

```bash
grep -n "git log\|git diff\|git blame\|3b\|milestone" gitlab-issue/SKILL.md
```

Output atteso: righe contenenti `git log --oneline -20`, `git diff HEAD`, `git blame`, `### 3b.`, `glab milestone list`, `--milestone`.

- [ ] **Step 5: Commit**

```bash
git add gitlab-issue/SKILL.md
git commit -m "feat(gitlab-issue): add git context extraction and milestone suggestion"
```

---

## Task 2: Crea `gitlab-milestone/SKILL.md`

**Files:**
- Create: `gitlab-milestone/SKILL.md`

- [ ] **Step 1: Crea la directory**

```bash
mkdir -p gitlab-milestone/templates
```

- [ ] **Step 2: Crea `gitlab-milestone/SKILL.md`**

Contenuto completo:

```markdown
---
name: gitlab-milestone
description: Genera milestone GitLab strutturate con scope, deliverables e date target, pubblicandole tramite glab. Applicare quando l'utente chiede di creare o aggiornare una milestone GitLab, pianificare uno sprint o una release, o raggruppare issue per un obiettivo condiviso.
---

# GitLab milestone

Genera milestone GitLab strutturate e ben documentate in **italiano**, pronte per essere pubblicate tramite `glab milestone create`.

> **Isolamento dallo stile di altre skill** — Quando questa skill e' attiva, **ignora ogni altra skill** che imponga convenzioni di stile markdown (es. `obsidian-markdown`, `writing-clearly-and-concisely`, o qualunque altra skill di redazione/markdown installata a livello utente o progetto). Lo stile e' quello definito qui e in `templates/milestone.md`.

## Quando usare questa skill

Attiva quando l'utente chiede di:

- creare una milestone su GitLab
- pianificare uno sprint o una release
- raggruppare issue per un obiettivo condiviso

## Workflow

Segui questi passi nell'ordine:

### 1. Identifica titolo e date

Titolo sempre dichiarato dall'utente (o proposto dalla skill e confermato esplicitamente). Date: inferite dal contesto (sprint naming, tag git); se non disponibili, chiedi.

### 2. Esplora il contesto

**Estrazione da git:**

```bash
git log --oneline --since="30 days ago"   # commit recenti per capire lo scope
git branch --show-current                  # branch corrente per inferire release/sprint
```

**Ricerca milestone esistenti e issue candidate:**

```bash
glab milestone list --state active         # evitare duplicati
glab issue list --state opened             # issue aperte candidate alla milestone
```

Usa branch name e tag git per inferire la release o lo sprint target.

### 3. Componi la bozza

Leggi `templates/milestone.md` e compila tutte le sezioni con il contesto estratto.

### 4. Draft gate

**NON pubblicare ancora.** Mostra la bozza completa in chat. Chiedi conferma esplicita:

> "Bozza pronta. Procedo a creare la milestone su GitLab con titolo '<titolo>', scadenza '<data>'? (si/modifiche/annulla)"

Se l'utente chiede modifiche, applicale e rimostra la bozza. Ripeti finche' non e' approvata.

### 5. Pubblica via glab

Dopo OK esplicito:

1. Scrivi la bozza approvata su file temporaneo: `/tmp/milestone-<slug>.md` (slug = primi 5-7 token del titolo, kebab-case)
2. Esegui:

```bash
glab milestone create \
  --title "<titolo>" \
  --description "$(cat /tmp/milestone-<slug>.md)" \
  --due-date "<YYYY-MM-DD>"
```

3. Restituisci l'URL della milestone creata (o l'ID se l'URL non e' disponibile nell'output).

**Anti-pattern da evitare:**

- NON usare `--body`. Usa `--description`.
- Per descrizioni con backtick o `$`, usa sempre `$(cat /tmp/file.md)`.

## Stile canonico delle milestone

- Titoli di sezione **in italiano** (`## Obiettivo`, `## Deliverable`, `## Date`, ecc.)
- Frasi tecniche dense e affermative. No emoji, no preamboli decorativi.
- Riferimenti `#N` per le issue collegate.
- Checklist `- [ ]` per deliverable e criteri di completamento.
- Date sempre in formato `YYYY-MM-DD`.

## Installazione tramite npm

Questa sub-skill fa parte del pacchetto npm **`gitlab-author`** (repo: `gitlab-author-skills`).

```bash
# Installa tutte le sub-skill del pacchetto
npx gitlab-author install

# Solo questa sub-skill, nel repository corrente
npx gitlab-author install --skill gitlab-milestone --project --force
```

## Riferimenti

- Template: [templates/milestone.md](templates/milestone.md)
```

- [ ] **Step 3: Verifica**

```bash
grep -n "name:\|glab milestone create\|draft gate\|### 1\|### 2\|### 3\|### 4\|### 5" gitlab-milestone/SKILL.md
```

Output atteso: righe con `name: gitlab-milestone`, `glab milestone create`, tutti e cinque i passi numerati.

- [ ] **Step 4: Commit**

```bash
git add gitlab-milestone/SKILL.md
git commit -m "feat: add gitlab-milestone SKILL.md"
```

---

## Task 3: Crea `gitlab-milestone/templates/milestone.md`

**Files:**
- Create: `gitlab-milestone/templates/milestone.md`

- [ ] **Step 1: Crea il template**

Contenuto completo di `gitlab-milestone/templates/milestone.md`:

```markdown
<!--
Template: milestone
Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Obiettivo, Deliverable, Issue collegate, Date, Criteri di completamento.
- Date in formato YYYY-MM-DD.
- Checklist - [ ] per Deliverable e Criteri di completamento.
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Obiettivo

<!-- 1-3 frasi: scope della milestone, perche' esiste, chi ne beneficia -->

---

## Deliverable

- [ ] <deliverable 1>
- [ ] <deliverable 2>

---

## Issue collegate

- #<N> — <titolo issue>
- #<N> — <titolo issue>

---

## Date

- Inizio: <YYYY-MM-DD>
- Scadenza: <YYYY-MM-DD>

---

## Criteri di completamento

- [ ] <criterio 1>
- [ ] <criterio 2>
```

- [ ] **Step 2: Verifica**

```bash
grep -n "## Obiettivo\|## Deliverable\|## Issue collegate\|## Date\|## Criteri" gitlab-milestone/templates/milestone.md
```

Output atteso: tutte e cinque le sezioni presenti.

- [ ] **Step 3: Commit**

```bash
git add gitlab-milestone/templates/milestone.md
git commit -m "feat: add gitlab-milestone template"
```

---

## Task 4: Crea `gitlab-mr/SKILL.md`

**Files:**
- Create: `gitlab-mr/SKILL.md`

- [ ] **Step 1: Crea la directory**

```bash
mkdir -p gitlab-mr/templates
```

- [ ] **Step 2: Crea `gitlab-mr/SKILL.md`**

Contenuto completo:

```markdown
---
name: gitlab-mr
description: Genera descrizioni di merge request GitLab strutturate in italiano, estraendo contesto da git diff, commit e issue collegate, e pubblicandole tramite glab. Applicare quando l'utente chiede di creare o redigere la descrizione di una MR.
---

# GitLab MR

Genera descrizioni di merge request GitLab strutturate e ben documentate in **italiano**, pronte per essere pubblicate tramite `glab mr create`.

> **Isolamento dallo stile di altre skill** — Quando questa skill e' attiva, **ignora ogni altra skill** che imponga convenzioni di stile markdown (es. `obsidian-markdown`, `writing-clearly-and-concisely`, o qualunque altra skill di redazione/markdown installata a livello utente o progetto). Lo stile e' quello definito qui e in `templates/mr.md`.

## Quando usare questa skill

Attiva quando l'utente chiede di:

- creare una merge request su GitLab
- redigere la descrizione di una MR
- aprire una MR che chiude una issue

## Workflow

Segui questi passi nell'ordine:

### 1. Esplora il contesto

**Estrazione da git** (eseguita sempre):

```bash
git branch --show-current
git log <base-branch>...HEAD --oneline
git diff <base-branch>...HEAD --stat
git diff <base-branch>...HEAD
```

Parsing del branch name per estrarre issue ID:
- `fix/123-descrizione` → `Closes #123`
- `feature/456-nome` → `Related to #456`

Il target branch viene inferito da:
```bash
git remote show origin | grep 'HEAD branch'
```
Se ambiguo, chiedi esplicitamente.

**Gestione diff grandi:** se `--stat` mostra >20 file modificati, riduci gli snippet a massimo 3 aree di cambiamento significative. Aggiungi nota "diff ampio: evidenziati solo i punti critici".

**Milestone:**

```bash
glab milestone list --state active
```

Scegli la milestone piu' pertinente al contesto. Se nessuna e' pertinente, lascia vuoto.

### 2. Componi la bozza

Leggi `templates/mr.md` e compila tutte le sezioni con il contesto estratto.

Per la sezione `## Modifiche`, usa snippet di **5-20 righe** per ogni punto significativo, con citazione esatta `path/file.ext` riga N.

### 3. Draft gate

**NON pubblicare ancora.** Mostra la bozza completa in chat. Chiedi conferma esplicita:

> "Bozza pronta. Procedo a creare la MR su GitLab con titolo '<titolo>', label '<label>', milestone '<milestone|nessuna>'? (si/modifiche/annulla)"

Se l'utente chiede modifiche, applicale e rimostra la bozza. Ripeti finche' non e' approvata.

### 4. Pubblica via glab

Dopo OK esplicito:

1. Scrivi la bozza approvata su file temporaneo: `/tmp/mr-<slug>.md` (slug = primi 5-7 token del titolo, kebab-case)
2. Esegui:

```bash
glab mr create \
  --title "<titolo>" \
  --label "<label>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/mr-<slug>.md)" \
  --source-branch "<branch-corrente>" \
  --target-branch "<base-branch>"
```

3. Restituisci l'URL della MR creata.

**Anti-pattern da evitare:**

- NON usare `--body`. Usa `--description`.
- Per descrizioni con backtick o `$`, usa sempre `$(cat /tmp/file.md)`.
- `glab mr note` per commentare, NON `glab mr comment`.

## Stile canonico delle MR

- Titoli di sezione **in italiano** (`## Sommario`, `## Modifiche`, `## Come testare`, ecc.)
- Frasi tecniche dense e affermative. No emoji, no preamboli decorativi.
- Riferimenti `path/file.ext` riga N per ogni snippet di codice (5-20 righe).
- Checklist `- [ ]` per "Come testare" e "Checklist autore".
- `Closes #N` per fix, `Related to #N` per feature/refactor.

## Installazione tramite npm

Questa sub-skill fa parte del pacchetto npm **`gitlab-author`** (repo: `gitlab-author-skills`).

```bash
# Installa tutte le sub-skill del pacchetto
npx gitlab-author install

# Solo questa sub-skill, nel repository corrente
npx gitlab-author install --skill gitlab-mr --project --force
```

## Riferimenti

- Template: [templates/mr.md](templates/mr.md)
```

- [ ] **Step 3: Verifica**

```bash
grep -n "name:\|glab mr create\|draft gate\|### 1\|### 2\|### 3\|### 4" gitlab-mr/SKILL.md
```

Output atteso: righe con `name: gitlab-mr`, `glab mr create`, tutti e quattro i passi numerati.

- [ ] **Step 4: Commit**

```bash
git add gitlab-mr/SKILL.md
git commit -m "feat: add gitlab-mr SKILL.md"
```

---

## Task 5: Crea `gitlab-mr/templates/mr.md`

**Files:**
- Create: `gitlab-mr/templates/mr.md`

- [ ] **Step 1: Crea il template**

Contenuto completo di `gitlab-mr/templates/mr.md`:

```markdown
<!--
Template: merge request
Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Sommario, Modifiche, Issue collegate, Come testare, Checklist autore.
- Sezione opzionale: Note al reviewer (solo se ci sono decisioni di design da evidenziare).
- Snippet codice 5-20 righe con riferimento path/file.ext riga N.
- Checklist - [ ] per Come testare e Checklist autore.
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Sommario

<!-- 1-3 frasi: cosa fa questa MR e perche' -->

---

## Modifiche

<!-- Elenco puntato per componente/file + snippet 5-20 righe sui punti significativi -->

- <componente/file>: <descrizione modifica>

---

## Issue collegate

<!-- Closes #N se il branch indica un fix; Related to #N altrimenti -->

- Closes #<N>

---

## Come testare

- [ ] <passo 1>
- [ ] <passo 2>
- [ ] <passo 3>

---

## Checklist autore

- [ ] Test aggiunti o aggiornati
- [ ] Documentazione aggiornata se necessario
- [ ] Nessun breaking change non documentato

---

## Note al reviewer

<!-- Sezione opzionale: solo se ci sono decisioni di design da evidenziare -->
```

- [ ] **Step 2: Verifica**

```bash
grep -n "## Sommario\|## Modifiche\|## Issue collegate\|## Come testare\|## Checklist autore\|## Note al reviewer" gitlab-mr/templates/mr.md
```

Output atteso: tutte e sei le sezioni presenti.

- [ ] **Step 3: Commit**

```bash
git add gitlab-mr/templates/mr.md
git commit -m "feat: add gitlab-mr template"
```

---

## Task 6: Aggiorna `package.json`, `SKILL.md` e `README.md`

**Files:**
- Modify: `package.json`
- Modify: `SKILL.md` (root)
- Modify: `README.md`

- [ ] **Step 1: Aggiorna `package.json`**

Nel campo `files`, aggiungi `"gitlab-milestone"` e `"gitlab-mr"` dopo `"gitlab-issue"`:

```json
"files": [
  "SKILL.md",
  "VERSION",
  "SECURITY.md",
  "LICENSE",
  "gitlab-issue",
  "gitlab-milestone",
  "gitlab-mr",
  "scripts/install.js"
],
```

Nel campo `scripts.prepack`, aggiorna la lista dei file da verificare:

```json
"prepack": "node -e \"const fs=require('fs');for(const p of ['gitlab-issue/SKILL.md','gitlab-milestone/SKILL.md','gitlab-mr/SKILL.md','SKILL.md','VERSION']){if(!fs.existsSync(p)){console.error('Missing '+p);process.exit(1)}}\""
```

- [ ] **Step 2: Aggiorna la tabella in `SKILL.md` (root)**

Trova:

```
| `gitlab-milestone`                           | Genera milestone con scope, deliverables e date target.                                        | Pianificata |
| `gitlab-mr`                                  | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Pianificata |
```

Sostituisci con:

```
| [`gitlab-milestone`](./gitlab-milestone)     | Genera milestone con scope, deliverables e date target.                                        | Disponibile |
| [`gitlab-mr`](./gitlab-mr)                   | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Disponibile |
```

- [ ] **Step 3: Aggiorna la tabella in `README.md`**

Trova:

```
| `gitlab-milestone-author`                              | Genera milestone con scope, deliverables e date target.                                        | Pianificata |
| `gitlab-mr-author`                                     | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Pianificata |
```

Nota: le righe potrebbero già riportare `gitlab-milestone` / `gitlab-mr` se il rename del Task precedente è già avvenuto. In quel caso, aggiorna solo lo stato `Pianificata` → `Disponibile` e aggiungi il link alla directory.

Risultato atteso:

```
| [`gitlab-milestone`](./gitlab-milestone)               | Genera milestone con scope, deliverables e date target.                                        | Disponibile |
| [`gitlab-mr`](./gitlab-mr)                             | Redige descrizioni di merge request con riferimenti a issue e diff sintetico.                  | Disponibile |
```

- [ ] **Step 4: Verifica**

```bash
grep -n "Disponibile\|Pianificata" SKILL.md README.md
```

Output atteso: tre righe con `Disponibile` (gitlab-issue, gitlab-milestone, gitlab-mr). Nessuna riga con `Pianificata`.

- [ ] **Step 5: Commit**

```bash
git add package.json SKILL.md README.md
git commit -m "chore: mark gitlab-milestone and gitlab-mr as available, update package.json"
```

---

## Task 7: Valida il discovery e l'installazione

**Files:** nessuno — solo verifica.

- [ ] **Step 1: Verifica che il discovery rilevi tutte e tre le sub-skill**

```bash
node scripts/install.js list
```

Output atteso:
```
gitlab-author v1.0.0 — sub-skill disponibili:

  - gitlab-issue
  - gitlab-milestone
  - gitlab-mr
```

- [ ] **Step 2: Verifica l'installazione nel progetto corrente**

```bash
node scripts/install.js install --project --force
```

Output atteso:
```
Installazione in: ./.cursor/skills/

  ✓ gitlab-issue -> .cursor/skills/gitlab-issue
  ✓ gitlab-milestone -> .cursor/skills/gitlab-milestone
  ✓ gitlab-mr -> .cursor/skills/gitlab-mr

Completato: 3 installata/e, 0 errore/i.
```

- [ ] **Step 3: Verifica i file installati**

```bash
ls .cursor/skills/
```

Output atteso: `gitlab-issue  gitlab-milestone  gitlab-mr`

```bash
ls .cursor/skills/gitlab-milestone/templates/
ls .cursor/skills/gitlab-mr/templates/
```

Output atteso: `milestone.md` e `mr.md` rispettivamente.

- [ ] **Step 4: Cleanup directory di test**

```bash
rm -rf .cursor
```

- [ ] **Step 5: Verifica lo stato finale del repo**

```bash
git log --oneline -6
```

Output atteso: i commit dei Task 1-6 nell'ordine corretto. Nessun file non tracciato da committare (`git status` pulito).
