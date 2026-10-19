'use client'

import type React from 'react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import './marquee-text.css'

export interface AutoMaskHorizontalProps extends React.ComponentPropsWithoutRef<'div'> {
  leftThreshold?: number
  rightThreshold?: number
  fadeSizePercent?: number
  transitionDurationMs?: number
}

export const AutoMaskHorizontal = forwardRef<
  HTMLDivElement,
  AutoMaskHorizontalProps
>(
  (
    {
      children,
      className,
      style,
      leftThreshold = 14,
      rightThreshold = 14,
      fadeSizePercent = 10,
      transitionDurationMs = 300,
      onScroll,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const frameRef = useRef<number | null>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node
        if (!ref) return
        if (typeof ref === 'function') {
          ref(node)
        } else {
          ref.current = node
        }
      },
      [ref]
    )

    const updateScrollState = useCallback(() => {
      const element = containerRef.current
      if (!element) return
      const { scrollLeft, scrollWidth, clientWidth } = element
      const normalizedScrollLeft = Math.max(0, scrollLeft)
      const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
      const resolvedLeftThreshold = Math.max(0, leftThreshold)
      const resolvedRightThreshold = Math.max(0, rightThreshold)
      setCanScrollLeft(normalizedScrollLeft > resolvedLeftThreshold)
      setCanScrollRight(
        maxScrollLeft - normalizedScrollLeft > resolvedRightThreshold
      )
    }, [leftThreshold, rightThreshold])

    useEffect(() => {
      updateScrollState()
    }, [updateScrollState, children])

    useEffect(() => {
      const element = containerRef.current
      if (!element) return

      const handleScroll = (event: Event) => {
        onScroll?.(event as unknown as React.UIEvent<HTMLDivElement>)
        if (frameRef.current !== null) return
        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = null
          updateScrollState()
        })
      }

      const handleResize = () => {
        updateScrollState()
      }

      element.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)

      return () => {
        element.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = null
        }
      }
    }, [onScroll, updateScrollState])

    const maskImage = useMemo(() => {
      const resolvedFade = Math.min(49, Math.max(0, fadeSizePercent))
      const leftStop = `${resolvedFade}%`
      const rightStop = `${100 - resolvedFade}%`

      if (canScrollLeft && canScrollRight) {
        return `linear-gradient(to right, transparent 0%, black ${leftStop}, black ${rightStop}, transparent 100%)`
      }
      if (canScrollLeft) {
        return `linear-gradient(to right, transparent 0%, black ${leftStop}, black 100%)`
      }
      if (canScrollRight) {
        return `linear-gradient(to right, black 0%, black ${rightStop}, transparent 100%)`
      }
      return 'none'
    }, [canScrollLeft, canScrollRight, fadeSizePercent])

    const mergedStyle = useMemo<React.CSSProperties>(
      () => ({
        ...style,
        maskImage,
        WebkitMaskImage: maskImage,
        transition:
          transitionDurationMs <= 0
            ? style?.transition
            : `mask-image ${transitionDurationMs}ms ease, -webkit-mask-image ${transitionDurationMs}ms ease`,
      }),
      [maskImage, style, transitionDurationMs]
    )

    return (
      <div
        {...rest}
        ref={setRefs}
        className={cn('auto-mask-horizontal', className)}
        style={mergedStyle}
      >
        {children}
      </div>
    )
  }
)

AutoMaskHorizontal.displayName = 'AutoMaskHorizontal'

export default AutoMaskHorizontal
