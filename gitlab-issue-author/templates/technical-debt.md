<!--
Template: technical-debt
Tipo issue: debito tecnico
Label default applicata via glab --label: type::technical-debt

Istruzioni per chi compila (l'agente):
- Mantieni i titoli di sezione esattamente come scritti qui (in italiano).
- Sezioni obbligatorie: Descrizione, Impatto, File coinvolti, Attivita'.
- Sezione opzionale: "Note su <X>" / "Note sull'interfaccia <X>" (es. vincoli di compatibilita').
- Snippet codice 5-20 righe con riferimento `path/file.ext` riga N.
- Diagramma mermaid `sequenceDiagram` quando descrive una catena di chiamata o un flusso problematico (etichette descrittive in italiano, identificatori di codice in inglese).
- NON includere mai una riga "Aprire una Merge Request" nelle Attivita'.
- Niente preamboli, niente emoji, frasi tecniche dense e affermative.

Rimuovi questo blocco di commento prima di pubblicare.
-->

## Descrizione

<!-- 1-3 frasi che spiegano il debito tecnico: che cosa fa il codice oggi, perche' e' subottimale. Quando il debito interessa piu' metodi/componenti, usare sotto-sezioni nominate. -->

### <Sotto-sezione 1, es. "Metodi coinvolti">

<!-- Per ogni metodo/componente: descrizione del comportamento problematico + snippet 5-20 righe. -->

**`<NomeMetodo>`** — `path/to/file.ext` riga N:

```<lang>
// codice attuale
<codice rilevante>
```

<!-- Spiegazione breve del problema specifico (allocazione ripetuta, accoppiamento, mancato riuso, ecc.). -->

### <Sotto-sezione 2 opzionale, es. "Catena di chiamata attuale">

<!-- Diagramma mermaid sequenceDiagram quando il debito riguarda un flusso multi-attore. Etichette descrittive in italiano, identificatori di codice in inglese. -->

```mermaid
sequenceDiagram
    participant <Attore1> as <Etichetta>
    participant <Attore2> as <Identificatore di codice>

    loop <condizione del loop, es. "per ogni subscription">
        <Attore1>->><Attore2>: <chiamata>
        <Attore2>-->><Attore1>: <risposta>
    end
```

---

## Impatto

<!-- Conseguenze concrete del debito: costo perf, allocazioni, GC pressure, complessita' di manutenzione, rischio di regressione. Specifica numeri/ordini di grandezza quando possibile. -->

---

## Note su <argomento>

<!-- OPZIONALE. Rimuovi se non rilevante. Usare per vincoli di compatibilita', interfacce stabili da preservare, considerazioni di backward compatibility. -->

<!-- Esempio: "L'interfaccia `Controller` in `pkg/controller.go` (riga 18-23) definisce i metodi `Get*Client` con signature invariata. Qualsiasi soluzione deve mantenere la compatibilita' con questa interfaccia per non impattare i mock usati nei test." -->

---

## File coinvolti

- `path/to/file1.ext`
- `path/to/file2.ext` — <breve nota se rilevante, es. "lettura del contesto, nessuna modifica attesa">

---

## Attivita'

<!-- Checklist delle azioni necessarie. NON includere mai "Aprire una Merge Request". -->

- [ ] <azione di refactor 1>
- [ ] Mantenere la compatibilita' con l'interfaccia <X>
- [ ] Aggiungere test unitari per verificare il nuovo comportamento
