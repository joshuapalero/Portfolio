import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './pixel_transition.css';

export interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  ariaLabel?: string;
  onCycle?: () => void;
}

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 22,
  pixelColor,
  animationStepDuration = 0.95,
  once = false,
  className = '',
  style = {},
  aspectRatio,
  ariaLabel,
  onCycle,
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);
  // Keep a stable ref to the latest onCycle so async GSAP callbacks never
  // capture a stale closure regardless of when they fire.
  const onCycleRef = useRef<(() => void) | undefined>(onCycle);
  const [isActive, setIsActive] = useState(false);

  // Sync the ref whenever onCycle changes so GSAP callbacks always call the latest version
  useEffect(() => {
    onCycleRef.current = onCycle;
  }, [onCycle]);

  // Check for coarse / touch pointers (smartphones, tablets)
  const isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  // Cache the reduced-motion preference once at mount instead of creating a
  // fresh gsap.matchMedia() instance on every animatePixels() call.
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Procedural DOM grid of square pixel div elements
  useEffect(() => {
    const grid = pixelGridRef.current;
    if (!grid) return;

    grid.innerHTML = '';
    const step = 100 / gridSize;
    const fragment = document.createDocumentFragment();

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixelated-image-card__pixel';
        if (pixelColor) {
          pixel.style.backgroundColor = pixelColor;
        }
        pixel.style.width = `${step}%`;
        pixel.style.height = `${step}%`;
        pixel.style.left = `${col * step}%`;
        pixel.style.top = `${row * step}%`;
        fragment.appendChild(pixel);
      }
    }

    grid.appendChild(fragment);

    return () => {
      if (grid.children.length > 0) {
        gsap.killTweensOf(grid.children);
      }
      delayedCallRef.current?.kill();
    };
  }, [gridSize, pixelColor]);

  // GSAP 3-phase mosaic pixel transition
  const animatePixels = (activate: boolean) => {
    setIsActive(activate);
    const grid = pixelGridRef.current;
    const activeCard = activeCardRef.current;
    if (!grid || !activeCard) return;

    if (prefersReducedMotion) {
      activeCard.style.display = activate ? 'block' : 'none';
      activeCard.style.pointerEvents = activate ? 'none' : '';
      if (!activate) onCycleRef.current?.();
      return;
    }

    const pixels = grid.querySelectorAll<HTMLDivElement>('.pixelated-image-card__pixel');
    if (!pixels.length) {
      activeCard.style.display = activate ? 'block' : 'none';
      activeCard.style.pointerEvents = activate ? 'none' : '';
      if (!activate) onCycleRef.current?.();
      return;
    }

    gsap.killTweensOf(pixels);
    delayedCallRef.current?.kill();
    gsap.set(pixels, { display: 'none' });

    const staggerEach = animationStepDuration / pixels.length;
    const holdTime = 0.08;

    // Phase 1: Pixels progressively appear
    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: { each: staggerEach, from: 'random' },
    });

    // Phase 2: Swap the underlying layer
    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeCard.style.display = activate ? 'block' : 'none';
      activeCard.style.pointerEvents = activate ? 'none' : '';
    });

    // Phase 3: Pixels dissolve — always read onCycle via ref so the callback
    // is never stale regardless of when GSAP fires it asynchronously.
    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration + holdTime,
      stagger: { each: staggerEach, from: 'random' },
      onComplete: () => {
        if (!activate) onCycleRef.current?.();
      },
    });
  };

  const handleEnter = () => {
    if (!isActive) {
      animatePixels(true);
    }
  };

  const handleLeave = () => {
    if (isActive && !once) {
      animatePixels(false);
    }
  };

  const handleToggle = () => {
    if (isActive) {
      if (!once) animatePixels(false);
    } else {
      animatePixels(true);
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || 'Interactive profile avatar, hover or click to reveal alternate view'}
      className={`pixelated-image-card ${className}`.trim()}
      style={style}
      onMouseEnter={isTouch ? undefined : handleEnter}
      onMouseLeave={isTouch ? undefined : handleLeave}
      onClick={isTouch ? handleToggle : undefined}
      onFocus={isTouch ? undefined : handleEnter}
      onBlur={isTouch ? undefined : handleLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      {aspectRatio && <div style={{ paddingTop: aspectRatio }} aria-hidden="true" />}
      <div className="pixelated-image-card__default" aria-hidden={isActive}>
        {firstContent}
      </div>
      <div className="pixelated-image-card__active" ref={activeCardRef} aria-hidden={!isActive}>
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} aria-hidden="true" />
    </div>
  );
}
