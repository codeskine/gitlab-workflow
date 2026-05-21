---
name: gitlab-mr
description: Applicare quando l'utente chiede di creare o redigere la descrizione di una MR su GitLab.
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

> "Bozza pronta. Procedo a creare la MR su GitLab con titolo '<titolo>', label `<label>`, milestone `<milestone|nessuna>`? (si/modifiche/annulla)"

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

## Riferimenti

- Template: [templates/mr.md](templates/mr.md)
