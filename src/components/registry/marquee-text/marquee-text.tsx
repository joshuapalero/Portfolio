'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AutoMaskHorizontal } from './auto-mask-horizontal'
import { cn } from '@/lib/utils'
import './marquee-text.css'

export interface MarqueeTextProps {
  text: string
  className?: string
  style?: CSSProperties
  speed?: number
  gap?: number
  pause?: number
  alwaysScroll?: boolean
}

export function MarqueeText({
  text,
  className,
  style,
  speed = 22,
  gap = 40,
  pause = 0,
  alwaysScroll = false,
}: MarqueeTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const [isMarquee, setIsMarquee] = useState(false)
  const [travel, setTravel] = useState(0)
  const [animName] = useState(
    () => `__mq_${Math.random().toString(36).slice(2, 7)}`
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    const probe = probeRef.current
    if (!wrapper || !probe) return

    const measure = () => {
      if (alwaysScroll) {
        setIsMarquee(true)
        return
      }

      const probeStyle = getComputedStyle(probe)
      let lh = parseFloat(probeStyle.lineHeight)
      if (isNaN(lh)) {
        lh = parseFloat(probeStyle.fontSize) * 1.4
      }
      const wraps = probe.scrollHeight > Math.ceil(lh) + 2
      const widthOverflow = probe.scrollWidth > wrapper.clientWidth + 1
      setIsMarquee(wraps || widthOverflow)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    measure()
    return () => ro.disconnect()
  }, [text, alwaysScroll])

  useEffect(() => {
    if (isMarquee && trackRef.current) {
      const cycleWidth = trackRef.current.scrollWidth / 2
      setTravel(cycleWidth / speed)
    }
  }, [isMarquee, text, gap, speed])

  const total = travel + pause
  const holdPct = total > 0 ? (pause / total) * 100 : 0

  return (
    <div ref={wrapperRef} className="marquee-text-root">
      <span
        ref={probeRef}
        aria-hidden="true"
        className={cn('marquee-text-probe', className)}
        style={{
          ...style,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          visibility: 'hidden',
          whiteSpace: 'normal',
          pointerEvents: 'none',
        }}
      >
        {text}
      </span>

      {isMarquee ? (
        <AutoMaskHorizontal className="marquee-text-mask">
          <style>{`
            @keyframes ${animName} {
              ${holdPct > 0 ? `0%, ${holdPct}% { transform: translate3d(0, 0, 0); }` : '0% { transform: translate3d(0, 0, 0); }'}
              100% { transform: translate3d(-50%, 0, 0); }
            }
          `}</style>

          <div
            ref={trackRef}
            className="marquee-text-track"
            style={{
              animation:
                total > 0 ? `${animName} ${total}s linear infinite` : undefined,
              willChange: 'transform',
            }}
          >
            <span className={cn('marquee-text-item', className)} style={style}>
              {text}
            </span>
            <span
              className="marquee-text-spacer"
              aria-hidden="true"
              style={{ display: 'inline-block', width: gap, flexShrink: 0 }}
            />
            <span className={cn('marquee-text-item', className)} style={style} aria-hidden="true">
              {text}
            </span>
            <span
              className="marquee-text-spacer"
              aria-hidden="true"
              style={{ display: 'inline-block', width: gap, flexShrink: 0 }}
            />
          </div>
        </AutoMaskHorizontal>
      ) : (
        <p className={cn('marquee-text-static', className)} style={style}>
          {text}
        </p>
      )}
    </div>
  )
}

export default MarqueeText
