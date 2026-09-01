'use client'

import { useState } from 'react'
import { Cloud, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  uploadFile,
  getGoogleAuthUrl,
  type UploadResponse,
} from '@/lib/api-client'

interface StorageOption {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  action: () => Promise<void>
}

export function CloudStorageSelector({
  onFileSelected,
  onClose,
}: {
  onFileSelected?: (response: UploadResponse | { authUrl: string }) => void
  onClose?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleDrive = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getGoogleAuthUrl()
      console.log('Google Drive auth URL:', result)

      const authUrl = result?.authUrl ?? result?.data?.authUrl
      if (typeof authUrl === 'string' && authUrl.startsWith('http')) {
        window.location.href = authUrl
        return
      }

      if (typeof authUrl === 'string' && authUrl.startsWith('/')) {
        window.location.href = authUrl
        return
      }

      if (result?.ok !== false) {
        localStorage.setItem('bp-cloud-google-drive', JSON.stringify({ provider: 'google-drive', connectedAt: new Date().toISOString() }))
        onFileSelected?.(result as any)
      }
    } catch (err) {
      setError('Failed to connect Google Drive. Check your backend connection.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocalUpload = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          try {
            const result = await uploadFile(file)
            onFileSelected?.(result)
            console.log('File uploaded:', result)
          } catch (uploadError) {
            setError('Failed to upload file. Check your backend connection.')
            console.error(uploadError)
          }
        }
      }
      input.click()
    } catch (err) {
      setError('Failed to open file picker.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const storageOptions: StorageOption[] = [
    {
      id: 'local',
      name: 'My Device',
      icon: <HardDrive className="h-6 w-6" />,
      color: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
      action: handleLocalUpload,
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 16.5l-5-8.5h10l-5 8.5z" fill="#4285F4" />
          <path d="M16 5.5l-5 8.5h10l-5-8.5z" fill="#34A853" />
          <path d="M8 16.5l5 8.5h-10l5-8.5z" fill="#FBBC04" />
        </svg>
      ),
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      action: handleGoogleDrive,
    },
  ]

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Choose Storage</h2>
        </div>
        <p className="text-sm text-gray-600">Select where to import your documents from</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {storageOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.action}
            disabled={isLoading}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-gray-700 flex-shrink-0">{option.icon}</div>
            <span className="font-medium text-gray-900 text-left flex-1">{option.name}</span>
            {isLoading && (
              <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>

      {onClose && (
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        Your data is securely transmitted to your backend server.
      </p>
    </div>
  )
}
