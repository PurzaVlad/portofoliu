'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { site, type Project } from '@/content/projects';
import Clock from './Clock';

export type ResolvedProject = Project & { poster: string };

const CURVE = 140;
const MOBILE_QUERY = '(max-width: 820px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// useLayoutEffect warns on the server; this runs it only in the browser.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function Portfolio({ projects }: { projects: ResolvedProject[] }) {
  const n = projects.length;
  const [active, setActive] = useState(0);
  const current = projects[active];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);
  const mobileRef = useRef(false);
  const reducedRef = useRef(false);
  const rafRef = useRef(0);

  // All per-frame work happens here: plain math, then style writes. No React state
  // changes except when the active row flips.
  const update = useCallback(() => {
    rafRef.current = 0;
    const el = scrollerRef.current;
    if (!el) return;

    const mobile = mobileRef.current;
    const reduced = reducedRef.current;
    const ROW = mobile ? 56 : 64;
    const pos = clamp(el.scrollTop / ROW, 0, n - 1);
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
  }, [n, projects]);

  const schedule = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
  }, [update]);

  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const rq = window.matchMedia(REDUCED_QUERY);
    const sync = () => {
      mobileRef.current = mq.matches;
      reducedRef.current = rq.matches;
      schedule();
    };
    mobileRef.current = mq.matches;
    reducedRef.current = rq.matches;
    update();

    const el = scrollerRef.current!;
    el.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    mq.addEventListener('change', sync);
    rq.addEventListener('change', sync);
    return () => {
      el.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mq.removeEventListener('change', sync);
      rq.removeEventListener('change', sync);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [update, schedule]);

  const goTo = (i: number) => {
    const ROW = mobileRef.current ? 56 : 64;
    scrollerRef.current?.scrollTo({ top: i * ROW, behavior: reducedRef.current ? 'auto' : 'smooth' });
  };

  return (
    <div
      className="relative h-dvh overflow-hidden transition-[background-color] duration-500 ease-[ease]"
      style={{ backgroundColor: current.tint }}
    >
      <header className="pointer-events-none absolute left-0 top-0 z-20 px-24 pt-11 max-[820px]:px-4 max-[820px]:pt-5">
        <h1 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink max-[820px]:text-[15px]">
          {site.name}
        </h1>
        <p className="mt-0.5 text-[17px] leading-snug tracking-[-0.01em] text-body max-[820px]:text-[15px]">
          I build apps that{' '}
          <strong className="font-semibold transition-colors duration-[400ms]" style={{ color: current.color }}>
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
                  backgroundColor: current.screen,
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

              <p
                aria-live="polite"
                className="mt-6 min-h-[4.35em] max-w-[360px] px-6 text-center text-[15px] leading-[1.45] text-body max-[820px]:mt-4 max-[820px]:min-h-[5.8em] max-[820px]:px-0 max-[820px]:text-[12px]"
              >
                {current.blurb}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Clock />
    </div>
  );
}
