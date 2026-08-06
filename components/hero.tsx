'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import { UploadDropzone } from '@/components/upload-dropzone'

export function Hero() {
  const reduceMotion = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.14, delayChildren: 0.15 },
    },
  }

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:py-24"
    >
      <motion.h1
        variants={item}
        className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
      >
        Sign. Review. Lock.
      </motion.h1>
      <motion.p
        variants={item}
        className="mt-4 mb-10 max-w-xl text-pretty text-base text-white/90 sm:text-lg"
      >
        The only e-signature platform with built-in forensic AI
      </motion.p>
      <motion.div variants={item} className="w-full">
        <UploadDropzone />
      </motion.div>
    </motion.section>
  )
}
