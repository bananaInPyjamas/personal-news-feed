# Architettura editoriale e consumo

## Configurazione precedente

Il flusso previsto separava un coordinatore `gpt-5.6-sol` a reasoning low, un agente `gpt-5.6-luna` medium per preflight/integrazione/pubblicazione e un agente editoriale `gpt-5.6-sol` high per ricerca, verifica e scrittura. Astra era escluso. La separazione riduceva il rischio editoriale, ma moltiplicava le fasi automatiche e il consumo; inoltre la corretta configurazione dello scheduler non era ancora stata verificata.

## Trial lightweight (una settimana)

Per il periodo di prova di sette giorni, lunedì–venerdì, una singola esecuzione `gpt-5.6-luna` con reasoning medium gestisce il flusso end-to-end. Preflight, integrazione, validazione e pubblicazione restano vincolati a script deterministici dove possibile. Sol non è automatico: può essere richiesto solo come escalation eccezionale e mirata per un’ambiguità ad alto rischio, dopo aver documentato perché Luna non è sufficiente. Astra non viene usato.

La rassegna mira a 22–26 notizie; AI 5–7 e robotica 3–4 solo quando ci sono sviluppi sostanziali. Il venerdì aggiunge tre eventi weekend verificati. Se mancano fatti rilevanti, il numero scende senza riempitivi. Questa fascia preserva una panoramica ampia: nella simulazione operativa, 24 articoli richiedono circa 28–43 mila token input e 3,1–5,2 mila output, contro circa 21–31 mila input e 2,5–4,2 mila output per 15 articoli, mantenendo invariata l’architettura Luna singola.

## Criteri di successo e fallback

Il trial è riuscito se per cinque giorni lavorativi consecutivi il preflight passa, l’edizione rispetta lo schema, i controlli deterministici passano, la pubblicazione è verificata su Pages e non serve escalation Sol. Al termine si confrontano qualità, utilità e consumo con l’utente prima di mantenere o cambiare configurazione; non si ripristina automaticamente il flusso precedente. Un’ambiguità ad alto rischio può fermare la singola edizione o richiedere un’escalation Sol mirata. Un fallimento lascia online l’ultima edizione valida.

## Metodo di consumo

Ogni nuova edizione può includere `usageEstimate` con `exact: false`, `methodologyVersion`, `models` (modello e fase), intervalli `inputTokens`/`outputTokens`, `apiEquivalentCostEUR` e `pricing` (prezzi USD/M, cambio, data e fonte). Le edizioni precedenti senza il campo mostrano “non disponibile”: non vengono ricostruite stime retroattive.

I prezzi di riferimento sono Luna: 0,20 USD/M token input e 1,20 USD/M output; Sol: 4 USD/M input e 20 USD/M output. La conversione configurabile del trial è 1 USD = 0,8940 EUR, derivata da 1 EUR = 1,1186 USD (ECB, 8 ottobre 2026). È un equivalente API stimato, non il costo reale del piano Codex.

Lo script `scripts/estimate-usage.js` riceve `--date`, `--articles`, `--weekendEvents`, `--searchCalls`, `--sourcePagesOpened` e `--solEscalations`, oppure `--activity activity.json`. La formula base Luna è input `7000 + 250×articoli + 180×eventi + 450×ricerche + 320×pagine`, output `1800 + 90×articoli + 70×eventi`; si applicano rispettivamente ±20% e ±25%. Ogni escalation Sol aggiunge input `3500` e output `900`, con ±25%/±30%. Gli intervalli per modello vengono sommati nei totali e moltiplicati per il prezzo USD/M e per 0,8940 EUR/USD. L’incertezza copre prompt, contesto, pagine e risposta; non è misurazione fatturata. Il run registra i contatori e invoca lo script prima della pubblicazione.
