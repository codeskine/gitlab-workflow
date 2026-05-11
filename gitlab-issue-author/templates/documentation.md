<!--
Template: documentation
Tipo issue: documentazione
Label default applicata via glab --label: type::documentation

Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Sommario, Cosa documentare, Requisiti della documentazione, Riferimenti correlati.
- NIENTE snippet di codice (le issue di documentazione non li includono di default).
- NIENTE diagrammi mermaid (le issue di documentazione non li includono di default).
- NIENTE sezione `## Attivita'`: le attivita' sono il contenuto naturale di "Requisiti della documentazione".
- Riferimenti GitLab in formato nativo: `!1234` per MR, `#5678` per issue, `group/project#N` cross-project.
- Indicare lo stato fra parentesi quando rilevante: `(merged)`, `(closed)`, `(open)`.
- I "file coinvolti" sono percorsi dentro `doc/` o equivalenti, non file di codice.
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Sommario

<!-- 1-3 frasi: cosa va documentato e perche'. Citare gli MR che introducono la modifica da documentare con formato `!N (stato)`. -->

Aggiungere documentazione per <feature / modifica / componente>, introdotta da:

- !<N1> (<stato>) — <breve descrizione del contenuto dell'MR>
- !<N2> (<stato>) — <breve descrizione del contenuto dell'MR>
- !<N3> (<stato>) — <breve descrizione del contenuto dell'MR>

---

## Cosa documentare

<!-- Posizione esatta nei docs e sintesi del contenuto da aggiungere/modificare. -->

Aggiungere / modificare la sezione <nome sezione> in `doc/<path>/<file>.md`, descrivendo:

- <punto chiave 1>
- <punto chiave 2>
- <punto chiave 3>

<!-- Se utile, indicare il contesto piu' ampio: "Sotto la sezione esistente <X>", "Come alternativa al flusso descritto in <Y>", ecc. -->

---

## Requisiti della documentazione

<!-- Checklist `- [ ]` sui vincoli di contenuto e forma che la documentazione deve rispettare. Sostituisce la sezione "Attivita'". -->

- [ ] Seguire il template standard <nome template, es. "feature flag documentation template (history block + flag note)">
- [ ] Spiegare <cosa>
- [ ] Fornire comandi <enable/disable, configurazione, ecc.> per <target audience, es. "self-managed admins">
- [ ] Indicare il valore di default e lo stato del feature flag (`enabled-by-default` / `disabled-by-default`)
- [ ] <vincolo aggiuntivo specifico della modifica>

---

## Riferimenti correlati

<!-- Issue e MR aggiuntivi rilevanti, non gia' citati nel Sommario. Formato GitLab nativo con stato fra parentesi. -->

- Issue correlata: #<N> (<stato>)
- MR correlato: !<N> (<stato>)
- Cross-project: `group/project#<N>` (<stato>)
