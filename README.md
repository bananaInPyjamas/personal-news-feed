# Briefing Quotidiano

Prototipo di una rassegna quotidiana in italiano, mobile-first, ricercata e aggiornata da Codex. GitHub Pages svolge soltanto il ruolo di pubblicazione statica: il repository non contiene servizi di ricerca o riepilogo AI.

## Prototipo

La prima versione dimostra:

- copertina basata sul tema open source Creative di Start Bootstrap;
- breve editoriale “Il giorno in breve” prima delle notizie;
- otto sezioni editoriali con circa dieci headline complessive;
- stati vuoti espliciti per le categorie senza aggiornamenti;
- archivio navigabile degli ultimi sette giorni;
- rubrica separata “Eventi del weekend” nell’edizione del venerdì;
- indicatori per paywall e alternativa gratuita;
- feedback a un click con persistenza locale nel browser.

I contenuti attuali sono esclusivamente dimostrativi. I link diventeranno attivi quando verrà introdotto il processo editoriale con notizie reali.

## Struttura

- `index.html`: pagina principale statica;
- `data/editions.json`: edizioni e notizie visualizzate;
- `assets/css/creative.css`: base Creative/Bootstrap;
- `assets/css/custom.css`: design specifico del briefing;
- `assets/js/app.js`: rendering, archivio e feedback locale.

## Crediti e licenze

Il progetto usa [Creative](https://github.com/StartBootstrap/startbootstrap-creative) di Start Bootstrap, distribuito con licenza MIT. La fotografia di copertina è di [Annie Spratt su Unsplash](https://unsplash.com/photos/a-stack-of-newspapers-sitting-on-top-of-a-wooden-table-hWJsOnaWTqs), utilizzata secondo la licenza Unsplash.
