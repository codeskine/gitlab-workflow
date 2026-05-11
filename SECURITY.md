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

Questa skill:

- Esegue `glab issue create` con il contenuto preparato dall'agente, **solo dopo conferma esplicita** dell'utente (draft gate)
- Scrive file temporanei in `/tmp/issue-<tipo>-<slug>.md`
- Non legge ne' modifica credenziali. Si appoggia all'autenticazione esistente di `glab` (`~/.config/glab-cli/config.yml`)

Prima di esecuzioni automatiche in contesti CI/CD o agenti non supervisionati, revisionare il workflow descritto in [`gitlab-issue-author/SKILL.md`](./gitlab-issue-author/SKILL.md).

## Dipendenze

- [`glab`](https://gitlab.com/gitlab-org/cli) — CLI ufficiale GitLab. Aggiornare regolarmente.
- Node.js >= 18 per lo script di installazione `scripts/install.js`.
