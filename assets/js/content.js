/* ==========================================================================
   CONȚINUTUL SITE-ULUI — editează doar fișierul ăsta.
   --------------------------------------------------------------------------
   • Orice text poate fi simplu ("text") sau în două limbi: { ro: "...", en: "..." }
   • Toate textele de mai jos sunt EXEMPLE. Înlocuiește-le cu ale tale.
   • Pentru un proiect cu poză reală, pune calea în `image` (ex: "assets/img/ruta.jpg").
     Dacă `image` e gol, se desenează automat o copertă animată din culorile proiectului.
   ========================================================================== */

window.SITE = {
  defaultLang: "ro",                 // "ro" sau "en"
  name: { first: "Vlad", last: "Purza" },
  initials: "VP",
  email: "salut@vladpurza.ro",       // ← adresa ta
  city: "Cluj-Napoca",
  coords: "46.77°N 23.62°E",         // apar pe portretul generat
  timezone: "Europe/Bucharest",
  available: {
    on: true,                        // false ascunde punctul verde
    text: { ro: "Disponibil din noiembrie", en: "Available from November" },
  },

  role: { ro: "Product designer & front-end developer", en: "Product designer & front-end developer" },

  hero: {
    intro: {
      ro: "Transform idei complicate în produse digitale simple, rapide și frumoase. Design de interfață, cod și tot ce e între ele.",
      en: "I turn complicated ideas into digital products that are simple, fast and good-looking. Interface design, code and everything in between.",
    },
  },

  // Cuvintele care curg în banda de sub prima secțiune
  marquee: {
    ro: ["Product design", "Aplicații mobile", "Site-uri", "Design systems", "Branding", "Prototipare", "Front-end"],
    en: ["Product design", "Mobile apps", "Websites", "Design systems", "Branding", "Prototyping", "Front-end"],
  },

  about: {
    // Paragraful care se „aprinde” cuvânt cu cuvânt la scroll
    text: {
      ro: "De șase ani lucrez cu startup-uri și echipe mici care au o idee bună, dar nu știu încă cum să o arate. Încep mereu cu oamenii care vor folosi produsul, apoi simplific până nu mai rămâne nimic de tăiat. Rezultatul: interfețe pe care le înțelegi din prima și cod care nu se rupe la prima actualizare.",
      en: "For six years I've worked with startups and small teams who have a great idea but don't yet know how to show it. I always start with the people who will use the product, then simplify until there's nothing left to cut. The result: interfaces you get on first look, and code that doesn't break on the next update.",
    },
    photo: "",                       // ex: "assets/img/vlad.jpg" (portret, raport 4:5)
    stats: [
      { value: 6,  suffix: "+", label: { ro: "ani de experiență", en: "years of experience" } },
      { value: 42, suffix: "",  label: { ro: "proiecte livrate",  en: "projects shipped" } },
      { value: 18, suffix: "",  label: { ro: "clienți fideli",    en: "returning clients" } },
      { value: 3,  suffix: "",  label: { ro: "premii de design",  en: "design awards" } },
    ],
  },

  // pattern: "orbits" | "grid" | "waves" | "bars"   → stilul copertei generate
  // palette: [fundal, formă principală, accent]
  projects: [
    {
      title: "Rută",
      year: 2025,
      client: "Primăria Cluj-Napoca",
      role: { ro: "Product design, UX research", en: "Product design, UX research" },
      duration: { ro: "5 luni", en: "5 months" },
      tags: ["iOS", "Android", "UX"],
      pattern: "orbits",
      palette: ["#0f3d2e", "#c9f2d8", "#ffcf4a"],
      image: "",
      link: "",
      summary: {
        ro: "Aplicația de transport public care îți spune exact când pleacă autobuzul și cât te costă drumul.",
        en: "The public transport app that tells you exactly when the bus leaves and what the ride costs.",
      },
      context: {
        ro: "Orașul avea date în timp real despre fiecare autobuz, dar aplicația veche le ascundea în cinci ecrane. Majoritatea oamenilor renunțau și se uitau la panoul din stație.",
        en: "The city had real-time data for every bus, but the old app buried it under five screens. Most people gave up and looked at the board in the station.",
      },
      challenge: {
        ro: "Să facem o aplicație pe care o folosește la fel de ușor un student și bunica lui, cu bilet cumpărat în mai puțin de 10 secunde.",
        en: "Build an app a student and their grandmother can use equally well, with a ticket bought in under 10 seconds.",
      },
      solution: {
        ro: "Un singur ecran principal: unde ești, unde vrei să ajungi, următoarele trei plecări. Bilet cu un tap, salvat offline. Am testat 4 iterații cu 60 de călători reali, în stații.",
        en: "One main screen: where you are, where you're going, the next three departures. One-tap ticket, saved offline. We tested 4 iterations with 60 real riders, at bus stops.",
      },
      results: [
        { value: "8s",   label: { ro: "timp mediu de cumpărare bilet", en: "average ticket purchase time" } },
        { value: "+38%", label: { ro: "bilete vândute din aplicație",  en: "tickets sold in-app" } },
        { value: "4.8★", label: { ro: "rating în App Store",           en: "App Store rating" } },
      ],
    },
    {
      title: "Ledger",
      year: 2024,
      client: "Ledger Fintech SRL",
      role: { ro: "Design system, dashboard", en: "Design system, dashboard" },
      duration: { ro: "7 luni", en: "7 months" },
      tags: ["SaaS", "Dashboard", "Design system"],
      pattern: "bars",
      palette: ["#15151f", "#e9e7ff", "#7c6cff"],
      image: "",
      link: "",
      summary: {
        ro: "Contabilitate pentru firme mici, explicată ca pentru oameni, nu pentru contabili.",
        en: "Bookkeeping for small businesses, explained for people instead of accountants.",
      },
      context: {
        ro: "Patronii de firme mici își deschideau contul doar când primeau un mesaj de la contabil. Nu înțelegeau ce văd, așa că nu reveneau.",
        en: "Small business owners only opened the app when their accountant messaged them. They didn't understand what they saw, so they didn't come back.",
      },
      challenge: {
        ro: "Să transformăm 40 de rapoarte financiare într-o imagine clară: câți bani ai, câți vin, câți pleacă.",
        en: "Turn 40 financial reports into one clear picture: how much money you have, what's coming in, what's going out.",
      },
      solution: {
        ro: "Un dashboard cu trei cifre mari și grafice explicate în propoziții. În spate, un design system cu 120 de componente, ca echipa să livreze ecrane noi în zile, nu săptămâni.",
        en: "A dashboard with three big numbers and charts explained in plain sentences. Behind it, a 120-component design system so the team ships new screens in days, not weeks.",
      },
      results: [
        { value: "3×",   label: { ro: "utilizatori activi săptămânal", en: "weekly active users" } },
        { value: "-52%", label: { ro: "tichete la suport",             en: "support tickets" } },
        { value: "120",  label: { ro: "componente în design system",    en: "design system components" } },
      ],
    },
    {
      title: "Sonor",
      year: 2024,
      client: "Sonor Festival",
      role: { ro: "Identitate vizuală, website", en: "Visual identity, website" },
      duration: { ro: "3 luni", en: "3 months" },
      tags: ["Branding", "Web", "Motion"],
      pattern: "waves",
      palette: ["#ff5436", "#fff1e8", "#1b1030"],
      image: "",
      link: "",
      summary: {
        ro: "Identitatea și site-ul unui festival de muzică electronică, construite din undele sonore ale artiștilor.",
        en: "The identity and website of an electronic music festival, built from the artists' own sound waves.",
      },
      context: {
        ro: "Festivalul ajunsese la a cincea ediție și arăta ca toate celelalte: poze cu mulțimea și un logo pe fundal negru.",
        en: "The festival reached its fifth edition looking like every other one: crowd photos and a logo on black.",
      },
      challenge: {
        ro: "O identitate recognoscibilă fără logo, care să meargă pe un afiș de 6 metri și pe un story de Instagram.",
        en: "An identity you recognise without the logo, that works on a 6-metre poster and an Instagram story.",
      },
      solution: {
        ro: "Fiecare artist din line-up a primit propria formă, generată din spectrul unei piese. Site-ul le animă live, iar biletele se cumpără în doi pași.",
        en: "Every artist in the line-up got their own shape, generated from the spectrum of one of their tracks. The site animates them live, and tickets take two steps.",
      },
      results: [
        { value: "sold out", label: { ro: "cu 3 săptămâni înainte", en: "3 weeks early" } },
        { value: "2,1M",     label: { ro: "afișări pe social media", en: "social media impressions" } },
        { value: "Gold",     label: { ro: "Romanian Design Week",    en: "Romanian Design Week" } },
      ],
    },
    {
      title: "Dospit",
      year: 2023,
      client: "Brutăria Dospit",
      role: { ro: "E-commerce, UI, front-end", en: "E-commerce, UI, front-end" },
      duration: { ro: "2 luni", en: "2 months" },
      tags: ["E-commerce", "Shopify", "UI"],
      pattern: "grid",
      palette: ["#f3e3c3", "#5a2e14", "#e0572c"],
      image: "",
      link: "",
      summary: {
        ro: "Magazinul online al unei brutării de cartier, cu precomandă pentru pâinea de mâine dimineață.",
        en: "The online shop of a neighbourhood bakery, with pre-orders for tomorrow morning's bread.",
      },
      context: {
        ro: "Brutăria arunca zilnic 15% din pâine și avea coadă până în stradă sâmbăta.",
        en: "The bakery threw away 15% of its bread every day and had a queue down the street on Saturdays.",
      },
      challenge: {
        ro: "Să știe brutarul cu o seară înainte câte pâini să facă, fără să complicăm viața clienților.",
        en: "Let the baker know the night before how many loaves to bake, without making life harder for customers.",
      },
      solution: {
        ro: "Precomandă până la ora 20:00, ridicare fără coadă și un abonament săptămânal. Site rapid, construit pe Shopify, cu un design cald ca mirosul de pâine.",
        en: "Pre-order until 8pm, queue-free pickup and a weekly subscription. A fast Shopify site with a design as warm as fresh bread.",
      },
      results: [
        { value: "-70%", label: { ro: "pâine aruncată",          en: "bread thrown away" } },
        { value: "340",  label: { ro: "abonamente active",       en: "active subscriptions" } },
        { value: "1.2s", label: { ro: "timp de încărcare mobil", en: "mobile load time" } },
      ],
    },
  ],

  // Procesul: pașii sunt în ordine, numerotarea are sens
  process: {
    intro: {
      ro: "Așa arată un proiect cu mine, de la primul apel până după lansare. Știi mereu ce urmează, cât durează și ce primești.",
      en: "This is what a project with me looks like, from the first call to after launch. You always know what's next, how long it takes and what you get.",
    },
    steps: [
      {
        title: { ro: "Ascult", en: "Listen" },
        time: { ro: "~1 săptămână", en: "~1 week" },
        text: {
          ro: "Vorbim despre afacerea ta, despre clienți și despre ce înseamnă succes. Mă uit la concurență și la datele pe care le ai deja.",
          en: "We talk about your business, your customers and what success means. I look at competitors and the data you already have.",
        },
        output: { ro: ["Brief clar", "Obiective măsurabile", "Ofertă fixă"], en: ["Clear brief", "Measurable goals", "Fixed quote"] },
      },
      {
        title: { ro: "Structurez", en: "Structure" },
        time: { ro: "1–2 săptămâni", en: "1–2 weeks" },
        text: {
          ro: "Desenez fluxurile și schițele în alb-negru. Aici decidem ce intră, ce rămâne pe dinafară și în ce ordine.",
          en: "I draw the flows and black-and-white wireframes. This is where we decide what goes in, what stays out and in what order.",
        },
        output: { ro: ["Hartă a site-ului", "Wireframe-uri", "Fluxuri de utilizare"], en: ["Sitemap", "Wireframes", "User flows"] },
      },
      {
        title: { ro: "Design", en: "Design" },
        time: { ro: "2–4 săptămâni", en: "2–4 weeks" },
        text: {
          ro: "Interfața finală, culori, tipografie, animații. Primești un prototip pe care îl poți atinge pe telefon și îl testăm cu oameni reali.",
          en: "Final interface, colours, typography, motion. You get a prototype you can tap through on your phone, and we test it with real people.",
        },
        output: { ro: ["Prototip interactiv", "Design system", "Teste cu utilizatori"], en: ["Interactive prototype", "Design system", "User tests"] },
      },
      {
        title: { ro: "Construiesc", en: "Build" },
        time: { ro: "2–6 săptămâni", en: "2–6 weeks" },
        text: {
          ro: "Scriu codul sau lucrez cot la cot cu echipa ta de dezvoltare. După lansare urmăresc cifrele și ajustez ce trebuie.",
          en: "I write the code or work side by side with your dev team. After launch I watch the numbers and adjust what's needed.",
        },
        output: { ro: ["Produs live", "Documentație", "30 de zile suport"], en: ["Live product", "Documentation", "30 days of support"] },
      },
    ],
  },

  services: [
    {
      title: { ro: "Product design", en: "Product design" },
      text: {
        ro: "Aplicații web și mobile, de la idee la ecrane gata de cod. Cercetare, fluxuri, interfață, prototipuri.",
        en: "Web and mobile apps, from idea to screens ready for code. Research, flows, interface, prototypes.",
      },
      tools: ["Figma", "Protopie", "Maze"],
    },
    {
      title: { ro: "Site-uri de prezentare", en: "Marketing websites" },
      text: {
        ro: "Site-uri rapide, care arată bine pe orice ecran și pe care le poți actualiza singur.",
        en: "Fast websites that look great on any screen and that you can update yourself.",
      },
      tools: ["Astro", "Webflow", "Shopify"],
    },
    {
      title: { ro: "Design systems", en: "Design systems" },
      text: {
        ro: "O bibliotecă de componente care ține designul și codul în sincron, ca echipa să livreze mai repede.",
        en: "A component library that keeps design and code in sync so your team ships faster.",
      },
      tools: ["Figma", "Storybook", "React"],
    },
    {
      title: { ro: "Front-end", en: "Front-end" },
      text: {
        ro: "Transform designul în cod curat, accesibil și animat cu grijă.",
        en: "I turn design into clean, accessible code with careful motion.",
      },
      tools: ["React", "TypeScript", "GSAP"],
    },
  ],

  experience: [
    { years: "2022 — acum", role: { ro: "Designer independent", en: "Independent designer" }, place: "Freelance", note: { ro: "Startup-uri din România, Germania și Olanda", en: "Startups from Romania, Germany and the Netherlands" } },
    { years: "2020 — 2022", role: { ro: "Senior product designer", en: "Senior product designer" }, place: "Fintech Studio", note: { ro: "Am condus designul pentru 3 produse financiare", en: "Led design for 3 financial products" } },
    { years: "2018 — 2020", role: { ro: "UI designer & front-end", en: "UI designer & front-end" }, place: "Agenția Pixel", note: { ro: "Site-uri și magazine online pentru 20+ branduri", en: "Websites and online shops for 20+ brands" } },
  ],

  faq: [
    {
      q: { ro: "Cât costă un proiect?", en: "How much does a project cost?" },
      a: {
        ro: "Depinde de mărime. Un site de prezentare pornește de la 2.500 €, o aplicație de la 8.000 €. După primul apel primești o ofertă fixă, fără costuri ascunse.",
        en: "It depends on the size. A marketing site starts at €2,500, an app at €8,000. After our first call you get a fixed quote with no hidden costs.",
      },
    },
    {
      q: { ro: "Cât durează?", en: "How long does it take?" },
      a: {
        ro: "Un site durează de obicei 4–6 săptămâni, o aplicație între 2 și 5 luni. Primești un calendar pe săptămâni înainte să începem.",
        en: "A website usually takes 4–6 weeks, an app 2 to 5 months. You get a week-by-week schedule before we start.",
      },
    },
    {
      q: { ro: "Lucrezi și cu clienți din afara României?", en: "Do you work with clients outside Romania?" },
      a: {
        ro: "Da, cam jumătate din clienți sunt din străinătate. Lucrăm în română sau engleză, cu apeluri video săptămânale.",
        en: "Yes, about half of my clients are abroad. We work in Romanian or English, with weekly video calls.",
      },
    },
    {
      q: { ro: "Ce primesc la final?", en: "What do I get at the end?" },
      a: {
        ro: "Toate fișierele de design, codul sursă, documentație și 30 de zile de suport gratuit după lansare. Totul îți aparține.",
        en: "All design files, the source code, documentation and 30 days of free support after launch. You own everything.",
      },
    },
  ],

  // Pune link-urile tale aici
  socials: [
    { name: "LinkedIn",  url: "https://www.linkedin.com/" },
    { name: "Dribbble",  url: "https://dribbble.com/" },
    { name: "Instagram", url: "https://www.instagram.com/" },
    { name: "GitHub",    url: "https://github.com/purzavlad" },
  ],

  /* ---- Textele interfeței (meniuri, butoane). De obicei nu e nevoie să le schimbi. ---- */
  ui: {
    ro: {
      nav: { work: "Proiecte", about: "Despre", process: "Proces", contact: "Contact" },
      menu: "Meniu", close: "Închide",
      seeWork: "Vezi proiectele", talk: "Hai să vorbim",
      scroll: "Derulează",
      aboutLabel: "Despre mine",
      workLabel: "Proiecte selectate",
      workTitle: "Proiecte de care sunt mândru.",
      processTitle: "Patru pași, zero surprize.",
      servicesTitle: "De la idee la produs live.",
      faqTitle: "Bine de știut înainte să-mi scrii.",
      processLabel: "Cum lucrez",
      servicesLabel: "Ce pot face pentru tine",
      experienceLabel: "Experiență",
      faqLabel: "Întrebări frecvente",
      openCase: "Vezi studiul de caz",
      view: "Vezi",
      client: "Client", role: "Rol", year: "An", duration: "Durată",
      context: "Contextul", challenge: "Provocarea", solution: "Soluția", results: "Rezultate",
      visit: "Vezi proiectul live",
      next: "Proiectul următor", prev: "Proiectul anterior",
      youGet: "Primești",
      contactTitle: ["Ai un proiect?", "Hai să vorbim."],
      contactText: "Scrie-mi câteva rânduri despre ce ai în minte. Răspund în maxim 24 de ore, de luni până vineri.",
      copy: "Copiază", copied: "Adresa a fost copiată", copyFail: "Selectează adresa și copiaz-o manual",
      write: "Trimite un e-mail",
      localTime: "Ora locală",
      backTop: "Înapoi sus",
      rights: "Toate drepturile rezervate.",
      theme: "Schimbă tema", lang: "Switch to English",
      skip: "Sari la conținut",
    },
    en: {
      nav: { work: "Work", about: "About", process: "Process", contact: "Contact" },
      menu: "Menu", close: "Close",
      seeWork: "See the work", talk: "Let's talk",
      scroll: "Scroll",
      aboutLabel: "About me",
      workLabel: "Selected work",
      workTitle: "Work I'm proud of.",
      processTitle: "Four steps, zero surprises.",
      servicesTitle: "From idea to live product.",
      faqTitle: "Good to know before you write.",
      processLabel: "How I work",
      servicesLabel: "What I can do for you",
      experienceLabel: "Experience",
      faqLabel: "Frequently asked",
      openCase: "Read the case study",
      view: "View",
      client: "Client", role: "Role", year: "Year", duration: "Duration",
      context: "Context", challenge: "The challenge", solution: "The solution", results: "Results",
      visit: "Visit the live project",
      next: "Next project", prev: "Previous project",
      youGet: "You get",
      contactTitle: ["Got a project?", "Let's talk."],
      contactText: "Send me a few lines about what you have in mind. I reply within 24 hours, Monday to Friday.",
      copy: "Copy", copied: "Address copied", copyFail: "Select the address and copy it manually",
      write: "Send an email",
      localTime: "Local time",
      backTop: "Back to top",
      rights: "All rights reserved.",
      theme: "Switch theme", lang: "Schimbă în română",
      skip: "Skip to content",
    },
  },
};
