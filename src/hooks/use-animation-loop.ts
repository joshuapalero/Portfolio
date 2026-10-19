"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

export interface Metrics {
  width: number;
  height: number;
  dpr: number;
  bufferWidth: number;
  bufferHeight: number;
}

export interface FrameInfo {
  now: number;
  dt: number;
  elapsed: number;
  frame: number;
}

export interface AnimationLoopHandle {
  start(): void;
  stop(): void;
  paint(): void;
  resize(): void;
  readonly running: boolean;
}

export interface AnimationLoopOptions {
  target: React.RefObject<HTMLElement | null>;
  halted?: boolean;
  dpr?: number | "auto";
  onResize?(metrics: Metrics): void;
  onFrame?(info: FrameInfo): void | false;
  paintWhenHalted?: boolean;
  resizeDebounceMs?: number;
  gl?(): WebGLRenderingContext | WebGL2RenderingContext | null | undefined;
  onDispose?(): void;
  deps?: unknown[];
}

const MAX_DT = 1 / 15;

export function useAnimationLoop(
  options: AnimationLoopOptions,
): AnimationLoopHandle {
  const opts = useRef(options);
  useLayoutEffect(() => {
    opts.current = options;
  });

  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const disposed = useRef(false);
  const startedAt = useRef(0);
  const last = useRef(0);
  const frame = useRef(0);

  const measure = useCallback((): Metrics | null => {
    const el = opts.current.target.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cap = opts.current.dpr ?? "auto";
    const limit = cap === "auto" ? 2 : cap;
    const dpr = Math.min(
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
      limit,
    );
    return {
      width: rect.width,
      height: rect.height,
      dpr,
      bufferWidth: Math.max(1, Math.round(rect.width * dpr)),
      bufferHeight: Math.max(1, Math.round(rect.height * dpr)),
    };
  }, []);

  const tick = useCallback(function tick(now: number) {
    if (disposed.current) return;

    if (startedAt.current === 0) startedAt.current = startedAt.current || now; // Fixed an issue where startedAt was overwritten, well I should keep original code
    // Actually original is: if (startedAt.current === 0) startedAt.current = now;
    if (startedAt.current === 0) startedAt.current = now;
    
    const dt = last.current === 0 ? 0 : Math.min((now - last.current) / 1000, MAX_DT);
    last.current = now;

    const info: FrameInfo = {
      now,
      dt,
      elapsed: (now - startedAt.current) / 1000,
      frame: frame.current++,
    };

    const verdict = opts.current.onFrame?.(info);

    if (disposed.current) return;

    if (verdict === false || opts.current.halted) {
      running.current = false;
      raf.current = null;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (disposed.current || running.current) return;
    running.current = true;
    last.current = 0;
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    running.current = false;
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  const paint = useCallback(() => start(), [start]);

  const resize = useCallback(() => {
    const metrics = measure();
    if (!metrics) return;
    opts.current.onResize?.(metrics);
    if (opts.current.paintWhenHalted !== false) paint();
    else if (!opts.current.halted) start();
  }, [measure, paint, start]);

  const deps = options.deps ?? [];

  useEffect(() => {
    disposed.current = false;
    const el = opts.current.target.current;
    if (!el) return;

    let isIntersecting = true;
    let isVisible = !document.hidden;

    const syncVisibility = () => {
      if (disposed.current) return;
      const shouldRun = isIntersecting && isVisible && !opts.current.halted;
      if (shouldRun && !running.current) {
        start();
      } else if (!shouldRun && running.current) {
        stop();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      syncVisibility();
    });
    io.observe(el);

    const onVisChange = () => {
      isVisible = !document.hidden;
      syncVisibility();
    };
    document.addEventListener("visibilitychange", onVisChange);

    const run = () => {
      if (disposed.current) return;
      resize();
    };

    const observer = new ResizeObserver(() => {
      const wait = opts.current.resizeDebounceMs ?? 0;
      if (wait <= 0) {
        run();
        return;
      }
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        run();
      }, wait);
    });
    observer.observe(el);

    resize();
    syncVisibility();

    return () => {
      disposed.current = true;
      running.current = false;
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      observer.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisChange);
      
      opts.current.onDispose?.();
      const context = opts.current.gl?.();
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      startedAt.current = 0;
      last.current = 0;
      frame.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const halted = options.halted ?? false;
  useEffect(() => {
    if (!halted) start();
  }, [halted, start]);

  return useMemo<AnimationLoopHandle>(
    () => ({
      start,
      stop,
      paint,
      resize,
      get running() {
        return running.current;
      },
    }),
    [start, stop, paint, resize],
  );
}
