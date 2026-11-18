# Spanish style guide

How bchworks.com reads in Spanish. Machine drafts follow a short version of
this guide (`src/i18n/glossary/es.style.md`), and reviewers check drafts
against the full text here. The pipeline itself is in `docs/i18n.md`.

When this guide changes, update the brief to match. When a term changes in
`src/i18n/glossary/es.json`, redraft the pages that use it with
`pnpm i18n:draft es --only <glob> --restale`.

## Audience and variety

- **Neutral Latin American Spanish.** Write for a reader in Mexico, Argentina,
  Colombia or Venezuela at once. Avoid words that belong to one country, and
  avoid Spain-only vocabulary.
- **Plain words for a general audience.** The English copy is written for
  people new to Bitcoin Cash. Keep it that way: short sentences, everyday
  verbs, technical terms glossed on first use.

| Use | Not | Why |
|---|---|---|
| billetera | monedero, cartera | Spain / leather wallet |
| computadora | ordenador | Spain |
| celular | móvil | Spain |
| comisión | tarifa | tarifa reads as a price list |
| hacer clic | pinchar | Spain |
| ustedes | vosotros | vosotros is Spain only |
| conseguir, obtener | coger | coger is vulgar in much of Latin America |

## Register

- **Tú, always.** Address the reader as *tú*: *puedes*, *tu billetera*,
  *descarga la app*. Never *usted*, never *vos*. Mixing registers on one page
  is the error a reviewer looks for first.
- **Plural you is *ustedes*.** It is the only plural form in Latin America.
- **Menu items, buttons and tabs take the infinitive:** *Comprar BCH*,
  *Comparar billeteras*, *Conseguir una billetera*. Calls to action inside
  prose take the *tú* imperative: *Consigue una billetera y prueba con poco
  dinero.*
- **Tone matches the English:** direct, a little dry, honest about risk. Do
  not add enthusiasm (*¡increíble!*) the English does not have.
- **Gender-neutral where it is cheap:** *las personas que usan BCH* rather than
  *los usuarios* when the sentence allows it. Do not use *-e*, *@* or *x*
  endings.

## Terminology

- **The glossary decides.** `src/i18n/glossary/es.json` maps each English term
  to its Spanish rendering, with a note where a choice was made. Use it even
  when another word feels more natural to you; consistency across 115K words
  matters more.
- **Names stay in English.** Project, protocol and product names are never
  translated: Bitcoin Cash, BCH, CashTokens, CashScript, Electron Cash,
  Cauldron, BCHN. The full list is `src/i18n/glossary/dnt.txt` plus every
  project in the directory.
- **Some technical terms stay in English** because Spanish speakers use them
  that way: *UTXO*, *token*, *hash*, *opcode*, *covenant*, *halving*,
  *hard fork*, *mempool*, *exchange*, *stablecoin*, *blockchain*. Give each one
  a gender and keep it: *el UTXO*, *la mempool*, *el halving*, *la blockchain*.
  Plurals take *-s*: *los UTXOs*, *los tokens*.
- **Gloss on first use.** The first time a page uses a kept English term or a
  less familiar Spanish one, explain it once, in parentheses or a short
  clause: *autocustodia (tú guardas tus propias claves)*. The glossary notes
  give the gloss.
- **Do not italicise kept English terms.** They are part of the vocabulary,
  not foreign words.

## Numbers, amounts and dates

These match what `src/i18n/format.ts` prints for the `es` locale, so prose and
generated figures agree.

- **Decimal comma:** *0,5 BCH*, *1,5 %*, *2,3 MB*.
- **Thousands:** a point from five digits up: *12.345*, *1.000.000*. Four
  digits take no separator: *2048*, *1234,5*.
- **Years never take a separator:** *2017*, *2026*.
- **Currency:** the amount, a space, then the symbol: *1234,50 US$*,
  *0,01 BCH*. Keep the currency the English names; do not convert.
- **Percent:** a space before the sign: *15 %*.
- **Dates:** day, month in lowercase, year: *18 de noviembre de 2026*. Months
  and weekdays take no capital. Short form: *18/11/2026*, never month first.
- **Time:** 24-hour clock where the English gives a time: *14:30*.
- **Block heights, hashes, addresses and code** are data. Copy them exactly;
  do not add separators: *bloque 478558*.

## Punctuation and capitalisation

- **Sentence case for every title and heading.** Capitalise the first word and
  proper names only: *Cómo elegir una billetera*, not *Cómo Elegir Una
  Billetera*. This applies to page titles, headings, nav labels and buttons.
- **Opening marks:** *¿…?* and *¡…!*, always, including in headings and short
  labels: *¿Está muerto BCH?*
- **Quotes:** use *“…”* in prose. Code, attribute values and JSON keep straight
  quotes.
- **No serial comma** before *y* or *o*: *rápido, barato y seguro*.
- **Lists:** keep the English list structure; start each item with a capital.
- **Abbreviations:** *p. ej.*, *etc.*, *EE. UU.* Spell out a term before its
  acronym only when the English does.

## Citing the English source

Most of the site cites English documents: CHIP specifications, the
whitepaper, mailing-list posts, GitHub issues.

- **Link to the English original.** There is rarely a Spanish version; never
  invent one.
- **Keep the document title in English,** and add a Spanish gloss in
  parentheses the first time when the title is not self-explanatory: *CHIP
  “VM Limits” (límites de la máquina virtual)*.
- **Translate a quotation, and mark it:** give the Spanish, then *(traducción
  nuestra)* after the closing quote. Keep a short phrase in English instead
  when the exact wording is the point, for example *peer-to-peer electronic
  cash*, followed by its Spanish meaning.
- **Mark English-only links** when the link text is in Spanish and the page is
  not: add *(en inglés)* after the link.
- **Author names, dates and version numbers** stay as the source gives them;
  dates follow the format above.

## Review checklist

1. *Tú* everywhere, no *usted* or *vos*; menu and button labels in the
   infinitive.
2. Every glossary term rendered as the glossary says.
3. Names and do-not-translate terms unchanged.
4. Numbers with a decimal comma, dates as *18 de noviembre de 2026*.
5. Titles in sentence case, opening *¿* and *¡* present.
6. Nothing added or dropped compared to the English.
