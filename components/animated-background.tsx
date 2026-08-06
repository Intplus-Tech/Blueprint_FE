'use client'

import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react'

const BG_IMAGE =
  '/background.png'

/**
 * Full-bleed background photo with a subtle mouse-driven parallax.
 * Motion is disabled automatically when the user prefers reduced motion.
 */
export function AnimatedBackground() {
  const reduceMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), {
    stiffness: 60,
    damping: 20,
  })
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-18, 18]), {
    stiffness: 60,
    damping: 20,
  })

  useEffect(() => {
    if (reduceMotion) return
    function onMove(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth - 0.5)
      mouseY.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY, reduceMotion])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950">
      <motion.img
        src={BG_IMAGE || '/placeholder.svg'}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        style={reduceMotion ? undefined : { x, y }}
        initial={reduceMotion ? undefined : { scale: 1.12, opacity: 0 }}
        animate={reduceMotion ? undefined : { scale: 1.08, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 size-full scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
    </div>
  )
}
