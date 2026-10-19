'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { site, type Project } from '@/content/projects';
import Clock from './Clock';

export type ResolvedProject = Project & { poster: string };

const CURVE = 140;
const MOBILE_QUERY = '(max-width: 820px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// Time constant of the eased scroll used for wheel, keyboard and clicks (ms).
// Each frame closes 1 - e^(-dt/TAU) of the remaining distance, so it feels the
// same at 60, 120 or 144 Hz.
const TAU = 120;
// After the last trackpad event, wait this long before gliding to the nearest row.
const SETTLE_MS = 140;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function Portfolio({ projects }: { projects: ResolvedProject[] }) {
  const n = projects.length;
  const first = projects[0];

  const rootRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accentRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const screenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const mobileRef = useRef(false);
  const reducedRef = useRef(false);
  const lastPosRef = useRef(Number.NaN);
  // True where the browser runs the visuals itself (CSS scroll-driven animations,
  // see scrollCss.ts). JS then only handles video, aria state and haptics.
  const cssDrivenRef = useRef(false);
  const activeRef = useRef(0);

  // Eased scroll state. While `owned`, this loop writes scrollTop itself and
  // native snapping is switched off so the browser doesn't fight it.
  const animRef = useRef({ owned: false, running: false, gesture: false, cur: 0, target: 0, last: 0, raf: 0 });
  const nativeRafRef = useRef(0);

  const rowPx = () => (mobileRef.current ? 56 : 64);

  const accents = useMemo(() => {
    const rgb = projects.map((p) => {
      const v = parseInt(p.color.slice(1), 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    });
    return (lo: number, hi: number, t: number) =>
      `rgb(${rgb[lo].map((c, j) => Math.round(c + (rgb[hi][j] - c) * t)).join(',')})`;
  }, [projects]);

  // Draws everything for a continuous position (0 … n-1). Only transforms and
  // opacity change per frame, so it all stays on the compositor. React never
  // re-renders while scrolling.
  const render = useCallback(
    (pos: number) => {
      if (pos === lastPosRef.current) return;
      lastPosRef.current = pos;

      const visuals = !cssDrivenRef.current;
      const mobile = mobileRef.current;
      const reduced = reducedRef.current;
      const A = CURVE * (mobile ? 0.42 : 1);
      const step = mobile ? 0.42 : 0.36;
      const tiltK = mobile ? 52 : 38;

      for (let i = 0; i < n; i++) {
        const d = i - pos;
        const absD = Math.abs(d);
        const th = clamp(d * step, -1.45, 1.45);
        const c = Math.cos(th);
        const ad = Math.min(absD, 4);
        const k = Math.max(0, 1 - absD);
        const sc = (0.72 + 0.28 * c) * (mobile ? 0.9 + 0.22 * k : 1);

        const row = visuals && rowRefs.current[i];
        if (row) {
          row.style.transform = reduced
            ? 'none'
            : `translate3d(${(A * c).toFixed(2)}px,0,0) rotateX(${(-th * tiltK).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
          row.style.opacity = Math.max(0.1, c * (1 - ad * 0.12)).toFixed(3);
        }

        const dot = visuals && dotRefs.current[i];
        if (dot) dot.style.transform = `scale(${Math.max(0, 1 - ad * 1.5).toFixed(3)})`;

        const caption = visuals && captionRefs.current[i];
        if (caption) {
          caption.style.opacity = clamp(1 - absD * 1.8, 0, 1).toFixed(3);
          caption.style.transform = reduced ? 'none' : `translate3d(0,${(d * 14).toFixed(2)}px,0)`;
        }

        const video = videoRefs.current[i];
        if (video) {
          if (absD < 1.2) {
            // Poster and source attach lazily so they never compete with first paint.
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

      if (visuals && stripRef.current) {
        stripRef.current.style.transform = `translate3d(0,${(-(pos / n) * 100).toFixed(4)}%,0)`;
      }

      if (visuals) {
        // Background: stacked full-screen color layers; layer i fades in as pos
        // goes from i-1 to i. Only opacity changes, so nothing repaints.
        for (let i = 1; i < n; i++) {
          const bg = bgRefs.current[i];
          if (bg) bg.style.opacity = clamp(pos - (i - 1), 0, 1).toFixed(4);
        }
        const lo = Math.floor(pos);
        const hi = Math.min(lo + 1, n - 1);
        if (accentRef.current) accentRef.current.style.color = accents(lo, hi, pos - lo);
      }

      const a = Math.round(pos);
      if (a !== activeRef.current) {
        const prev = activeRef.current;
        activeRef.current = a;
        rowRefs.current[prev]?.removeAttribute('aria-current');
        rowRefs.current[a]?.setAttribute('aria-current', 'true');
        captionRefs.current[prev]?.setAttribute('aria-hidden', 'true');
        captionRefs.current[a]?.removeAttribute('aria-hidden');
        screenRefs.current[prev]?.setAttribute('aria-hidden', 'true');
        screenRefs.current[a]?.removeAttribute('aria-hidden');
        if (liveRef.current) liveRef.current.textContent = projects[a].blurb;
        try {
          navigator.vibrate?.(6);
        } catch {
          /* unsupported or blocked */
        }
      }
    },
    [n, projects, accents],
  );

  const renderFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (el) render(clamp(el.scrollTop / rowPx(), 0, n - 1));
  }, [n, render]);

  // ---- Eased scrolling (wheel, keyboard, clicks) -------------------------------

  const release = useCallback(() => {
    const s = animRef.current;
    cancelAnimationFrame(s.raf);
    s.running = false;
    s.owned = false;
    s.gesture = false;
    if (scrollerRef.current) scrollerRef.current.style.scrollSnapType = '';
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = animRef.current;
      const el = scrollerRef.current;
      if (!el || !s.owned) return;
      const dt = Math.min(50, Math.max(0, now - s.last));
      s.last = now;
      const tau = reducedRef.current ? 0 : TAU;
      s.cur = tau ? s.cur + (s.target - s.cur) * (1 - Math.exp(-dt / tau)) : s.target;
      const done = Math.abs(s.target - s.cur) < 0.25;
      if (done) s.cur = s.target;

      // Scroll position and every scroll-linked transform change in the same frame.
      el.scrollTop = s.cur;
      render(clamp(s.cur / rowPx(), 0, n - 1));

      if (!done) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.running = false;
        // Hand back to native scrolling once resting on a row.
        if (!s.gesture) release();
      }
    },
    [n, render, release],
  );

  const glideTo = useCallback(
    (px: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const s = animRef.current;
      if (!s.owned) {
        s.owned = true;
        s.cur = el.scrollTop;
        el.style.scrollSnapType = 'none';
      }
      s.target = clamp(px, 0, (n - 1) * rowPx());
      if (!s.running) {
        s.running = true;
        s.last = performance.now();
        s.raf = requestAnimationFrame(tick);
      }
    },
    [n, tick],
  );

  const goTo = useCallback(
    (i: number) => {
      animRef.current.gesture = false;
      glideTo(clamp(i, 0, n - 1) * rowPx());
    },
    [n, glideTo],
  );

  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const rq = window.matchMedia(REDUCED_QUERY);
    const root = rootRef.current!;
    const el = scrollerRef.current!;
    const s = animRef.current;

    const readMedia = () => {
      mobileRef.current = mq.matches;
      reducedRef.current = rq.matches;
      lastPosRef.current = Number.NaN;
    };
    cssDrivenRef.current = CSS.supports('animation-timeline: scroll()');
    readMedia();
    renderFromScroll();

    // Native scrolling (touch, scrollbar): draw on the next frame.
    const onScroll = () => {
      if (s.owned || nativeRafRef.current) return;
      nativeRafRef.current = requestAnimationFrame(() => {
        nativeRafRef.current = 0;
        renderFromScroll();
      });
    };

    // Wheel and trackpad: feed the eased loop instead of jumping natively.
    let settleTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const ROW = rowPx();
      const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
      const notched = e.deltaMode === 1 || (!!legacy && legacy % 120 === 0 && Math.abs(e.deltaY) >= 40);
      const base = s.owned ? s.target : el.scrollTop;

      if (notched) {
        // Mouse wheel: one notch = one project.
        s.gesture = false;
        glideTo((Math.round(base / ROW) + Math.sign(e.deltaY)) * ROW);
        return;
      }
      // Trackpad: follow the fingers 1:1 (eased), then settle on the nearest row.
      const scale = e.deltaMode === 2 ? el.clientHeight : 1;
      s.gesture = true;
      glideTo(base + e.deltaY * scale);
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        s.gesture = false;
        glideTo(Math.round(s.target / ROW) * ROW);
      }, SETTLE_MS);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const cur = s.owned ? Math.round(s.target / rowPx()) : activeRef.current;
      const keys: Record<string, number> = {
        ArrowDown: cur + 1,
        ArrowUp: cur - 1,
        PageDown: cur + 1,
        PageUp: cur - 1,
        Home: 0,
        End: n - 1,
        ' ': e.shiftKey ? cur - 1 : cur + 1,
      };
      if (!(e.key in keys) || (e.key === ' ' && t.tagName === 'BUTTON')) return;
      e.preventDefault();
      goTo(keys[e.key]);
    };

    // A finger on the screen always wins over an in-flight glide.
    const onTouch = () => {
      if (s.owned) release();
    };
    const onResize = () => {
      if (s.owned) release();
      lastPosRef.current = Number.NaN;
      renderFromScroll();
    };
    const onMedia = () => {
      readMedia();
      onResize();
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    mq.addEventListener('change', onMedia);
    rq.addEventListener('change', onMedia);
    return () => {
      root.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', onTouch);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onMedia);
      rq.removeEventListener('change', onMedia);
      clearTimeout(settleTimer);
      cancelAnimationFrame(nativeRafRef.current);
      nativeRafRef.current = 0;
      release();
    };
  }, [n, renderFromScroll, glideTo, goTo, release]);

  return (
    <div ref={rootRef} className="relative h-dvh overflow-hidden" style={{ backgroundColor: first.tint }}>
      <div
        ref={scrollerRef}
        className="wheel-scroller no-scrollbar absolute inset-0 snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        {/* Fixed layers live inside the scroller (sticky, zero net height) so CSS
            scroll-driven animations can follow its timeline. */}
        <div aria-hidden className="pointer-events-none sticky top-0 z-0 -mb-[100dvh] h-dvh">
          {projects.map((p, i) =>
            i === 0 ? null : (
              <div
                key={p.name}
                ref={(el) => {
                  bgRefs.current[i] = el;
                }}
                className={`wheel-bg-${i} absolute inset-0 will-change-[opacity]`}
                style={{ backgroundColor: p.tint, opacity: 0 }}
              />
            ),
          )}
        </div>

        <div className="pointer-events-none sticky top-0 z-20 -mb-[100dvh] h-dvh">
          <header className="absolute left-0 top-0 px-24 pt-11 max-[820px]:px-4 max-[820px]:pt-5">
            <h1 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink max-[820px]:text-[15px]">
              {site.name}
            </h1>
            <p className="mt-0.5 text-[17px] leading-snug tracking-[-0.01em] text-body max-[820px]:text-[15px]">
              I build apps that{' '}
              <strong ref={accentRef} className="wheel-accent font-semibold" style={{ color: first.color }}>
                open doors.
              </strong>
            </p>
            <ul className="pointer-events-auto mt-3 flex gap-4 font-mono text-[12px] text-muted max-[820px]:mt-2 max-[820px]:gap-3">
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
          <Clock />
        </div>

        <div className="relative z-10 grid grid-cols-2 max-[820px]:grid-cols-[1.35fr_1fr]">
          <nav
            aria-label="Projects"
            className="pl-24 [perspective:900px] max-[820px]:pl-2.5 max-[820px]:[perspective:520px]"
            style={{ paddingBlock: 'calc(50dvh - var(--row) / 2)' }}
          >
            <ul>
              {projects.map((p, i) => {
                const ad = Math.min(i, 4);
                // Pre-hydration pose for pos = 0 (CSS trig); JS takes over on mount.
                const initial = { '--d': i, '--k': i === 0 ? 1 : 0, '--ad': ad } as CSSProperties;
                return (
                  <li key={p.name}>
                    <button
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      type="button"
                      aria-current={i === 0 ? 'true' : undefined}
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
                        className="wheel-dot size-2 shrink-0 rounded-full will-change-transform"
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
                  className="wheel-strip absolute inset-x-0 top-0 will-change-transform"
                  style={{ height: `${n * 100}%` }}
                >
                  {projects.map((p, i) => (
                    <div
                      key={p.name}
                      ref={(el) => {
                        screenRefs.current[i] = el;
                      }}
                      className="relative overflow-hidden"
                      style={{ height: `${100 / n}%`, backgroundColor: p.screen }}
                      aria-hidden={i === 0 ? undefined : true}
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
                          <p className="font-mono text-[12px] leading-snug text-muted">[{p.name} screen recording]</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* All blurbs share one grid cell: the tallest reserves the height and they
                  cross-fade as you scroll. Screen readers get the live region below. */}
              <div className="mt-6 grid max-w-[360px] px-6 text-center text-[15px] leading-[1.45] text-body max-[820px]:mt-4 max-[820px]:px-0 max-[820px]:text-[12px]">
                {projects.map((p, i) => (
                  <p
                    key={p.name}
                    ref={(el) => {
                      captionRefs.current[i] = el;
                    }}
                    aria-hidden={i === 0 ? undefined : true}
                    className={`wheel-cap-${i} col-start-1 row-start-1 will-change-[opacity,transform]`}
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {p.blurb}
                  </p>
                ))}
              </div>
              <p ref={liveRef} aria-live="polite" className="sr-only">
                {first.blurb}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
