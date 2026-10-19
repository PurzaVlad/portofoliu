'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { site, type Project } from '@/content/projects';
import Clock from './Clock';

export type ResolvedProject = Project & { poster: string };

const CURVE = 140;
const MOBILE_QUERY = '(max-width: 820px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// How quickly the drawn position catches up with the real scroll position (ms).
// A little easing turns mouse-wheel jumps into glides; touch stays close to the finger.
const TAU_DESKTOP = 70;
const TAU_MOBILE = 40;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type RGB = [number, number, number];
const hexToRgb = (hex: string): RGB => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
// Blend two colors at t ∈ [0, 1].
const mix = (a: RGB, b: RGB, t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;

// useLayoutEffect warns on the server; this runs it only in the browser.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function Portfolio({ projects }: { projects: ResolvedProject[] }) {
  const n = projects.length;
  const [active, setActive] = useState(0);
  const first = projects[0];

  const rootRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLElement>(null);
  const captionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);
  const mobileRef = useRef(false);
  const reducedRef = useRef(false);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const lastTimeRef = useRef(0);
  const jumpRef = useRef(true);

  const tints = useMemo(() => projects.map((p) => hexToRgb(p.tint)), [projects]);
  const accents = useMemo(() => projects.map((p) => hexToRgb(p.color)), [projects]);

  // Draws everything for a (continuous) position. Plain math, then style writes.
  // No React state changes except when the active row flips.
  const render = useCallback((pos: number) => {
    const mobile = mobileRef.current;
    const reduced = reducedRef.current;
    const A = CURVE * (mobile ? 0.42 : 1);
    const step = mobile ? 0.42 : 0.36;
    const tiltK = mobile ? 52 : 38;

    for (let i = 0; i < n; i++) {
      const row = rowRefs.current[i];
      if (!row) continue;
      const d = i - pos;
      const th = clamp(d * step, -1.45, 1.45);
      const c = Math.cos(th);
      const ad = Math.min(Math.abs(d), 4);
      const k = Math.max(0, 1 - Math.abs(d));
      const sc = (0.72 + 0.28 * c) * (mobile ? 0.9 + 0.22 * k : 1);

      row.style.transform = reduced
        ? 'none'
        : `translate3d(${(A * c).toFixed(2)}px,0,0) rotateX(${(-th * tiltK).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      row.style.opacity = Math.max(0.1, c * (1 - ad * 0.12)).toFixed(3);

      const dot = dotRefs.current[i];
      if (dot) dot.style.transform = `scale(${Math.max(0, 1 - ad * 1.5).toFixed(3)})`;

      const caption = captionRefs.current[i];
      if (caption) {
        caption.style.opacity = clamp(1 - Math.abs(d) * 1.8, 0, 1).toFixed(3);
        caption.style.transform = reduced ? 'none' : `translate3d(0,${(d * 14).toFixed(2)}px,0)`;
      }

      const video = videoRefs.current[i];
      if (video) {
        if (Math.abs(d) < 1.2) {
          // Poster and source are attached lazily so they never compete with first paint.
          if (!video.getAttribute('src')) {
            if (projects[i].poster) video.poster = projects[i].poster;
            video.src = projects[i].video;
          }
          if (video.paused) {
            video.muted = true;
            video.play().catch(() => {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      }
    }

    if (stripRef.current) {
      stripRef.current.style.transform = `translate3d(0,${(-(pos / n) * 100).toFixed(4)}%,0)`;
    }

    // Colors blend between neighbouring projects instead of switching.
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, n - 1);
    const f = pos - lo;
    if (rootRef.current) rootRef.current.style.backgroundColor = mix(tints[lo], tints[hi], f);
    if (accentRef.current) accentRef.current.style.color = mix(accents[lo], accents[hi], f);

    const a = Math.round(pos);
    if (a !== activeRef.current) {
      activeRef.current = a;
      setActive(a);
      try {
        navigator.vibrate?.(6);
      } catch {
        /* unsupported or blocked */
      }
    }
  }, [n, projects, tints, accents]);

  // Eases the drawn position toward the scroll position, frame-rate independent.
  // The loop only runs while the two differ, so an idle page does no work.
  const frame = useCallback(
    (now: number) => {
      rafRef.current = 0;
      const el = scrollerRef.current;
      if (!el) return;
      const ROW = mobileRef.current ? 56 : 64;
      const target = clamp(el.scrollTop / ROW, 0, n - 1);

      let pos = posRef.current;
      if (jumpRef.current || reducedRef.current) {
        pos = target;
        jumpRef.current = false;
      } else {
        const dt = Math.min(64, Math.max(0, now - lastTimeRef.current));
        const tau = mobileRef.current ? TAU_MOBILE : TAU_DESKTOP;
        pos += (target - pos) * (1 - Math.exp(-dt / tau));
        if (Math.abs(target - pos) < 0.0005) pos = target;
      }
      lastTimeRef.current = now;
      posRef.current = pos;
      render(pos);

      if (pos !== target) rafRef.current = requestAnimationFrame(frame);
    },
    [n, render],
  );

  const schedule = useCallback(() => {
    if (!rafRef.current) {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(frame);
    }
  }, [frame]);

  // Resizes and media-query flips change ROW, so skip easing for that frame.
  const jump = useCallback(() => {
    jumpRef.current = true;
    schedule();
  }, [schedule]);

  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const rq = window.matchMedia(REDUCED_QUERY);
    const sync = () => {
      mobileRef.current = mq.matches;
      reducedRef.current = rq.matches;
      jump();
    };
    mobileRef.current = mq.matches;
    reducedRef.current = rq.matches;
    jumpRef.current = true;
    frame(performance.now());

    const el = scrollerRef.current!;

    // A notched mouse wheel scrolls ~100px per click, which would skip a row past
    // the snap point. Turn each notch into exactly one row; the easing above makes
    // the jump glide. Trackpads (small, fractional deltas) keep native scrolling.
    let wheelIndex = -1;
    let wheelTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
      const notched =
        e.deltaMode === 1 || (!!legacy && legacy % 120 === 0 && Math.abs(e.deltaY) >= 40);
      if (!notched) return;
      e.preventDefault();
      const ROW = mobileRef.current ? 56 : 64;
      if (wheelIndex < 0) wheelIndex = Math.round(el.scrollTop / ROW);
      wheelIndex = clamp(wheelIndex + Math.sign(e.deltaY), 0, n - 1);
      el.scrollTo({ top: wheelIndex * ROW, behavior: 'instant' });
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => (wheelIndex = -1), 250);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', jump);
    mq.addEventListener('change', sync);
    rq.addEventListener('change', sync);
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(wheelTimer);
      el.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', jump);
      mq.removeEventListener('change', sync);
      rq.removeEventListener('change', sync);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [frame, schedule, jump, n]);

  const goTo = (i: number) => {
    const ROW = mobileRef.current ? 56 : 64;
    scrollerRef.current?.scrollTo({ top: i * ROW, behavior: reducedRef.current ? 'auto' : 'smooth' });
  };

  return (
    <div ref={rootRef} className="relative h-dvh overflow-hidden" style={{ backgroundColor: first.tint }}>
      <header className="pointer-events-none absolute left-0 top-0 z-20 px-24 pt-11 max-[820px]:px-4 max-[820px]:pt-5">
        <h1 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink max-[820px]:text-[15px]">
          {site.name}
        </h1>
        <p className="mt-0.5 text-[17px] leading-snug tracking-[-0.01em] text-body max-[820px]:text-[15px]">
          I build apps that{' '}
          <strong ref={accentRef} className="font-semibold" style={{ color: first.color }}>
            open doors.
          </strong>
        </p>
        <ul className="pointer-events-auto mt-3 flex gap-4 font-mono text-[12px] text-muted max-[820px]:mt-2 max-[820px]:gap-3 max-[820px]:text-[12px]">
          {[
            ['Email', `mailto:${site.email}`],
            ['GitHub', site.github],
            ['LinkedIn', site.linkedin],
          ].map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="rounded-sm underline decoration-current/30 underline-offset-[3px] transition-colors hover:text-ink hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div
        ref={scrollerRef}
        className="no-scrollbar absolute inset-0 snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <div className="grid grid-cols-2 max-[820px]:grid-cols-[1.35fr_1fr]">
          <nav
            aria-label="Projects"
            className="pl-24 [perspective:900px] max-[820px]:pl-2.5 max-[820px]:[perspective:520px]"
            style={{ paddingBlock: 'calc(50dvh - var(--row) / 2)' }}
          >
            <ul>
              {projects.map((p, i) => {
                const ad = Math.min(i, 4);
                // Pre-hydration pose for pos = 0; JS takes over on mount.
                const initial = { '--d': i, '--k': i === 0 ? 1 : 0, '--ad': ad } as CSSProperties;
                return (
                  <li key={p.name}>
                    <button
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      type="button"
                      aria-current={i === active ? 'true' : undefined}
                      onClick={() => goTo(i)}
                      onFocus={(e) => {
                        if (e.currentTarget.matches(':focus-visible')) goTo(i);
                      }}
                      className="wheel-row flex cursor-pointer items-center gap-4 whitespace-nowrap rounded-xl pr-3 text-left text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-transparent max-[820px]:gap-2.5 max-[820px]:pr-1.5"
                      style={initial}
                    >
                      <span
                        ref={(el) => {
                          dotRefs.current[i] = el;
                        }}
                        aria-hidden
                        className="size-2 shrink-0 rounded-full will-change-transform"
                        style={{ backgroundColor: p.color, transform: `scale(${Math.max(0, 1 - ad * 1.5)})` }}
                      />
                      <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] max-[820px]:text-[19px]">
                        {p.name}
                      </span>
                      <span className="font-mono text-[12px] text-muted max-[820px]:hidden">{p.kind}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="max-[820px]:pr-3">
            <div className="sticky top-0 flex h-dvh flex-col items-center justify-center">
              <div
                className="relative aspect-[9/19.5] w-[min(290px,calc((100dvh-220px)*0.4615))] overflow-hidden rounded-[40px] max-[820px]:w-[min(100%,180px,calc((100dvh-200px)*0.4615))] max-[820px]:rounded-[24px]"
                style={{
                  backgroundColor: first.screen,
                  boxShadow: '0 0 0 1px rgba(20,20,19,.06), 0 40px 80px -34px rgba(20,20,19,.4)',
                  transform: 'translateZ(0)',
                }}
              >
                <div
                  ref={stripRef}
                  className="absolute inset-x-0 top-0 will-change-transform"
                  style={{ height: `${n * 100}%` }}
                >
                  {projects.map((p, i) => (
                    <div
                      key={p.name}
                      className="relative overflow-hidden"
                      style={{ height: `${100 / n}%`, backgroundColor: p.screen }}
                      aria-hidden={i !== active}
                    >
                      {p.video ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[i] = el;
                          }}
                          className="absolute inset-0 size-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label={`${p.name} screen recording`}
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-3.5 px-4 text-center">
                          <div
                            className="flex size-[52px] items-center justify-center rounded-[14px] text-[24px] font-semibold text-white max-[820px]:size-10 max-[820px]:rounded-[11px] max-[820px]:text-[18px]"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name[0]}
                          </div>
                          <p className="font-mono text-[12px] leading-snug text-muted">
                            [{p.name} screen recording]
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* All blurbs share one grid cell: the tallest reserves the height and they
                  cross-fade as you scroll. Screen readers only get the active one. */}
              <div className="mt-6 grid max-w-[360px] px-6 text-center text-[15px] leading-[1.45] text-body max-[820px]:mt-4 max-[820px]:px-0 max-[820px]:text-[12px]">
                {projects.map((p, i) => (
                  <p
                    key={p.name}
                    ref={(el) => {
                      captionRefs.current[i] = el;
                    }}
                    aria-hidden={i !== active}
                    className="col-start-1 row-start-1 will-change-[opacity,transform]"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {p.blurb}
                  </p>
                ))}
              </div>
              <p aria-live="polite" className="sr-only">
                {projects[active].blurb}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Clock />
    </div>
  );
}
