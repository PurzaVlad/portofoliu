/* ==========================================================================
   Logica site-ului. Conținutul vine din content.js — aici nu e nevoie să
   modifici nimic ca să schimbi texte sau proiecte.
   ========================================================================== */
(() => {
  "use strict";

  const S = window.SITE;
  const doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- Utilitare ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const stackMQ = matchMedia("(min-width: 900px) and (min-height: 680px)");
  if (reduce) doc.classList.add("reduced");

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stocare blocată */ } },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* stocare blocată */ } },
  };

  let lang = store.get("vp-lang") || S.defaultLang || "ro";
  if (!S.ui[lang]) lang = "ro";
  const t = (v) => (v && typeof v === "object" && !Array.isArray(v)) ? (v[lang] ?? v.ro ?? v.en ?? "") : (v ?? "");
  const ui = () => S.ui[lang];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const fullName = `${S.name.first} ${S.name.last}`;

  /* Împarte un text în litere animabile, ținând cuvintele întregi */
  const letters = (text, start = 0) => {
    let i = start;
    return String(text).split(" ").map((word) =>
      `<span class="word" style="display:inline-block;white-space:nowrap">${[...word].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`
    ).join(" ");
  };

  const icons = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  };

  const isDark = () => {
    const set = doc.getAttribute("data-theme");
    if (set) return set === "dark";
    return matchMedia("(prefers-color-scheme: dark)").matches;
  };

  /* ==========================================================================
     RANDARE
     ========================================================================== */
  const sections = [
    ["proiecte", "work"],
    ["despre", "about"],
    ["proces", "process"],
    ["contact", "contact"],
  ];

  function renderHeader() {
    const u = ui();
    $("#header").innerHTML = `
      <div class="wrap header__bar">
        <a class="logo" href="#top" aria-label="${esc(fullName)}">
          <span class="logo__mark" data-magnetic>${esc(S.initials)}</span>
          ${S.available && S.available.on ? `<span class="logo__status"><i class="dot-live"></i>${esc(t(S.available.text))}</span>` : ""}
        </a>
        <nav class="nav" aria-label="Principal">
          ${sections.map(([id, k]) => `<a href="#${id}"><span data-text="${esc(u.nav[k])}">${esc(u.nav[k])}</span></a>`).join("")}
        </nav>
        <div class="header__tools">
          <button class="tool" id="lang-btn" type="button" aria-label="${esc(u.lang)}" title="${esc(u.lang)}">${lang === "ro" ? "EN" : "RO"}</button>
          <button class="tool" id="theme-btn" type="button" aria-label="${esc(u.theme)}" title="${esc(u.theme)}">${isDark() ? icons.sun : icons.moon}</button>
          <button class="tool menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span>${esc(u.menu)}</span><i></i></button>
        </div>
      </div>`;

    $("#menu").innerHTML = `
      <div class="wrap menu__links">
        ${sections.map(([id, k], i) => `<a href="#${id}"><small>${pad(i + 1)}</small>${esc(u.nav[k])}</a>`).join("")}
      </div>
      <div class="wrap menu__foot">
        <span>${esc(S.email)}</span>
        <span>${S.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(" · ")}</span>
      </div>`;
  }

  function renderMain() {
    const u = ui();
    const P = S.projects;

    const hero = `
      <section class="band hero" id="top" aria-label="Intro">
        <canvas class="hero__grain" id="grain" aria-hidden="true"></canvas>
        <div class="wrap">
          <div class="hero__meta">
            <span>${esc(t(S.role))}</span>
            <span>${esc(S.city)}, RO</span>
            <span>${esc(u.localTime)} <span class="tnum" data-clock>--:--</span></span>
          </div>
          <div class="hero__stage">
            <h1 class="hero__name vf" aria-label="${esc(fullName)}">
              <span class="line" aria-hidden="true">${letters(S.name.first)}</span>
              <span class="line" aria-hidden="true">${letters(S.name.last, S.name.first.length)}</span>
            </h1>
            <div class="hero__foot">
              <p class="hero__intro">${esc(t(S.hero.intro))}</p>
              <div class="hero__ctas">
                <a class="btn" href="#proiecte" data-magnetic>${esc(u.seeWork)} <span class="arrow" aria-hidden="true">↓</span></a>
                <a class="btn btn--ghost" href="#contact" data-magnetic>${esc(u.talk)}</a>
              </div>
            </div>
            <span class="hero__scroll" aria-hidden="true"><i></i>${esc(u.scroll)}</span>
          </div>
        </div>
      </section>`;

    const words = t(S.marquee);
    const group = `<div class="marquee__group">${[...words, ...words].map((w) => `<span class="marquee__item">${esc(w)}</span>`).join("")}</div>`;
    const marquee = `<div class="marquee" aria-hidden="true"><div class="marquee__track">${group}${group}</div></div>`;

    const a = S.about;
    const about = `
      <section class="section about" id="despre">
        <div class="wrap">
          <div class="about__grid">
            <div>
              <p class="eyebrow">${esc(u.aboutLabel)}</p>
              <h2 class="reveal-text" style="margin-top:28px">${t(a.text).split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ")}</h2>
            </div>
            <figure class="portrait rise">
              ${a.photo
                ? `<img src="${esc(a.photo)}" alt="${esc(fullName)}" loading="lazy">`
                : `<canvas data-print aria-hidden="true"></canvas>
                   <div class="portrait__tag"><span>${esc(S.city)}</span><span>${esc(S.coords || "")}</span></div>
                   <span class="portrait__mono" aria-hidden="true">${esc(S.initials)}</span>`}
            </figure>
          </div>
          <div class="stats">
            ${a.stats.map((s) => `
              <div class="stat rise">
                <span class="stat__num" data-count="${s.value}" data-suffix="${esc(s.suffix || "")}">${s.value}${esc(s.suffix || "")}</span>
                <span class="stat__label">${esc(t(s.label))}</span>
              </div>`).join("")}
          </div>
        </div>
      </section>`;

    const work = `
      <section class="section work" id="proiecte">
        <div class="wrap">
          <div class="section__head rise">
            <p class="eyebrow">${esc(u.workLabel)} <span class="count">(${pad(P.length)})</span></p>
            <h2 class="section__title">${esc(u.workTitle)}</h2>
          </div>
          <div class="stack">
            ${P.map((p, i) => `
              <article class="card" style="--i:${i}" data-case="${i}">
                <div class="card__cover" data-cursor="${esc(u.view)}">
                  ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : `<canvas data-cover="${i}" aria-hidden="true"></canvas>`}
                </div>
                <div class="card__body">
                  <div class="card__intro">
                    <div class="card__top"><span>${pad(i + 1)} / ${pad(P.length)}</span><span>${esc(p.client)} · ${p.year}</span></div>
                    <h3 class="card__title">${esc(p.title)}</h3>
                    <p class="card__summary">${esc(t(p.summary))}</p>
                  </div>
                  <div class="card__intro">
                    <div class="tags">${p.tags.map((g) => `<span class="tag">${esc(g)}</span>`).join("")}</div>
                    <button class="btn card__cta" type="button" data-open="${i}" data-magnetic>${esc(u.openCase)} <span class="arrow" aria-hidden="true">↗</span></button>
                  </div>
                </div>
                <div class="card__shade"></div>
              </article>`).join("")}
          </div>
        </div>
      </section>`;

    const pr = S.process;
    const process = `
      <section class="process" id="proces">
        <div class="process__pin">
          <div class="section">
            <div class="wrap process__layout">
              <div class="section__head">
                <p class="eyebrow">${esc(u.processLabel)}</p>
                <h2 class="section__title">${esc(u.processTitle)}</h2>
                <p class="process__intro">${esc(t(pr.intro))}</p>
                <div class="process__progress" aria-hidden="true"><i></i></div>
              </div>
              <div class="steps-viewport">
                <ol class="steps">
                  ${pr.steps.map((s, i) => `
                    <li class="step rise">
                      <span class="step__num" aria-hidden="true">${pad(i + 1)}</span>
                      <div class="step__head"><h3 class="step__title">${esc(t(s.title))}</h3><span class="step__time">${esc(t(s.time))}</span></div>
                      <p class="step__text">${esc(t(s.text))}</p>
                      <div class="step__out">
                        <span class="step__out-label">${esc(u.youGet)}</span>
                        <ul>${t(s.output).map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
                      </div>
                    </li>`).join("")}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>`;

    const services = `
      <section class="section services" id="servicii">
        <div class="wrap">
          <div class="section__head rise">
            <p class="eyebrow">${esc(u.servicesLabel)}</p>
            <h2 class="section__title">${esc(u.servicesTitle)}</h2>
          </div>
          <div class="services__list">
            ${S.services.map((s) => `
              <div class="service rise">
                <h3 class="service__title">${esc(t(s.title))}</h3>
                <p class="service__text">${esc(t(s.text))}</p>
                <div class="service__tools">${s.tools.map((g) => `<span class="tag">${esc(g)}</span>`).join("")}</div>
              </div>`).join("")}
          </div>
        </div>
      </section>`;

    const experience = `
      <section class="section experience" id="experienta" style="padding-top:0">
        <div class="wrap">
          <div class="section__head rise">
            <p class="eyebrow">${esc(u.experienceLabel)}</p>
          </div>
          <div class="xp">
            ${S.experience.map((x) => `
              <div class="xp__row rise">
                <span class="xp__years">${esc(t(x.years))}</span>
                <span class="xp__role">${esc(t(x.role))}</span>
                <span class="xp__place">${esc(t(x.place))}</span>
                <span class="xp__note">${esc(t(x.note))}</span>
              </div>`).join("")}
          </div>
        </div>
      </section>`;

    const faq = `
      <section class="section faq" id="intrebari" style="padding-top:0">
        <div class="wrap faq__grid">
          <div class="section__head rise">
            <p class="eyebrow">${esc(u.faqLabel)}</p>
            <h2 class="section__title">${esc(u.faqTitle)}</h2>
          </div>
          <div class="faq__list">
            ${S.faq.map((f, i) => `
              <details class="qa rise"${i === 0 ? " open" : ""}>
                <summary>${esc(t(f.q))}<span class="qa__icon" aria-hidden="true"></span></summary>
                <p class="qa__a">${esc(t(f.a))}</p>
              </details>`).join("")}
          </div>
        </div>
      </section>`;

    const contact = `
      <section class="band contact" id="contact">
        <div class="wrap">
          <p class="eyebrow">${S.available && S.available.on ? esc(t(S.available.text)) : esc(u.nav.contact)}</p>
          <h2 class="contact__title vf" aria-label="${esc(u.contactTitle.join(" "))}">
            <span class="line" aria-hidden="true">${letters(u.contactTitle[0])}</span>
            <span class="line" aria-hidden="true">${letters(u.contactTitle[1], 40)}</span>
          </h2>
          <div class="contact__grid">
            <p class="contact__text rise">${esc(u.contactText)}</p>
            <div class="mail rise">
              <span class="mail__addr" id="mail-addr">${esc(S.email)}</span>
              <div class="mail__actions">
                <button class="btn" type="button" id="copy-btn" data-magnetic>${esc(u.copy)}</button>
                <a class="btn btn--ghost" href="mailto:${esc(S.email)}" data-magnetic>${esc(u.write)} <span class="arrow" aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
          <ul class="socials">
            ${S.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} <span aria-hidden="true">↗</span></a></li>`).join("")}
          </ul>
        </div>
      </section>`;

    $("#main").innerHTML = hero + marquee + about + work + process + services + experience + faq + contact;

    $("#footer").innerHTML = `
      <div class="wrap footer__bar">
        <span>© ${new Date().getFullYear()} ${esc(fullName)}. ${esc(u.rights)}</span>
        <span>${esc(S.city)} · <span class="tnum" data-clock>--:--</span></span>
        <a class="footer__top" href="#top">${esc(u.backTop)} <span aria-hidden="true">↑</span></a>
      </div>`;

    $("#skip-link").textContent = u.skip;
    $("#loader-name").textContent = `${fullName} — ${t(S.role)}`;
    doc.lang = lang;
  }

  /* ==========================================================================
     COPERȚI GENERATIVE (canvas)
     ========================================================================== */
  const css = (name) => getComputedStyle(doc).getPropertyValue(name).trim();
  let theme = {};
  const readTheme = () => { theme = { cobalt: css("--cobalt"), on: css("--on-cobalt") }; };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, [r, r, 0, 0]);
    else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  const PATTERNS = {
    /* Orbite — transport, trasee */
    orbits(ctx, w, h, t, [bg, fg, ac]) {
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const cx = w * 0.6, cy = h * 0.52, R = Math.hypot(w, h) * 0.55, n = 16;
      const lw = Math.max(1, Math.min(w, h) / 300);
      ctx.lineWidth = lw; ctx.strokeStyle = fg;
      const rotOf = (k) => -0.45 + Math.sin(t * 0.25 + k * 0.25) * 0.12;
      for (let k = 1; k <= n; k++) {
        const r = (R * k) / n;
        ctx.globalAlpha = 0.08 + 0.45 * (1 - k / n);
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.42, rotOf(k), 0, TAU); ctx.stroke();
      }
      for (let k = 2; k <= n; k += 2) {
        const r = (R * k) / n, rot = rotOf(k), a = t * (1.8 / k) + k * 1.7;
        const ex = r * Math.cos(a), ey = r * 0.42 * Math.sin(a);
        const x = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
        const y = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
        const big = k === 6;
        ctx.globalAlpha = 1; ctx.fillStyle = big ? ac : fg;
        ctx.beginPath(); ctx.arc(x, y, (big ? 7 : 3) * lw, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(cx, cy, R * 0.04, 0, TAU); ctx.fill();
    },

    /* Bare — finanțe, grafice */
    bars(ctx, w, h, t, [bg, fg, ac]) {
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const n = w < 520 ? 16 : 28, gap = w / n, bw = gap * 0.56, base = h * 0.9, top = h * 0.2;
      const pts = [];
      ctx.strokeStyle = fg; ctx.globalAlpha = 0.12; ctx.lineWidth = 1;
      for (let g = 0; g < 5; g++) { const y = top + ((base - top) * g) / 4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let i = 0; i < n; i++) {
        const v = 0.5 + 0.5 * Math.sin(i * 0.42 + t * 0.9) * Math.cos(i * 0.17 - t * 0.55);
        const bh = (base - top) * (0.2 + 0.8 * (v * 0.65 + 0.35 * (i / n)));
        const x = i * gap + (gap - bw) / 2;
        ctx.globalAlpha = 0.9; ctx.fillStyle = fg;
        roundRect(ctx, x, base - bh, bw, bh, bw / 2);
        pts.push([x + bw / 2, base - bh - h * 0.07]);
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = ac; ctx.lineWidth = Math.max(2, w / 300); ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const j = Math.floor((t * 1.2) % n), [px, py] = pts[j];
      ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(px, py, Math.max(5, w / 110), 0, TAU); ctx.fill();
      ctx.strokeStyle = bg; ctx.lineWidth = Math.max(2, w / 300); ctx.stroke();
    },

    /* Unde — muzică, festival */
    waves(ctx, w, h, t, [bg, fg, ac]) {
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const n = w < 520 ? 16 : 24, lw = Math.max(1.5, w / 440), step = Math.max(4, w / 180);
      ctx.lineWidth = lw; ctx.lineJoin = "round";
      for (let j = 0; j < n; j++) {
        const y0 = h * (0.18 + (0.74 * j) / (n - 1));
        const pts = [];
        for (let x = 0; x <= w + step; x += step) {
          const u = x / w;
          const env = Math.exp(-Math.pow((u - 0.5 - 0.12 * Math.sin(t * 0.3 + j * 0.2)) / 0.2, 2));
          const amp = h * 0.18 * (0.55 + 0.45 * Math.sin(j * 0.9 + t * 1.1));
          pts.push([x, y0 - env * amp * Math.abs(Math.sin(u * 16 + t * 1.8 + j * 0.45))]);
        }
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = bg; ctx.fill();
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        const hot = j % 6 === 3;
        ctx.strokeStyle = hot ? ac : fg; ctx.stroke();
      }
    },

    /* Grilă de cercuri — brutărie, aluat */
    grid(ctx, w, h, t, [bg, fg, ac]) {
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const cell = Math.max(28, Math.min(w, h) / 6.5);
      const cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
      const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
      const cx = w * 0.5 + Math.cos(t * 0.4) * w * 0.15, cy = h * 0.5 + Math.sin(t * 0.3) * h * 0.15;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = ox + c * cell + cell / 2, y = oy + r * cell + cell / 2;
          const d = Math.hypot(x - cx, y - cy) / cell;
          const s = 0.5 + 0.5 * Math.sin(d * 0.9 - t * 1.6);
          const hot = ((c * 7 + r * 13) % 11) === 0;
          ctx.fillStyle = hot ? ac : fg;
          ctx.beginPath(); ctx.arc(x, y, cell * 0.44 * (0.22 + 0.78 * s), 0, TAU); ctx.fill();
        }
      }
    },

    /* Amprentă — pentru portretul generat */
    print(ctx, w, h, t, [bg, fg]) {
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const cx = w * 0.58, cy = h * 0.36, n = 24, sp = Math.max(w, h) / 26;
      ctx.strokeStyle = fg; ctx.lineWidth = Math.max(1, w / 320);
      for (let k = 1; k <= n; k++) {
        ctx.globalAlpha = 0.12 + 0.3 * (1 - k / n);
        ctx.beginPath();
        for (let a = 0; a <= TAU + 0.07; a += 0.07) {
          const r = k * sp + Math.sin(a * 3 + k * 0.6 + t * 0.35) * sp * 0.38 + Math.sin(a * 7 - k * 0.3 - t * 0.2) * sp * 0.14;
          const x = cx + Math.cos(a) * r * 0.8, y = cy + Math.sin(a) * r;
          a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    },
  };

  class Cover {
    constructor(canvas, pattern, palette) {
      this.c = canvas; this.ctx = canvas.getContext("2d");
      this.pattern = PATTERNS[pattern] ? pattern : "orbits";
      this.palette = palette; this.time = 3 + Math.random() * 6;
      this.speed = 1; this.target = 1; this.visible = false;
      this.resize();
    }
    pal() { return typeof this.palette === "function" ? this.palette() : this.palette; }
    resize() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      this.w = Math.max(1, this.c.offsetWidth); this.h = Math.max(1, this.c.offsetHeight);
      this.c.width = Math.round(this.w * d); this.c.height = Math.round(this.h * d);
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
      this.draw(0);
    }
    draw(dt) {
      this.speed += (this.target - this.speed) * 0.06;
      this.time += dt * this.speed;
      PATTERNS[this.pattern](this.ctx, this.w, this.h, this.time, this.pal());
    }
  }

  let covers = [];
  let coverIO;
  function mountCovers(root = document) {
    const made = [];
    $$("canvas[data-cover]", root).forEach((c) => {
      const p = S.projects[+c.dataset.cover];
      made.push(new Cover(c, p.pattern, p.palette));
    });
    $$("canvas[data-print]", root).forEach((c) => {
      made.push(new Cover(c, "print", () => [theme.cobalt, theme.on]));
    });
    made.forEach((cv) => coverIO && coverIO.observe(cv.c));
    covers.push(...made);
    return made;
  }

  /* Fundalul cu puncte din hero — ca o pânză de lucru dintr-un editor de design */
  const grain = { c: null, ctx: null, w: 0, h: 0 };
  function sizeGrain() {
    grain.c = $("#grain"); if (!grain.c) return;
    grain.ctx = grain.c.getContext("2d");
    const d = Math.min(window.devicePixelRatio || 1, 2);
    grain.w = grain.c.offsetWidth; grain.h = grain.c.offsetHeight;
    grain.c.width = Math.round(grain.w * d); grain.c.height = Math.round(grain.h * d);
    grain.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function drawGrain(px, py, strength) {
    const { ctx, w, h } = grain; if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const gap = w < 600 ? 22 : 28, R = Math.min(220, Math.max(w, h) * 0.25);
    ctx.fillStyle = theme.on;
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const f = strength * clamp(1 - Math.hypot(x - px, y - py) / R);
        ctx.globalAlpha = 0.14 + 0.6 * f;
        const r = 1 + 1.8 * f;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ==========================================================================
     STARE ȘI MONTARE
     ========================================================================== */
  const pointer = { x: -9999, y: -9999, at: 0 };
  let vfGroups = [];
  let revealWords = [];
  let cards = [];
  let processDist = 0;
  let marquee = { track: null, w: 0, x: 0 };
  let observers = [];
  let header, hero, contactBand;

  function mount() {
    observers.forEach((o) => o.disconnect());
    observers = [];
    covers = covers.filter((cv) => cv.c.isConnected);

    readTheme();
    header = $("#header");
    hero = $(".hero");
    contactBand = $(".contact");

    // Litere cu font variabil
    vfGroups = $$(".vf").map((root) => ({
      root,
      letters: $$(".ch", root).map((el) => ({ el, w: 800, d: 100 })),
      visible: true,
    }));

    // Text care se aprinde
    revealWords = $$(".reveal-text").map((el) => ({ el, words: $$(".w", el), lit: -1 }));

    cards = $$(".card").map((el) => ({ el, shade: $(".card__shade", el) }));

    // Marquee
    marquee.track = $(".marquee__track");
    marquee.w = marquee.track ? marquee.track.firstElementChild.offsetWidth : 0;

    // Coperți
    coverIO = new IntersectionObserver((es) => es.forEach((e) => {
      const cv = covers.find((c) => c.c === e.target); if (cv) cv.visible = e.isIntersecting;
    }), { rootMargin: "100px" });
    observers.push(coverIO);
    covers.forEach((cv) => coverIO.observe(cv.c));
    mountCovers($("#main"));

    // Vizibilitatea grupurilor de litere
    const vfIO = new IntersectionObserver((es) => es.forEach((e) => {
      const g = vfGroups.find((x) => x.root === e.target); if (g) g.visible = e.isIntersecting;
    }));
    vfGroups.forEach((g) => vfIO.observe(g.root));
    observers.push(vfIO);

    sizeGrain();

    // Apariții la scroll (doar pentru ce e sub ecran)
    if (!reduce) {
      const riseIO = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove("pre"); riseIO.unobserve(e.target); }
      }), { rootMargin: "0px 0px -8% 0px" });
      $$(".rise").forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight * 0.92) { el.classList.add("pre"); riseIO.observe(el); }
      });
      observers.push(riseIO);
    }

    // Numărătoare
    const countIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      if (reduce) return;
      const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
      const tick = (now) => {
        const p = clamp((now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * k) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    $$("[data-count]").forEach((el) => countIO.observe(el));
    observers.push(countIO);

    setupProcess();
    updateClock();
    bindMagnetic();
  }

  function setupProcess() {
    const sec = $("#proces"); if (!sec) return;
    const steps = $(".steps", sec), vp = $(".steps-viewport", sec);
    const want = innerWidth >= 960 && innerHeight >= 620 && !reduce;
    sec.classList.toggle("is-pinned", want);
    sec.style.height = "";
    steps.style.transform = "";
    processDist = 0;
    if (!want) return;
    const left = vp.getBoundingClientRect().left;
    const gutter = parseFloat(getComputedStyle($(".wrap", sec)).paddingRight) || 32;
    processDist = Math.max(0, steps.scrollWidth - (innerWidth - left - gutter));
    sec.style.height = `${innerHeight + processDist}px`;
  }

  /* ==========================================================================
     BUCLA DE ANIMAȚIE
     ========================================================================== */
  let lastY = scrollY, vel = 0, lastT = performance.now(), headerHidden = false;
  const cursorEl = $("#cursor");
  const cur = { x: innerWidth / 2, y: innerHeight / 2 };

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const y = scrollY, dy = y - lastY; lastY = y;
    vel += (dy - vel) * 0.12;
    const vh = innerHeight;

    // Header: se ascunde la scroll în jos, apare la scroll în sus
    if (header) {
      const menuOpen = doc.classList.contains("menu-open");
      if (!menuOpen) {
        if (dy > 4 && y > 160 && !headerHidden) { headerHidden = true; header.classList.add("is-hidden"); }
        else if ((dy < -4 || y < 160) && headerHidden) { headerHidden = false; header.classList.remove("is-hidden"); }
      }
      const hb = hero ? hero.getBoundingClientRect() : null;
      const cb = contactBand ? contactBand.getBoundingClientRect() : null;
      const overBand = (hb && hb.bottom > 60) || (cb && cb.top < 40) || menuOpen;
      header.classList.toggle("on-hero", !!overBand);
    }

    // Text care se aprinde cuvânt cu cuvânt
    revealWords.forEach((r) => {
      const b = r.el.getBoundingClientRect();
      const start = vh * 0.85, end = vh * 0.4;
      const p = reduce ? 1 : clamp((start - b.top) / (b.height + start - end));
      const lit = Math.round(p * r.words.length);
      if (lit !== r.lit) { r.words.forEach((w, i) => w.classList.toggle("on", i < lit)); r.lit = lit; }
    });

    // Carduri care se suprapun
    if (stackMQ.matches && !reduce) {
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) { c.el.style.transform = ""; c.shade.style.opacity = 0; return; }
        const nb = next.el.getBoundingClientRect(), stick = parseFloat(getComputedStyle(next.el).top) || 0;
        const p = clamp(1 - (nb.top - stick) / c.el.offsetHeight);
        c.el.style.transform = `scale(${1 - p * 0.06})`;
        c.shade.style.opacity = (p * 0.4).toFixed(3);
      });
    } else if (cards.length && cards[0].el.style.transform) {
      cards.forEach((c) => { c.el.style.transform = ""; c.shade.style.opacity = 0; });
    }

    // Proces orizontal
    if (processDist > 0) {
      const sec = $("#proces"), b = sec.getBoundingClientRect();
      const p = clamp(-b.top / processDist);
      $(".steps", sec).style.transform = `translate3d(${-p * processDist}px,0,0)`;
      $(".process__progress i", sec).style.transform = `scaleX(${p})`;
    }

    // Marquee: viteza și direcția urmează scroll-ul
    if (marquee.track && marquee.w && !reduce) {
      const dir = vel < -0.5 ? -1 : 1;
      marquee.x -= (40 * dt + Math.abs(vel) * 0.35) * dir;
      if (marquee.x <= -marquee.w) marquee.x += marquee.w;
      if (marquee.x > 0) marquee.x -= marquee.w;
      marquee.track.style.transform = `translate3d(${marquee.x}px,0,0)`;
    }

    // Litere variabile + punctele din hero
    if (!reduce) {
      const t = now / 1000;
      const live = now - pointer.at < 2500;
      vfGroups.forEach((g) => {
        if (!g.visible) return;
        const b = g.root.getBoundingClientRect();
        let px, py, k = 1;
        const inside = live && pointer.x > b.left - 120 && pointer.x < b.right + 120 && pointer.y > b.top - 160 && pointer.y < b.bottom + 160;
        if (inside) { px = pointer.x; py = pointer.y; }
        else { px = b.left + b.width * (0.5 + 0.45 * Math.cos(t * 0.55)); py = b.top + b.height * (0.5 + 0.4 * Math.sin(t * 0.9)); k = 0.75; }
        const R = Math.min(440, Math.max(220, innerWidth * 0.3));
        const rects = g.letters.map((L) => L.el.getBoundingClientRect());
        g.letters.forEach((L, i) => {
          const r = rects[i];
          const f = k * Math.pow(clamp(1 - Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py) / R), 1.4);
          L.w += (800 - 620 * f - L.w) * 0.14;
          L.d += (100 - 25 * f - L.d) * 0.14;
          L.el.style.fontVariationSettings = `"wght" ${L.w.toFixed(1)}, "wdth" ${L.d.toFixed(1)}, "opsz" 96`;
        });
        if (g.root.classList.contains("hero__name") && grain.ctx) {
          const hb = hero.getBoundingClientRect();
          drawGrain(px - hb.left, py - hb.top, inside ? 1 : 0.7);
        }
      });
    }

    // Coperți animate
    if (!reduce) covers.forEach((cv) => { if (cv.visible) cv.draw(dt); });

    // Cursor
    if (fine && cursorEl) {
      cur.x += (pointer.x - cur.x) * 0.2; cur.y += (pointer.y - cur.y) * 0.2;
      cursorEl.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
    }

    requestAnimationFrame(frame);
  }

  /* ==========================================================================
     INTERACȚIUNI
     ========================================================================== */
  function setPointer(x, y) { pointer.x = x; pointer.y = y; pointer.at = performance.now(); }
  addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", (e) => { const tt = e.touches[0]; if (tt) setPointer(tt.clientX, tt.clientY); }, { passive: true });
  addEventListener("touchstart", (e) => { const tt = e.touches[0]; if (tt) setPointer(tt.clientX, tt.clientY); }, { passive: true });

  // Cursor personalizat
  if (fine && cursorEl && !reduce) {
    doc.classList.add("has-cursor");
    addEventListener("pointermove", () => cursorEl.classList.add("is-on"), { once: true });
    document.addEventListener("pointerleave", () => cursorEl.classList.remove("is-on"));
    document.addEventListener("pointerenter", () => cursorEl.classList.add("is-on"));
    document.addEventListener("pointerover", (e) => {
      const labelEl = e.target.closest("[data-cursor]");
      const hov = e.target.closest("a, button, summary, .card");
      cursorEl.classList.toggle("is-label", !!labelEl);
      cursorEl.classList.toggle("is-hover", !!hov && !labelEl);
      $("#cursor-label").textContent = labelEl ? labelEl.dataset.cursor : "";
    });
  } else if (cursorEl) cursorEl.remove();

  // Butoane „magnetice”
  function bindMagnetic() {
    if (!fine || reduce) return;
    $$("[data-magnetic]").forEach((el) => {
      if (el.dataset.mag) return; el.dataset.mag = "1";
      el.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)";
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        const x = (e.clientX - b.left - b.width / 2) * 0.28, y = (e.clientY - b.top - b.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  // Ceas local
  function updateClock() {
    let s;
    try {
      s = new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: S.timezone }).format(new Date());
    } catch (e) { s = new Date().toLocaleTimeString(); }
    $$("[data-clock]").forEach((el) => { el.textContent = s; });
  }
  setInterval(updateClock, 1000);

  // Toast
  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-on"), 2600);
  }

  // Meniu mobil
  const menu = $("#menu");
  function openMenu(open) {
    const btn = $("#menu-btn");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      doc.classList.add("menu-open", "no-scroll");
      header.classList.remove("is-hidden"); headerHidden = false;
    } else {
      menu.classList.remove("is-open");
      doc.classList.remove("menu-open", "no-scroll");
      setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 700);
    }
    if (btn) {
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("span").textContent = open ? ui().close : ui().menu;
    }
  }

  // Click-uri (delegare)
  document.addEventListener("click", (e) => {
    const el = e.target;
    if (el.closest("#menu-btn")) { openMenu(!menu.classList.contains("is-open")); return; }
    if (el.closest("#menu a[href^='#']")) { openMenu(false); return; }
    if (el.closest("#lang-btn")) { switchLang(); return; }
    if (el.closest("#theme-btn")) { switchTheme(); return; }
    if (el.closest("#copy-btn")) { copyEmail(); return; }
    const card = el.closest(".card");
    if (card && !el.closest("a")) { openCase(+card.dataset.case); return; }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) openMenu(false); });

  // Hover pe coperți: animația accelerează
  document.addEventListener("pointerover", (e) => {
    const card = e.target.closest(".card"); if (!card) return;
    covers.forEach((cv) => { cv.target = card.contains(cv.c) ? 3.5 : 1; });
  });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest(".card");
    if (card && !card.contains(e.relatedTarget)) covers.forEach((cv) => { if (card.contains(cv.c)) cv.target = 1; });
  });

  function copyEmail() {
    const u = ui();
    const select = () => {
      const r = document.createRange(); r.selectNodeContents($("#mail-addr"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(S.email).then(() => toast(`${u.copied}: ${S.email}`), () => { select(); toast(u.copyFail); });
    } else { select(); toast(u.copyFail); }
  }

  function switchTheme() {
    const next = isDark() ? "light" : "dark";
    doc.setAttribute("data-theme", next);
    store.set("vp-theme", next);
    $("#theme-btn").innerHTML = isDark() ? icons.sun : icons.moon;
    // Culorile se schimbă cu tranziție; recitim după ce s-au aplicat
    requestAnimationFrame(() => { readTheme(); covers.forEach((cv) => cv.draw(0)); });
  }

  function switchLang() {
    lang = lang === "ro" ? "en" : "ro";
    store.set("vp-lang", lang);
    const y = scrollY;
    renderHeader(); renderMain();
    mount();
    doc.classList.add("is-ready");
    scrollTo(0, y);
  }

  /* ==========================================================================
     STUDIU DE CAZ (dialog)
     ========================================================================== */
  const dlg = $("#case");
  let caseCovers = [];

  function openCase(i) {
    const P = S.projects, n = P.length, p = P[i], u = ui();
    const prev = P[(i - 1 + n) % n], next = P[(i + 1) % n];
    const chapter = (k, label, txt) => `<section class="chapter"><span class="chapter__k">${pad(k)} — ${esc(label)}</span><p>${esc(t(txt))}</p></section>`;
    dlg.innerHTML = `
      <div class="case__scroll" style="--c-fg:${esc(p.palette[1])}">
        <div class="case__bar wrap">
          <span class="case__crumb">${esc(u.workLabel)} / ${pad(i + 1)} — ${esc(p.title)}</span>
          <button class="case__close" type="button" data-close>${esc(u.close)} <span aria-hidden="true">✕</span></button>
        </div>
        <div class="case__hero">
          ${p.image ? `<img src="${esc(p.image)}" alt="">` : `<canvas data-cover="${i}" aria-hidden="true"></canvas>`}
          <div class="wrap case__hero-wrap"><h2 id="case-title">${esc(p.title)}</h2></div>
        </div>
        <div class="wrap case__body">
          <div class="case__intro">
            <p class="case__lead">${esc(t(p.summary))}</p>
            <dl class="case__meta">
              <div><dt>${esc(u.client)}</dt><dd>${esc(p.client)}</dd></div>
              <div><dt>${esc(u.role)}</dt><dd>${esc(t(p.role))}</dd></div>
              <div><dt>${esc(u.year)}</dt><dd>${p.year}</dd></div>
              <div><dt>${esc(u.duration)}</dt><dd>${esc(t(p.duration))}</dd></div>
            </dl>
          </div>
          <div class="case__chapters">
            ${chapter(1, u.context, p.context)}
            ${chapter(2, u.challenge, p.challenge)}
            ${chapter(3, u.solution, p.solution)}
          </div>
          <div>
            <p class="eyebrow">${esc(u.results)}</p>
            <div class="results" style="margin-top:20px">
              ${p.results.map((r) => `<div class="result"><span class="result__v">${esc(t(r.value))}</span><span class="result__l">${esc(t(r.label))}</span></div>`).join("")}
            </div>
          </div>
          ${p.link ? `<div><a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(u.visit)} <span class="arrow" aria-hidden="true">↗</span></a></div>` : ""}
          <nav class="case__nav" aria-label="${esc(u.workLabel)}">
            <button type="button" data-goto="${(i - 1 + n) % n}"><small>← ${esc(u.prev)}</small><strong>${esc(prev.title)}</strong></button>
            <button type="button" data-goto="${(i + 1) % n}"><small>${esc(u.next)} →</small><strong>${esc(next.title)}</strong></button>
          </nav>
        </div>
      </div>`;

    if (!dlg.open) {
      dlg.classList.remove("is-closing");
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      doc.classList.add("no-scroll");
    }
    $(".case__scroll", dlg).scrollTop = 0;
    covers = covers.filter((cv) => !caseCovers.includes(cv));
    requestAnimationFrame(() => {
      caseCovers = mountCovers(dlg);
      caseCovers.forEach((cv) => { cv.visible = true; });
    });
    $(".case__close", dlg).focus({ preventScroll: true });
  }

  function closeCase() {
    if (!dlg.open) return;
    const done = () => {
      dlg.classList.remove("is-closing");
      if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
      doc.classList.remove("no-scroll");
      covers = covers.filter((cv) => !caseCovers.includes(cv)); caseCovers = [];
    };
    if (reduce) return done();
    dlg.classList.add("is-closing");
    setTimeout(done, 480);
  }

  dlg.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeCase();
    const go = e.target.closest("[data-goto]");
    if (go) openCase(+go.dataset.goto);
  });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeCase(); });

  /* ==========================================================================
     PORNIRE
     ========================================================================== */
  let resizeT;
  addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      covers.forEach((cv) => cv.resize());
      sizeGrain();
      setupProcess();
      if (marquee.track) marquee.w = marquee.track.firstElementChild.offsetWidth;
    }, 150);
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    requestAnimationFrame(() => { readTheme(); renderThemeIcon(); });
  });
  function renderThemeIcon() { const b = $("#theme-btn"); if (b) b.innerHTML = isDark() ? icons.sun : icons.moon; }

  renderHeader();
  renderMain();
  mount();
  requestAnimationFrame(frame);

  // Ecranul de încărcare: numără până la 100, apoi se ridică
  const loader = $("#loader");
  const finish = () => { doc.classList.add("is-ready"); };
  if (reduce || session.get("vp-seen")) {
    loader.classList.add("is-gone");
    finish();
  } else {
    session.set("vp-seen", "1");
    const count = $("#loader-count"), t0 = performance.now(), dur = 1100;
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve();
    let fontsOk = false; fontsReady.then(() => { fontsOk = true; });
    const tick = (now) => {
      const p = clamp((now - t0) / dur);
      const shown = fontsOk ? p : Math.min(p, 0.9);
      count.textContent = Math.round((1 - Math.pow(1 - shown, 3)) * 100);
      if (shown < 1) return requestAnimationFrame(tick);
      setTimeout(() => {
        loader.classList.add("is-done"); finish();
        setTimeout(() => { loader.classList.add("is-gone"); covers.forEach((cv) => cv.resize()); setupProcess(); }, 1000);
      }, 150);
    };
    requestAnimationFrame(tick);
  }

  // După încărcarea fonturilor, dimensiunile se schimbă: recalculăm
  if (document.fonts) document.fonts.ready.then(() => { setupProcess(); if (marquee.track) marquee.w = marquee.track.firstElementChild.offsetWidth; });
})();
