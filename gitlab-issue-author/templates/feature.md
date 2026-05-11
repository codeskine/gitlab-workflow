<!--
Template: feature
Tipo issue: feature / proposal
Label default applicata via glab --label: type::feature

Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Sommario, Problema da risolvere, Proposta, Aree da esplorare, MVC (Minimum Viable Change), Obiettivi, Criteri di accettazione, Domande aperte, Prossimi passi.
- NON usare una sezione `## Attivita'`: il lavoro e' coperto da "Criteri di accettazione" + "Prossimi passi".
- Snippet codice solo se la proposta tocca un'API/contratto esistente specifico (raro in fase discovery).
- Mermaid `flowchart` SOLO se la proposta ha gia' un flusso definito (MVC convergente). Per proposte discovery: niente diagramma.
- Sezioni opzionali (aggiungere solo se rilevanti per la proposta specifica):
  - `## Note di rilascio`
  - `## Permessi e sicurezza`
  - `## Vantaggio competitivo / differenziazione`
  - `## Link e riferimenti`
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Sommario

<!-- 1-3 frasi: contesto, motivazione, perche' esiste questa issue. Definire chi ne beneficia e in quale momento del prodotto. -->

---

## Problema da risolvere

<!-- Pain points dettagliati. Usare elenco puntato. Segmentare per utenti/scenari quando rilevante. Indicare le conseguenze attuali del non agire. -->

<!-- Esempio di struttura:
- <pain point 1>
- <pain point 2>
- <pain point 3>

Segmentazione utenti/scenari:
- <segmento A, es. "progetto con codice ma senza CI">
- <segmento B>
-->

---

## Proposta

<!-- Direzione di alto livello in 1-3 paragrafi. Non scendere nei dettagli implementativi: questa e' la visione, non il piano. -->

---

## Aree da esplorare

<!-- Gruppi tematici, ciascuno con sotto-bullet di dettaglio. Usare grassetto sul titolo del gruppo. -->

**<Area 1, es. "Empty states migliori">**

- <esplorazione 1>
- <esplorazione 2>

**<Area 2, es. "Creazione guidata">**

- <esplorazione 1>
- <esplorazione 2>

**<Area 3, es. "Setup e validazione piu' chiari">**

- <esplorazione 1>
- <esplorazione 2>

---

## MVC (Minimum Viable Change)

<!-- Bullet list dello scope concreto della PRIMA iterazione. Cosa entra, cosa resta fuori. -->

- <elemento MVC 1>
- <elemento MVC 2>
- <elemento MVC 3>
- Definire l'instrumentazione per misurare il successo (metriche, A/B testing se applicabile)

---

## Obiettivi

<!-- Risultati centrati sull'utente. Formato preferito: "Un utente con X dovrebbe poter Y". -->

Un utente con <profilo / contesto> dovrebbe poter:

- <obiettivo 1>
- <obiettivo 2>
- <obiettivo 3>

---

## Criteri di accettazione

<!-- Checklist `- [ ]` su cosa significa "fatto" per questa proposta. Sono criteri di completamento della proposta stessa, non dell'implementazione finale. -->

- [ ] <criterio 1, es. "Identifichiamo i punti di ingresso a maggior valore">
- [ ] <criterio 2>
- [ ] <criterio 3>
- [ ] Creiamo issue di follow-up per l'implementazione concordata

---

## Domande aperte

<!-- Questioni di design / prodotto ancora non decise. Punto interrogativo finale. Numerare quando aiuta il riferimento. -->

- <domanda 1>?
- <domanda 2>?
- <domanda 3>?

---

## Prossimi passi

<!-- Passi di processo per far avanzare la proposta. Verbi all'infinito. -->

- <passo 1, es. "Mappare il flusso attuale end-to-end">
- <passo 2, es. "Identificare i punti di frizione e fallimento">
- <passo 3, es. "Definire l'MVC proposto">
- <passo 4, es. "Allineare sulle metriche di successo prima dell'implementazione">
