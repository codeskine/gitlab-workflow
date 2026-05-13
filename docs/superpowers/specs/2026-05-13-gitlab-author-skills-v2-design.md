# gitlab-author-skills v2 — Design Spec

**Data:** 2026-05-13  
**Scope:** Revisione di `gitlab-issue-author` + design di `gitlab-milestone-author` e `gitlab-mr-author`  
**Approccio:** Spec unificata con common context layer condiviso da tutte le sub-skill

---

## 1. Common Context Layer

Pattern di estrazione automatica del contesto applicato da tutte le sub-skill prima di comporre la bozza. Ogni SKILL.md include la propria copia della sezione "Esplora il contesto" con le istruzioni seguenti.

### Estrazione da git

```bash
git log --oneline -20                        # commit recenti per capire l'area di lavoro
git diff HEAD                                # diff corrente: file e simboli coinvolti
git diff <base-branch>...HEAD --stat         # volume modifiche (usato da mr-author)
git diff <base-branch>...HEAD                # diff completo (usato da mr-author)
git blame <file> -L <inizio>,<fine>          # autore/data righe specifiche (bug, technical-debt)
git branch --show-current                    # nome branch per inferire issue/MR correlate
git log --oneline --since="30 days ago"      # commit recenti per milestone scope
```

### Estrazione dalla codebase

- `Grep` / `Glob` per risolvere simboli citati nel prompt → `file:riga` esatti
- `Read` sui file identificati → snippet 5–20 righe per sezioni significative

### Milestone suggestion

```bash
glab milestone list --state active
```

La skill legge titolo e date delle milestone attive, sceglie quella più pertinente al contesto estratto (branch name, label, tipo di artefatto) e la propone nel draft gate. L'utente può accettare, scegliere un'altra, o lasciare vuoto.

### Draft gate

Punto di controllo obbligatorio prima di qualsiasi `glab` command. La bozza viene sempre mostrata in chat con titolo, label, milestone proposta e corpo completo. La pubblicazione avviene solo dopo conferma esplicita (`si`).

Prompt di conferma standard:

> "Bozza pronta. Procedo a creare `<artefatto>` su GitLab con titolo `<titolo>`, label `<label>`, milestone `<milestone|nessuna>`? (si/modifiche/annulla)"

---

## 2. Revisioni a `gitlab-issue-author`

### Passo 3 — Esplorazione automatica del contesto (aggiornato)

La skill non aspetta solo i riferimenti espliciti dell'utente. Prima di costruire la bozza esegue sempre:

1. `git log --oneline -20` per capire l'area di lavoro recente
2. `git diff HEAD` per identificare file e simboli coinvolti
3. Grep/Glob sui simboli trovati → snippet 5–20 righe con `file:riga`
4. Se tipo `bug` o `technical-debt`: `git blame` sulle righe incriminate

L'enricchimento è silenzioso (nessun output intermedio); tutto converge nella bozza.

### Passo 3b — Milestone suggestion (nuovo)

Dopo l'estrazione del contesto, prima di comporre la bozza:

```bash
glab milestone list --state active
```

La skill sceglie la milestone più pertinente e aggiunge `--milestone "<titolo>"` al comando finale. Se nessuna milestone è pertinente, il campo resta vuoto. La scelta viene mostrata nel draft gate.

### Template

Nessuna modifica strutturale ai quattro template (`bug`, `feature`, `documentation`, `technical-debt`). Aggiunta trasversale: riga `## Milestone` nella bozza mostrata in chat (non nel file template) con la milestone proposta.

### Draft gate (aggiornato)

```
"Bozza pronta. Procedo a creare l'issue su GitLab con titolo '<titolo>',
label '<label>', milestone '<milestone|nessuna>'? (si/modifiche/annulla)"
```

### Pubblicazione (invariata)

```bash
glab issue create \
  --title "<titolo>" \
  --label "<label>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/issue-<tipo>-<slug>.md)"
```

---

## 3. `gitlab-milestone-author` (nuova sub-skill)

### Quando usare

L'utente chiede di creare o aggiornare una milestone GitLab (es. "crea una milestone per lo sprint di maggio", "apri una milestone per la release 2.1").

### Workflow

1. **Identifica titolo e date** — titolo sempre dichiarato dall'utente (o proposto e confermato). Date: inferite da contesto (sprint naming, tag git); se non disponibili, la skill chiede.
2. **Esplora il contesto** (common layer):
   - `git log --oneline --since="30 days ago"` — commit recenti per lo scope
   - `glab issue list --state opened` — issue aperte candidate
   - `glab milestone list --state active` — evitare duplicati
3. **Componi la bozza** con il template
4. **Draft gate** — mostra bozza, attende conferma
5. **Pubblica** via `glab`

### Template

```markdown
## Obiettivo

<!-- 1-3 frasi: scope della milestone, perché esiste, chi ne beneficia -->

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

### Pubblicazione

```bash
glab milestone create \
  --title "<titolo>" \
  --description "$(cat /tmp/milestone-<slug>.md)" \
  --due-date "<YYYY-MM-DD>"
```

---

## 4. `gitlab-mr-author` (nuova sub-skill)

### Quando usare

L'utente chiede di creare o redigere la descrizione di una merge request (es. "crea la MR per questo branch", "scrivi la descrizione della MR che chiude la issue #42").

### Workflow

1. **Estrai il contesto** (common layer completo):
   - `git branch --show-current` → branch corrente
   - `git log <base-branch>...HEAD --oneline` → commit inclusi
   - `git diff <base-branch>...HEAD --stat` → file modificati e volume
   - `git diff <base-branch>...HEAD` → diff completo per snippet
   - Parsing del branch name → issue ID (es. `fix/123-descrizione` → `Closes #123`)
   - `glab milestone list --state active` → milestone da associare
2. **Gestione diff grandi**: se `--stat` mostra >20 file modificati, ridurre gli snippet a massimo 3 aree significative. Aggiungere nota "diff ampio: evidenziati solo i punti critici".
3. **Componi la bozza** con il template
4. **Draft gate** — mostra bozza, attende conferma
5. **Pubblica** via `glab`

Il target branch viene inferito da `git remote` / branch di default del repo. Se ambiguo, la skill chiede esplicitamente.

### Template

```markdown
## Sommario

<!-- 1-3 frasi: cosa fa questa MR e perché -->

---

## Modifiche

<!-- Elenco puntato per file/componente + snippet 5-20 righe sui punti significativi -->

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

### Pubblicazione

```bash
glab mr create \
  --title "<titolo>" \
  --label "<label>" \
  --milestone "<milestone>" \
  --description "$(cat /tmp/mr-<slug>.md)" \
  --source-branch "<branch-corrente>" \
  --target-branch "<base-branch>"
```

---

## Struttura file da creare/modificare

```
gitlab-author-skills/
├── SKILL.md                              # aggiornare sezione sub-skill disponibili
├── README.md                             # aggiornare tabella stato sub-skill
├── gitlab-issue-author/
│   └── SKILL.md                          # aggiornare passi 3, 3b e draft gate
├── gitlab-milestone-author/              # nuova directory
│   ├── SKILL.md                          # nuova sub-skill
│   └── templates/
│       └── milestone.md                  # nuovo template
└── gitlab-mr-author/                     # nuova directory
    ├── SKILL.md                          # nuova sub-skill
    └── templates/
        └── mr.md                         # nuovo template
```

---

## Vincoli e decisioni

- Il tipo di issue rimane sempre dichiarato esplicitamente dall'utente (nessun rilevamento automatico).
- Il common context layer non è un file condiviso: ogni SKILL.md include la propria copia della sezione "Esplora il contesto". Le SKILL.md sono file autonomi letti dall'agente in isolamento.
- Lo stile canonico (italiano, no emoji, frasi dense, snippet con `file:riga`) rimane invariato per tutti gli artefatti.
- `--body` non è un flag valido per `glab`: usare sempre `--description` con `$(cat /tmp/file.md)`.
