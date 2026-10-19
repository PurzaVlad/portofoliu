import type { Project } from '@/content/projects';

// Builds CSS scroll-driven animations that reproduce the wheel math from
// Portfolio.tsx. Where supported (Chrome 115+, Safari 26+), the browser runs
// them in step with native scrolling at the display's refresh rate, instead of
// JS catching up a frame later (or at 60 fps, as iOS Safari caps rAF).
//
// Every curve is sampled every 0.25 rows; transforms interpolate linearly in
// between, which is visually identical to the exact math.

const CURVE = 140;
const SAMPLE = 0.25;

type Mode = { A: number; step: number; tilt: number; mobile: boolean };
const DESKTOP: Mode = { A: CURVE, step: 0.36, tilt: 38, mobile: false };
const MOBILE: Mode = { A: CURVE * 0.42, step: 0.42, tilt: 52, mobile: true };

const f = (v: number, d = 3) => {
  const s = v.toFixed(d);
  return s === `-${(0).toFixed(d)}` ? (0).toFixed(d) : s;
};
const pct = (v: number) => `${f(v, 4)}%`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Distance (in rows) beyond which the pose stops changing.
const reach = (m: Mode) => 1.45 / m.step;

function samples(R: number, extra: number[] = []) {
  const set = new Set<number>([R, -R, ...extra.filter((d) => Math.abs(d) < R)]);
  for (let d = -Math.floor(R / SAMPLE) * SAMPLE; d <= R; d += SAMPLE) set.add(+d.toFixed(4));
  // Progress runs from the row below centre (d = +R) to above it (d = -R).
  return [...set].sort((a, b) => b - a);
}

function rowKeyframes(name: string, m: Mode, reduced: boolean) {
  const R = reach(m);
  const frames = samples(R, [1, -1]).map((d) => {
    const th = clamp(d * m.step, -1.45, 1.45);
    const c = Math.cos(th);
    const ad = Math.min(Math.abs(d), 4);
    const k = Math.max(0, 1 - Math.abs(d));
    const sc = (0.72 + 0.28 * c) * (m.mobile ? 0.9 + 0.22 * k : 1);
    const opacity = f(Math.max(0.1, c * (1 - ad * 0.12)));
    const transform = reduced
      ? 'none'
      : `translate3d(${f(m.A * c, 2)}px,0,0) rotateX(${f(-th * m.tilt, 2)}deg) scale(${f(sc, 4)})`;
    return `${pct(((R - d) / (2 * R)) * 100)}{transform:${transform};opacity:${opacity}}`;
  });
  return `@keyframes ${name}{${frames.join('')}}`;
}

function dotKeyframes(name: string, m: Mode) {
  const R = reach(m);
  const frames = samples(R, [2 / 3, -2 / 3]).map((d) => {
    const ad = Math.min(Math.abs(d), 4);
    return `${pct(((R - d) / (2 * R)) * 100)}{transform:scale(${f(Math.max(0, 1 - ad * 1.5))})}`;
  });
  return `@keyframes ${name}{${frames.join('')}}`;
}

// Keyframes over the scroller's whole range, where progress p ↔ pos = p·(n-1).
function scrollFrames(n: number, at: (pos: number) => string, extra: number[] = []) {
  const max = n - 1;
  const set = new Set<number>([0, max, ...extra.filter((p) => p > 0 && p < max)]);
  for (let p = SAMPLE; p < max; p += SAMPLE) set.add(+p.toFixed(4));
  return [...set]
    .sort((a, b) => a - b)
    .map((pos) => `${pct((pos / max) * 100)}{${at(pos)}}`)
    .join('');
}

export function buildScrollCss(projects: Project[]) {
  const n = projects.length;
  const css: string[] = [];

  css.push(rowKeyframes('wr-d', DESKTOP, false), rowKeyframes('wr-m', MOBILE, false));
  css.push(rowKeyframes('wr-dr', DESKTOP, true), rowKeyframes('wr-mr', MOBILE, true));
  css.push(dotKeyframes('wd-d', DESKTOP), dotKeyframes('wd-m', MOBILE));

  // Screen strip: translateY(-(pos/n)·100%).
  css.push(`@keyframes ws{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,${pct((-(n - 1) / n) * 100)},0)}}`);

  // Accent color ("open doors.") blends between project colors.
  css.push(`@keyframes wa{${projects.map((p, i) => `${pct((i / Math.max(1, n - 1)) * 100)}{color:${p.color}}`).join('')}}`);

  // Background: layer i fades in as pos goes from i-1 to i, stacked above layer i-1.
  for (let i = 1; i < n; i++) {
    css.push(`@keyframes wb${i}{${scrollFrames(n, (pos) => `opacity:${f(clamp(pos - (i - 1), 0, 1))}`, [i - 1, i])}}`);
  }

  // Captions: opacity 1 - |d|·1.8, sliding by d·14px.
  for (let i = 0; i < n; i++) {
    const at = (reduced: boolean) => (pos: number) => {
      const d = i - pos;
      const o = f(clamp(1 - Math.abs(d) * 1.8, 0, 1));
      return reduced ? `opacity:${o}` : `opacity:${o};transform:translate3d(0,${f(d * 14, 2)}px,0)`;
    };
    const edges = [i - 1 / 1.8, i, i + 1 / 1.8];
    css.push(`@keyframes wc${i}{${scrollFrames(n, at(false), edges)}}`);
    css.push(`@keyframes wcr${i}{${scrollFrames(n, at(true), edges)}}`);
  }

  const range = (m: Mode) => {
    const R = f(reach(m), 4);
    return `animation-range:cover calc(50% - ${R} * var(--row)) cover calc(50% + ${R} * var(--row))`;
  };
  const view = 'animation-timeline:view();animation-fill-mode:both;animation-timing-function:linear';
  const scroll = 'animation-timeline:--wheel;animation-fill-mode:both;animation-timing-function:linear';

  const rules = [
    `.wheel-scroller{scroll-timeline:--wheel y}`,
    `.wheel-row{animation-name:wr-d;${view};${range(DESKTOP)}}`,
    `.wheel-dot{animation-name:wd-d;${view};${range(DESKTOP)}}`,
    `.wheel-strip{animation-name:ws;${scroll}}`,
    `.wheel-accent{animation-name:wa;${scroll}}`,
    ...projects.slice(1).map((_, j) => `.wheel-bg-${j + 1}{animation-name:wb${j + 1};${scroll}}`),
    ...projects.map((_, i) => `.wheel-cap-${i}{animation-name:wc${i};${scroll}}`),
    `@media (max-width:820px){.wheel-row{animation-name:wr-m;${range(MOBILE)}}.wheel-dot{animation-name:wd-m;${range(MOBILE)}}}`,
    `@media (prefers-reduced-motion:reduce){.wheel-row{animation-name:wr-dr}${projects.map((_, i) => `.wheel-cap-${i}{animation-name:wcr${i}}`).join('')}}`,
    `@media (prefers-reduced-motion:reduce) and (max-width:820px){.wheel-row{animation-name:wr-mr}}`,
  ];

  return `@supports (animation-timeline: scroll()) {${css.join('')}${rules.join('')}}`;
}
