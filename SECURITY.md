# Security Policy

## Reporting a Vulnerability

Per segnalare una vulnerabilita' di sicurezza in questo pacchetto:

1. **Non** aprire una issue pubblica su GitHub.
2. Apri una **GitHub Security Advisory** privata sul repository, oppure contatta il maintainer in privato.
3. Includi:
   - Descrizione della vulnerabilita'
   - Passi per riprodurre
   - Impatto stimato
   - Eventuale fix proposto

Riceverai una risposta entro 7 giorni lavorativi.

## Scope

Questo pacchetto di skill:

- Esegue comandi `glab` (`glab issue create`, `glab milestone create`, `glab mr create`, `glab issue update`, `glab issue link`) con il contenuto preparato dall'agente, **solo dopo conferma esplicita** dell'utente (draft gate)
- Scrive file temporanei in `/tmp/issue-<tipo>-<slug>.md`, `/tmp/milestone-<slug>.md`, `/tmp/mr-<slug>.md`, `/tmp/story-<slug>.md`
- Non legge né modifica credenziali. Si appoggia all'autenticazione esistente di `glab` (`~/.config/glab-cli/config.yml`)
- Non esegue push automatici né crea branch senza conferma

Prima di esecuzioni automatiche in contesti CI/CD o agenti non supervisionati, revisionare i workflow descritti in:

- [`skills/gitlab-plan/SKILL.md`](./skills/gitlab-plan/SKILL.md)
- [`skills/gitlab-track/SKILL.md`](./skills/gitlab-track/SKILL.md)
- [`skills/gitlab-commit/SKILL.md`](./skills/gitlab-commit/SKILL.md)
- [`skills/gitlab-review/SKILL.md`](./skills/gitlab-review/SKILL.md)
- [`skills/gitlab-story/SKILL.md`](./skills/gitlab-story/SKILL.md)

## Dipendenze

- [`glab`](https://gitlab.com/gitlab-org/cli) >= 1.40 — CLI ufficiale GitLab. Aggiornare regolarmente.
- Git >= 2.30
