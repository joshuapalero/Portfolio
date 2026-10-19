"use client";

import { useEffect, useRef } from "react";
// Adapted import path for standard Vite structure without @/ alias
import { useAnimationLoop, type Metrics, type FrameInfo } from "../../../hooks/use-animation-loop";

interface WorldMapAsciiProps {
  color: string;
  particleSize: number;
  density: number;
  mouseRadius: number;
  drift: number;
  paused?: boolean;
}

interface ParticleData {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  density: number;
}

function updateParticle(
  p: ParticleData,
  mouseX: number,
  mouseY: number,
  t: number,
  mouseRadius: number,
  drift: number,
) {
  const dx = mouseX - p.x;
  const dy = mouseY - p.y;
  const distSq = dx * dx + dy * dy;
  const maxDistSq = mouseRadius * mouseRadius;

  if (mouseRadius > 0 && distSq < maxDistSq) {
    const distance = Math.sqrt(distSq);
    const force = (mouseRadius - distance) / mouseRadius;
    p.x -= (dx / distance) * force * p.density;
    p.y -= (dy / distance) * force * p.density;
  } else {
    const rx = p.x - p.baseX;
    const ry = p.y - p.baseY;
    if (rx !== 0) p.x -= rx / 15;
    if (ry !== 0) p.y -= ry / 15;
  }

  p.x += Math.sin(t + p.baseY) * drift;
  p.y += Math.cos(t + p.baseX) * drift;
}

export default function WorldMapAscii({
  color,
  particleSize,
  density,
  mouseRadius,
  drift,
  paused = false,
}: WorldMapAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<((now: number) => void | false) | null>(null);
  const measureRef = useRef<((m: Metrics) => void) | null>(null);

  const loop = useAnimationLoop({
    target: containerRef,
    halted: paused,
    dpr: 1,
    resizeDebounceMs: 150,
    onResize: (metrics: Metrics) => measureRef.current?.(metrics),
    onFrame: ({ now }: FrameInfo) => (drawRef.current ? drawRef.current(now) : false),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let mouseX = -1000;
    let mouseY = -1000;
    let particles: ParticleData[] = [];

    const mapImage = new Image();

    const initMap = () => {
      if (canvas.width === 0 || canvas.height === 0) return;

      const imgW = mapImage.naturalWidth || mapImage.width;
      const imgH = mapImage.naturalHeight || mapImage.height;
      if (imgW === 0 || imgH === 0) return;

      particles = [];

      const offscreenCanvas = document.createElement("canvas");
      const offscreenCtx = offscreenCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!offscreenCtx) return;

      const imgRatio = imgW / imgH;
      const MAP_SCALE = 0.95;
      let drawWidth = canvas.width * MAP_SCALE;
      let drawHeight = drawWidth / imgRatio;

      if (drawHeight > canvas.height * MAP_SCALE) {
        drawHeight = canvas.height * MAP_SCALE;
        drawWidth = drawHeight * imgRatio;
      }

      const offsetX = (canvas.width - drawWidth) / 2;
      const offsetY = (canvas.height - drawHeight) / 2;

      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.drawImage(mapImage, offsetX, offsetY, drawWidth, drawHeight);

      const imageData = offscreenCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const pixels = imageData.data;

      const res = Math.max(2, Math.round(11 - density));

      for (let y = 0; y < canvas.height; y += res) {
        for (let x = 0; x < canvas.width; x += res) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 50) {
            particles.push({
              x,
              y,
              baseX: x,
              baseY: y,
              density: Math.random() * 30 + 10,
            });
          }
        }
      }
    };

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const t = now * 0.001;
      const len = particles.length;

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        updateParticle(p, mouseX, mouseY, t, mouseRadius, drift);
        ctx.moveTo(p.x + particleSize, p.y);
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      }
      ctx.fill();

      if (paused) return false;
    };
    drawRef.current = animate;

    measureRef.current = ({ width, height }) => {
      canvas.width = width;
      canvas.height = height;
      initMap();
    };

    mapImage.onload = () => {
      loop.resize();
      loop.start();
    };
    mapImage.src = "/world-map.svg";

    if (mapImage.complete) {
      loop.resize();
      loop.start();
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      drawRef.current = null;
      measureRef.current = null;
      mapImage.onload = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, [color, particleSize, density, mouseRadius, drift, paused, loop]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', height: '100%', width: '100%', touchAction: 'none' }} 
      />
    </div>
  );
}
