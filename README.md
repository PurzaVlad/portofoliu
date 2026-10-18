# Portofoliu — Vlad Purza

Site de portofoliu static: HTML, CSS și JavaScript simplu. Nu are nevoie de build, framework sau server special.

## Ce conține

- **Nume uriaș interactiv**: fiecare literă își schimbă grosimea după poziția mouse-ului (sau a degetului, pe telefon). Când nu atingi nimic, se mișcă singure.
- **Proiecte în carduri suprapuse**: la scroll, cardurile se așază unul peste altul. Coperțile sunt desenate automat din culorile fiecărui proiect.
- **Studii de caz**: click pe un proiect deschide povestea lui în trei pași (context, provocare, soluție) plus rezultatele în cifre.
- **Procesul de lucru**: pe desktop se derulează orizontal, pe telefon vertical.
- Servicii, experiență, întrebări frecvente, contact cu buton de copiere a e-mailului.
- **Română / engleză** și **temă luminoasă / întunecată**, cu butoane în colțul din dreapta sus.
- Funcționează pe telefon, tabletă și desktop. Respectă setarea „mișcare redusă” din sistem.

## Cum schimb textele

Tot conținutul e într-un singur fișier: **`assets/js/content.js`**.

- Numele, e-mailul, orașul, fusul orar
- Textul de prezentare și cifrele (ani de experiență, proiecte etc.)
- Proiectele: titlu, client, an, descriere, context, provocare, soluție, rezultate, culori
- Pașii procesului, serviciile, experiența, întrebările frecvente
- Link-urile către rețelele sociale

Orice text poate fi scris o singură dată (`"text"`) sau în două limbi (`{ ro: "...", en: "..." }`).

> **Atenție:** toate textele, proiectele și cifrele din `content.js` sunt exemple. Înlocuiește-le cu ale tale înainte să publici site-ul.

### Poze reale

- **Proiect:** pune imaginea în `assets/img/` și scrie calea în câmpul `image` al proiectului (ex. `image: "assets/img/ruta.jpg"`). Dacă `image` e gol, se desenează automat o copertă animată.
- **Portret:** scrie calea în `about.photo` (raport recomandat 4:5).

### Culori și fonturi

În `assets/css/style.css`, la început, găsești culorile (`--cobalt`, `--paper`, `--ink`...) pentru tema luminoasă și cea întunecată. Schimbă `--cobalt` și se schimbă tot site-ul.

## Cum îl văd local

Deschide `index.html` direct în browser sau, mai bine, pornește un server mic:

```bash
python3 -m http.server 8000
# apoi deschide http://localhost:8000
```

## Cum îl public gratuit (GitHub Pages)

1. Pe GitHub, intră în repo → **Settings** → **Pages**.
2. La **Source** alege **Deploy from a branch**, apoi branch-ul `main` și folderul `/ (root)`.
3. După un minut site-ul e live la `https://<utilizator>.github.io/portofoliu/`.

Merge la fel de bine pe Netlify, Vercel sau Cloudflare Pages: tragi folderul în pagină și gata.

## Structura

```
index.html              scheletul paginii
assets/js/content.js    TOT conținutul (editează aici)
assets/js/main.js       animații și interacțiuni
assets/css/style.css    design, culori, responsive
assets/favicon.svg      iconița din tab
```
