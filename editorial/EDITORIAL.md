# Istruzioni editoriali

## Edizione e formato

- Una sola edizione quotidiana, prevista alle 06:00 nel fuso `Europe/Berlin`, inclusi sabato e domenica. L'automazione non è ancora attiva. La prima edizione del 19 settembre è un'esecuzione manuale serale e riporta il vero orario di chiusura della ricerca.
- Profilo concordato per il futuro scheduler: modello `gpt-6-astra`, reasoning effort `high`. Impostare questi valori nella configurazione effettiva del job, non solo nel prompt. Se non sono disponibili, segnalarlo senza sostituirli silenziosamente. Nessuna chiamata AI dal sito o da GitHub Actions.
- Testo del sito in italiano, fonti nella lingua originale. Dieci notizie complessive, ciascuna in una headline compatta con un fatto concreto, una fonte e un link diretto. Non inventare riempitivi per raggiungere dieci.
- Prima delle sezioni, scrivere “Il giorno in breve”: circa 50–80 parole in prosa, 3–4 frasi che evidenzino i fatti essenziali e le loro connessioni. Sintesi sobria, non opinione personale; ogni affermazione deve essere sostenuta dalle notizie selezionate.
- Ordine delle categorie: `germany` Germania & Düsseldorf; `italy` Italia; `world` Europa & Mondo; `ai` AI; `robotics` Robotica; `automotive` Automotive & AUMOVIO; `business` Business, Economia & Mercati; `events` Eventi.
- La distribuzione è libera: priorità agli eventi da conoscere per importanza pubblica, insieme alle novità sostanziali in AI generativa, robotica umanoide e mobile autonoma, semiconduttori, automotive e AUMOVIO, economia e gestione d'impresa. Non imporre quote per categoria. Le categorie vuote restano visibili.
- Ogni venerdì aggiungere cinque eventi per il weekend a Düsseldorf e dintorni/NRW in `weekendEvents`, oltre alle dieci notizie. Negli altri giorni solo grandi appuntamenti o eventi particolarmente pertinenti nella normale categoria `events`; nessuna rubrica weekend aggiuntiva.

## Ricerca mirata

1. Leggere l'archivio prima di cercare. Individuare temi già coperti e sviluppi ancora aperti. La finestra normale va dalla chiusura dell'edizione precedente alla chiusura odierna, orientativamente le ultime 24 ore.
2. Partire dalle fonti prioritarie in `SOURCES.md`: prima una panoramica nazionale/internazionale, poi newsroom AI/robotica/automotive, infine economia ed eventi. Fare ricerche specifiche per dominio invece di rassegne AI generiche.
3. Creare una rosa limitata di candidati. Approfondire quelli che possono davvero entrare nei dieci: impatto pubblico, novità, pertinenza tematica, conseguenze concrete e qualità delle prove. Un tema mondiale dominante può occupare più righe se si tratta di fatti distinti.
4. Dopo due tentativi infruttuosi per la stessa fonte, passare a un'alternativa autorevole o a una ripubblicazione attribuita dell'agenzia. Non aggirare paywall, restrizioni o blocchi del sito. Distinguere un errore dello strumento da un paywall reale.
5. Terminare quando i candidati selezionati sono sufficientemente verificati e tutti gli ambiti hanno ricevuto una prima ricognizione. Non prolungare la ricerca solo per riempire categorie vuote.

## Verifica e scrittura

- Aprire l'articolo e verificarne il contenuto quando accessibile. Controllare separatamente data di pubblicazione, aggiornamento, evento e chiusura della ricerca; la data di scansione del motore non è la data della notizia. Se l'apertura fallisce, cercare un'altra copia attribuita o una conferma indipendente; documentare la limitazione.
- Per guerre, accuse, decisioni politiche controverse e numeri di grande impatto, cercare una seconda fonte indipendente o il documento primario. Due siti che ripubblicano lo stesso lancio non sono due conferme indipendenti.
- Le fonti aziendali sono primarie per ciò che un'azienda annuncia, non prove indipendenti delle prestazioni. Scrivere “annuncia”, “secondo l'azienda” o “risultati dichiarati”; distinguere prototipi, test, ordini e produzione effettiva.
- Separare fatti, dichiarazioni e previsioni. Un'intesa annunciata non è un trattato già in vigore, una proposta non è una legge approvata e un'accusa non è una responsabilità accertata.
- Riassumere con parole originali, senza riportare lunghi passaggi. Non aggiungere aggettivi promozionali o titoli polemici. Conservare attribuzioni e incertezze essenziali anche nelle headline brevi.
- Preferire notizie nuove. Riprendere un tema solo per sviluppi sostanziali. Per la prima edizione sono ammessi aggiornamenti importanti degli ultimi giorni con data visibile; non trasformare questa eccezione in una rassegna settimanale abituale.
- Per i mercati indicare la seduta di riferimento; nei weekend usare l'ultima chiusura, senza presentarla come quotazione live. Nessuna raccomandazione di investimento.
- Fonte principale con `paywall: true` se a pagamento o soggetta a limite di articoli. Aggiungere `freeUrl` solo se una fonte accessibile sostiene la stessa headline, non una homepage o un contesto differente. L'assenza di alternativa è preferibile a un collegamento fuorviante.
- Per eventi verificare programma, luogo, data e orario dell'organizzatore; non suggerire appuntamenti già terminati all'ora di pubblicazione. Il simbolo € indica l'accesso all'articolo, non il costo del biglietto.

## Dati, memoria e pubblicazione

- `data/editions.json` contiene le edizioni reali in ordine decrescente di data: massimo sette giorni di calendario rispetto alla nuova edizione. Non creare edizioni fittizie per i giorni mancanti.
- Per ogni edizione: `date`, `updatedAt` ISO con offset corretto, `note`, `summary`, `items`. Per ogni notizia: `id` stabile, `category`, `source`, `title`, `url`, data originale in `sourceDate` e data/qualifiche visibili in `status` dove utili. `verificationUrls` conserva i riscontri. Per eventi aggiungere `eventDate` se applicabile.
- Conservare in `editorial/research/YYYY-MM-DD.md` una nota breve con motivi della selezione, eccezioni temporali, verifiche, limiti d'accesso e principali esclusioni. Non copiare articoli integrali.
- Aggiornare `SOURCES.md` con osservazioni effettive su originalità, correzioni, date chiare, accessibilità e utilità dei candidati. Promuovere o declassare una fonte sulla base di esperienze ripetute, non di un singolo successo o di opinioni concordanti.
- I voti attuali sono locali al browser: non sono disponibili automaticamente all'editore. Non inventare preferenze o apprendimento automatico. Quando sarà disponibile un canale di raccolta, usare tendenze ripetute preservando le notizie di interesse generale; non pubblicare voti personali nel repository.
- Prima di pubblicare: controllare stato Git e modifiche estranee; validare JSON, date, ID, categorie, link e assenza di segnaposto; verificare la sintassi JavaScript se modificata e la pagina nel browser. Preservare l'archivio reale e le modifiche dell'utente.
- Pubblicare solo modifiche pertinenti al sito e alla redazione. Verificare che GitHub Pages abbia completato la distribuzione e che la pagina pubblica mostri la nuova edizione. Non dichiarare attiva un'automazione solo perché ne sono state scritte le istruzioni.
