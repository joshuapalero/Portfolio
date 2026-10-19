"use client";

import { useEffect, useMemo, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";

export type KineticSplit = "character" | "word";
export type KineticTrigger = "loop" | "hover";

export interface KineticProps {
  text?: string;
  stiffness?: number;
  damping?: number;
  mass?: number;
  jumpHeight?: number;
  anticipation?: number;
  windUp?: number;
  squash?: number;
  stagger?: number;
  interval?: number;
  trigger?: KineticTrigger;
  split?: KineticSplit;
  shadow?: boolean;
  accentColor?: string;
  paused?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

interface BodyProps {
  text: string;
  index: number;
  halted: boolean;
  cycle: number;
  stiffness: number;
  damping: number;
  mass: number;
  jumpHeight: number;
  anticipation: number;
  windUp: number;
  squash: number;
  stagger: number;
  interval: number;
  repeat: boolean;
  shadow: boolean;
  accentColor: string;
}

const SPEED_REF = 14;
const DEPTH_REF = 0.35;

function Body({
  text,
  index,
  halted,
  cycle,
  stiffness,
  damping,
  mass,
  jumpHeight,
  anticipation,
  windUp,
  squash,
  stagger,
  interval,
  repeat,
  shadow,
  accentColor,
}: BodyProps) {
  const target = useMotionValue(0);
  const y = useSpring(target, { stiffness, damping, mass });
  const velocity = useVelocity(y);

  const speedRef = Math.max(120, jumpHeight * SPEED_REF);
  const depthRef = Math.max(2, jumpHeight * DEPTH_REF);

  const scaleY = useTransform<number, number>(
    [velocity, y],
    ([v, py]: number[]) => {
      const stretch = Math.min(1, Math.abs(v) / speedRef);
      const depth = Math.min(1, Math.max(0, py) / depthRef);
      return 1 + squash * (stretch * 0.75 - depth * 1.05);
    },
  );
  const scaleX = useTransform<number, number>(
    [velocity, y],
    ([v, py]: number[]) => {
      const stretch = Math.min(1, Math.abs(v) / speedRef);
      const depth = Math.min(1, Math.max(0, py) / depthRef);
      return 1 - squash * (stretch * 0.42 - depth * 0.62);
    },
  );

  const lift = useTransform(y, (v: number) => Math.min(0, v));

  const shadowScale = useTransform(y, [-jumpHeight - 1, 0], [0.34, 1], {
    clamp: true,
  });
  const shadowFade = useTransform(y, [-jumpHeight - 1, 0], [0.08, 0.4], {
    clamp: true,
  });

  useEffect(() => {
    if (halted) {
      target.set(0);
      return;
    }
    const rise = 110;
    const fall = 190;
    const wind = anticipation > 0 ? Math.max(16, windUp) : 0;
    const total = wind + rise + fall;

    const controls = animate(
      target,
      wind > 0 ? [0, anticipation, -jumpHeight, 0] : [0, -jumpHeight, 0],
      {
        duration: total / 1000,
        times:
          wind > 0
            ? [0, wind / total, (wind + rise) / total, 1]
            : [0, rise / (rise + fall), 1],
        ease: "linear",
        delay: (index * stagger) / 1000,
        ...(repeat
          ? { repeat: Infinity, repeatDelay: Math.max(0, interval) / 1000 }
          : {}),
      },
    );
    return () => controls.stop();
  }, [
    target,
    halted,
    cycle,
    index,
    jumpHeight,
    anticipation,
    windUp,
    stagger,
    interval,
    repeat,
  ]);

  return (
    <span className="relative inline-block">
      {shadow ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] bottom-[-0.16em] h-[0.12em] rounded-[50%] blur-[1.5px]"
          style={{
            backgroundColor: accentColor,
            scaleX: shadowScale,
            opacity: shadowFade,
          }}
        />
      ) : null}
      <motion.span
        className="inline-block origin-bottom whitespace-pre"
        style={{ y: lift, scaleX, scaleY }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export default function Kinetic({
  text = "",
  stiffness = 620,
  damping = 20,
  mass = 1,
  jumpHeight = 26,
  anticipation = 7,
  windUp = 130,
  squash = 0.62,
  stagger = 34,
  interval = 2400,
  trigger = "loop",
  split = "character",
  shadow = true,
  accentColor = "#a855f7",
  paused = false,
  reducedMotion = false,
  className,
}: KineticProps) {
  const halted = paused || reducedMotion;
  const [cycle, setCycle] = useState(0);

  const groups = useMemo(() => {
    const words = text.split(/(\s+)/).filter((part) => part.length > 0);
    let n = 0;
    return words.map((part) => {
      if (/^\s+$/.test(part)) return { space: true, bodies: [] as string[], at: [] as number[] };
      const bodies = split === "word" ? [part] : Array.from(part);
      const at = bodies.map(() => n++);
      return { space: false, bodies, at };
    });
  }, [text, split]);

  const replay = () => {
    if (trigger !== "hover" || halted) return;
    setCycle((n) => n + 1);
  };

  return (
    <div
      className={cn("select-none", className)}
      onPointerEnter={replay}
      onFocus={replay}
      tabIndex={trigger === "hover" ? 0 : undefined}
      onPointerDown={trigger === "hover" ? replay : undefined}
    >
      <span aria-hidden>
        {groups.map((group, gi) =>
          group.space ? (
            <span key={gi}> </span>
          ) : (
            <span key={gi} className="inline-block">
              {group.bodies.map((body, bi) => (
                <Body
                  key={bi}
                  text={body}
                  index={group.at[bi]}
                  halted={halted}
                  cycle={cycle}
                  stiffness={stiffness}
                  damping={damping}
                  mass={mass}
                  jumpHeight={jumpHeight}
                  anticipation={anticipation}
                  windUp={windUp}
                  squash={squash}
                  stagger={stagger}
                  interval={interval}
                  repeat={trigger === "loop"}
                  shadow={shadow}
                  accentColor={accentColor}
                />
              ))}
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
    </div>
  );
}
