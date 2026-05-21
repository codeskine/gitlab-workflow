---
name: gitlab-milestone
description: Applicare quando l'utente chiede di creare o aggiornare una milestone GitLab, pianificare uno sprint o una release, o raggruppare issue per un obiettivo condiviso.
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

## Riferimenti

- Template: [templates/milestone.md](templates/milestone.md)
