'use client'

import { useRef, useState } from 'react'
import { ChevronDown, UploadCloud, Monitor, CheckCircle2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { postJson } from '@/lib/api-client'
import { storePdfFile } from '@/lib/pdf'
import type { UploadPayload } from '@/lib/schemas'
import { useRouter } from 'next/navigation'

type SourceId = UploadPayload['source']

type Source = {
  id: SourceId
  label: string
  icon: React.ReactNode
}

const SOURCES: Source[] = [
  { id: 'device', label: 'My Device', icon: <Monitor className="size-4 text-neutral-600" /> },
  {
    id: 'gdrive',
    label: 'Google Drive',
    icon: (
      <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
        <path fill="#0f9d58" d="m16.4 30.5 6.1-10.5H10.3L4.2 30.5z" />
        <path fill="#4285f4" d="M31.6 30.5 25.5 20 19.4 9.5h12.2l6.1 10.5z" transform="translate(-3.6 0)" />
        <path fill="#ffcd40" d="M31.6 30.5H10.3l6.1 10.5h21.3z" transform="translate(-3.6 0)" />
      </svg>
    ),
  },
  {
    id: 'onedrive',
    label: 'Onedrive',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="#0364b8">
        <path d="M10.5 6a5.5 5.5 0 0 1 5.1 3.5 4.5 4.5 0 0 1 .9 8.9H6a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 10.5 6Z" />
      </svg>
    ),
  },
  {
    id: 'dropbox',
    label: 'Dropbox',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="#0061ff">
        <path d="m6 2 6 3.8L6 9.6 0 5.8 6 2Zm12 0 6 3.8-6 3.8-6-3.8L18 2ZM0 13.4l6-3.8 6 3.8-6 3.8-6-3.8Zm18-3.8 6 3.8-6 3.8-6-3.8 6-3.8ZM6 18.4l6-3.8 6 3.8-6 3.8-6-3.8Z" />
      </svg>
    ),
  },
]

function PdfIcon() {
  return (
    <span className="flex h-5 w-4 items-center justify-center rounded-[3px] bg-pdf text-[7px] font-bold text-white">
      PDF
    </span>
  )
}

async function registerUpload(payload: UploadPayload) {
  const res = await postJson('/api/upload', payload)
  if (res.ok) {
    toast.success('File ready', { description: payload.fileName })
  } else {
    toast.error('Upload failed', { description: 'Please try again.' })
  }
}

export function UploadDropzone() {
  const reduceMotion = useReducedMotion()
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File, source: SourceId) {
    setFileName(file.name)
    // Store the file locally so the document viewer can render it
    void storePdfFile(file)
    // Mark user as guest for client-side gating
    try {
      document.cookie = `bp-role=guest; max-age=${60 * 60 * 24}; path=/`
    } catch (e) {
      // ignore in non-browser contexts
    }
    void registerUpload({
      fileName: file.name,
      size: file.size,
      type: file.type,
      source,
    })
    // Navigate to document viewer in guest mode
    router.push('/document?from=guest')
  }

  function handleSource(source: Source) {
    if (source.id === 'device') {
      inputRef.current?.click()
    } else {
      setFileName(`Connecting to ${source.label}...`)
      toast.info(`Connecting to ${source.label}`)
      void registerUpload({ fileName: `${source.label} file`, source: source.id })
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file, 'device')
  }

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-lg border border-dashed px-6 py-12 transition-colors sm:py-16 ${
        dragging ? 'border-brand bg-white/10' : 'border-white/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file, 'device')
        }}
      />

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <UploadCloud className="size-10 text-white/80" aria-hidden="true" strokeWidth={1.5} />
      </motion.div>

      {/* Split upload button */}
      <div className="flex">
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="gap-2 rounded-r-none bg-brand font-bold text-white hover:bg-brand-hover"
        >
          <PdfIcon />
          Upload
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Choose upload source"
            className="group inline-flex items-center justify-center rounded-r-md border-l border-white/20 bg-brand px-2 text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white data-[popup-open]:bg-brand-hover"
          >
            <ChevronDown className="size-4 transition-transform group-data-[popup-open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {SOURCES.map((source) => (
              <DropdownMenuItem
                key={source.id}
                onSelect={() => handleSource(source)}
                className="gap-3"
              >
                {source.icon}
                {source.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {fileName ? (
        <p className="flex items-center gap-2 text-sm text-white">
          <CheckCircle2 className="size-4 text-brand" aria-hidden="true" />
          {fileName}
        </p>
      ) : (
        <p className="text-sm text-white/90">Drag your files here</p>
      )}
    </motion.div>
  )
}
