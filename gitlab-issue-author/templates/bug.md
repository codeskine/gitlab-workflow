<!--
Template: bug
Tipo issue: bug
Label default applicata via glab --label: type::bug

Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Descrizione, Impatto, File coinvolti, Attivita'.
- Sezione opzionale: "Criticita' correlate" o "Note su <X>" (solo se ci sono punti collaterali rilevanti).
- Snippet codice 5-20 righe con riferimento `path/file.ext` riga N.
- Diagramma mermaid `sequenceDiagram` quando la issue coinvolge >=2 attori. Etichette descrittive in italiano, identificatori di codice in inglese.
- NON includere mai una riga "Aprire una Merge Request" nelle Attivita'.
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Descrizione

<!-- Breve descrizione del bug (1-3 frasi). Quando ci sono piu' criticita' correlate, usa sotto-sezioni `### 1. ...`, `### 2. ...` numerate, oppure sotto-sezioni nominate (es. `### Catena di chiamata attuale`, `### Componenti coinvolti`). -->

### 1. <Sotto-sezione descrittiva>

<!-- Spiegazione tecnica del comportamento problematico. -->

<!-- Snippet di codice rilevante, 5-20 righe, con riferimento file:riga: -->

```<lang>
// path/to/file.ext riga N
<codice rilevante>
```

<!-- Quando il flusso coinvolge piu' attori (goroutine, processi, servizi), aggiungere un diagramma mermaid sequenceDiagram. Etichette descrittive in italiano, identificatori di codice in inglese. -->

```mermaid
sequenceDiagram
    participant <Attore1> as <Etichetta italiana>
    participant <Attore2> as <Etichetta italiana o identificatore di codice>

    <Attore1>->><Attore2>: <azione>
    <Attore2>-->><Attore1>: <risposta>
```

### 2. <Sotto-sezione descrittiva opzionale>

<!-- Eventuale seconda criticita' correlata strutturalmente al bug principale. -->

---

## Impatto

<!-- Conseguenze concrete del bug: crash, perdita dati, degrado performance, risorse non rilasciate, eccetera. Una o piu' frasi tecniche. -->

---

## Criticita' correlate

<!-- OPZIONALE. Rimuovi questa sezione se non ci sono criticita' correlate. Usa elenco puntato per i punti collaterali rilevanti che non meritano una sotto-sezione dedicata in Descrizione. -->

- <punto 1>
- <punto 2>

---

## File coinvolti

<!-- Lista dei path dei file impattati. Un bullet per file. -->

- `path/to/file1.ext`
- `path/to/file2.ext`

---

## Attivita'

<!-- Checklist delle azioni necessarie. NON includere mai "Aprire una Merge Request". -->

- [ ] <azione 1>
- [ ] <azione 2>
- [ ] Aggiungere / aggiornare i test unitari
