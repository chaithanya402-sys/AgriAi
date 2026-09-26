/**
 * AgricultureBackground
 * ─────────────────────
 * Full-screen cinematic Ken Burns + crossfade slideshow.
 *
 * - Renders TWO stacked <img> layers. The "outgoing" fades out while
 *   the "incoming" fades in via CSS opacity transition.
 * - Each layer gets a unique React key so it is fully remounted on every
 *   slide change, restarting the Ken Burns CSS animation from scratch.
 * - A <style> block in the document injects the @keyframes once.
 * - pointer-events: none — never blocks UI elements above.
 * - Respects prefers-reduced-motion.
 * - Preloads the NEXT image before it is shown.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Ken Burns animation variants ─────────────────────────────────────────────
// The CSS keyframes are injected once; each image picks a named animation.
const KB_ANIMATIONS = [
  'kb-zoom-in-tl',
  'kb-zoom-in-tr',
  'kb-zoom-in-bl',
  'kb-zoom-in-br',
  'kb-zoom-out-c',
  'kb-zoom-in-up',
  'kb-zoom-in-down',
  'kb-drift-right',
] as const

const KB_KEYFRAMES = `
  @keyframes kb-zoom-in-tl {
    from { transform: scale(1.00) translate(0%, 0%); }
    to   { transform: scale(1.10) translate(-2%, -2%); }
  }
  @keyframes kb-zoom-in-tr {
    from { transform: scale(1.00) translate(0%, 0%); }
    to   { transform: scale(1.10) translate(2%, -2%); }
  }
  @keyframes kb-zoom-in-bl {
    from { transform: scale(1.00) translate(0%, 0%); }
    to   { transform: scale(1.10) translate(-2%, 2%); }
  }
  @keyframes kb-zoom-in-br {
    from { transform: scale(1.00) translate(0%, 0%); }
    to   { transform: scale(1.10) translate(2%, 2%); }
  }
  @keyframes kb-zoom-out-c {
    from { transform: scale(1.10) translate(0%, 0%); }
    to   { transform: scale(1.00) translate(0%, 0%); }
  }
  @keyframes kb-zoom-in-up {
    from { transform: scale(1.00) translate(0%, 2%); }
    to   { transform: scale(1.09) translate(0%, -1%); }
  }
  @keyframes kb-zoom-in-down {
    from { transform: scale(1.00) translate(0%, -2%); }
    to   { transform: scale(1.09) translate(0%, 1%); }
  }
  @keyframes kb-drift-right {
    from { transform: scale(1.07) translate(-2%, 0%); }
    to   { transform: scale(1.07) translate(2%, 0%); }
  }
`

function injectKeyframes() {
  if (document.getElementById('agri-bg-keyframes')) return
  const style = document.createElement('style')
  style.id = 'agri-bg-keyframes'
  style.textContent = KB_KEYFRAMES
  document.head.appendChild(style)
}

function kbAnimForIndex(i: number) {
  return KB_ANIMATIONS[i % KB_ANIMATIONS.length]
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface AgricultureBackgroundProps {
  images: string[]
  /** Seconds each image is shown. Default 6 */
  displayDuration?: number
  /** Seconds for the crossfade. Default 2 */
  transitionDuration?: number
  /** 0-1 overlay darkness. Default 0.42 */
  overlayOpacity?: number
}

export function AgricultureBackground({
  images,
  displayDuration = 6,
  transitionDuration = 2,
  overlayOpacity = 0.42,
}: AgricultureBackgroundProps) {
  const total = images.length

  // Index of the image currently filling the screen
  const [activeIdx, setActiveIdx] = useState(0)
  // "generation" counter: bumped on every transition to force-remount the layers
  const [gen, setGen] = useState(0)
  // Is a crossfade in progress?
  const [fading, setFading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Inject @keyframes once
  useEffect(() => {
    if (!prefersReduced) injectKeyframes()
  }, [prefersReduced])

  // Preload next image
  useEffect(() => {
    if (total < 2) return
    const nextIdx = (activeIdx + 1) % total
    const img = new Image()
    img.src = images[nextIdx]
  }, [activeIdx, images, total])

  // Schedule advance
  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      // Start fade
      setFading(true)
      setGen((g) => g + 1)

      // After transition, commit the new index
      setTimeout(() => {
        setActiveIdx((idx) => (idx + 1) % total)
        setFading(false)
      }, transitionDuration * 1000)
    }, displayDuration * 1000)
  }, [displayDuration, transitionDuration, total])

  useEffect(() => {
    if (prefersReduced || total <= 1) return
    scheduleNext()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIdx, prefersReduced, scheduleNext, total])

  if (total === 0) return null

  const kbDurationMs = (displayDuration + transitionDuration) * 1000
  const nextIdx = (activeIdx + 1) % total
  const tfDuration = `${transitionDuration}s`

  // Reduced-motion: single static image, no Ken Burns
  if (prefersReduced) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <img
          src={images[0]}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <Overlay opacity={overlayOpacity} />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/*
       * LAYER A — outgoing (current active image)
       * Fades out when a transition starts.
       * key = gen so it is remounted after every transition.
       */}
      <KenBurnsImage
        key={`a-${gen}`}
        src={images[activeIdx]}
        opacity={fading ? 0 : 1}
        kbAnimation={kbAnimForIndex(activeIdx)}
        kbDurationMs={kbDurationMs}
        transitionDuration={tfDuration}
        zIndex={1}
      />

      {/*
       * LAYER B — incoming (next image)
       * Fades in during the transition, then becomes the new LAYER A
       * after the state swap at transitionDuration.
       */}
      <KenBurnsImage
        key={`b-${gen}`}
        src={images[nextIdx]}
        opacity={fading ? 1 : 0}
        kbAnimation={kbAnimForIndex(nextIdx)}
        kbDurationMs={kbDurationMs}
        transitionDuration={tfDuration}
        zIndex={fading ? 2 : 0}
      />

      <Overlay opacity={overlayOpacity} />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface KenBurnsImageProps {
  src: string
  opacity: number
  kbAnimation: string
  kbDurationMs: number
  transitionDuration: string
  zIndex: number
}

function KenBurnsImage({
  src,
  opacity,
  kbAnimation,
  kbDurationMs,
  transitionDuration,
  zIndex,
}: KenBurnsImageProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity,
        transition: `opacity ${transitionDuration} ease-in-out`,
        zIndex,
        willChange: 'opacity',
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover select-none"
        style={{
          objectPosition: 'center 40%',
          // Ken Burns: applied as a CSS animation on the <img> itself
          animationName: kbAnimation,
          animationDuration: `${kbDurationMs}ms`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards',
          animationPlayState: 'running',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

function Overlay({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 3,
        background: `linear-gradient(
          160deg,
          rgba(13,47,32,${opacity}) 0%,
          rgba(13,47,32,${opacity * 0.60}) 45%,
          rgba(13,47,32,${opacity * 0.75}) 100%
        )`,
      }}
    />
  )
}
