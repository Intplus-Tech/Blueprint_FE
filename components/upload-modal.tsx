"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, ChevronDown, X, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CloudStorageSelector } from '@/components/cloud-storage-selector'

export function UploadModal({
  open,
  onClose,
  onUploaded,
  onCloudUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (file: File) => void;
  onCloudUploaded?: (meta: { name: string; url?: string; size?: number }) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  }, []);

  const [showCloudSelector, setShowCloudSelector] = useState<null | 'gdrive' | 'onedrive' | 'dropbox'>(null);

  function handleCloudFileSelected(response: any) {
    // Cloud selector may redirect to provider or return an upload result.
    // For now just close the selector and modal; backend/upload callbacks can be handled elsewhere.
    setShowCloudSelector(null);
    // Try to extract a file name/url from common response shapes
    const name = response?.data?.fileName ?? response?.fileName ?? response?.data?.name ?? response?.name ?? response?.data?.url?.split('/').pop();
    const url = response?.data?.url ?? response?.url ?? response?.data?.fileUrl ?? response?.fileUrl;
    const size = response?.data?.size ?? response?.size;
    if (name && onCloudUploaded) {
      onCloudUploaded({ name, url, size });
    }
    onClose();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleContinue() {
    if (files[0]) onUploaded(files[0]);
    setFiles([]);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
            isDragging ? "border-brand-400 bg-brand-50" : "border-gray-300"
          )}
        >
          <UploadCloud className="h-8 w-8 text-gray-400" />

          <div className="relative flex">
            <Button type="button" className="rounded-r-none bg-brand-600 text-white hover:bg-brand-700" onClick={() => inputRef.current?.click()}>
              <FileText className="h-4 w-4" />
              Upload
            </Button>
            <Button type="button" className="rounded-l-none border-l border-brand-700 bg-brand-600 px-2 text-white hover:bg-brand-700" onClick={() => setMenuOpen((v) => !v)} aria-label="More upload options">
              <ChevronDown className="h-4 w-4" />
            </Button>

            {menuOpen && (
              <div className="absolute left-0 top-full z-10 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {[
                  { label: 'My Device', id: 'computer', icon: <Monitor className="h-4 w-4 text-neutral-600" /> },
                  { label: 'Google Drive', id: 'gdrive', icon: (
                    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                      <path fill="#0f9d58" d="m16.4 30.5 6.1-10.5H10.3L4.2 30.5z" />
                      <path fill="#4285f4" d="M31.6 30.5 25.5 20 19.4 9.5h12.2l6.1 10.5z" transform="translate(-3.6 0)" />
                      <path fill="#ffcd40" d="M31.6 30.5H10.3l6.1 10.5h21.3z" transform="translate(-3.6 0)" />
                    </svg>
                  )},
                  { label: 'Onedrive', id: 'onedrive', icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="#0364b8">
                      <path d="M10.5 6a5.5 5.5 0 0 1 5.1 3.5 4.5 4.5 0 0 1 .9 8.9H6a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 10.5 6Z" />
                    </svg>
                  )},
                  { label: 'Dropbox', id: 'dropbox', icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="#0061ff">
                      <path d="m6 2 6 3.8L6 9.6 0 5.8 6 2Zm12 0 6 3.8-6 3.8-6-3.8L18 2ZM0 13.4l6-3.8 6 3.8-6 3.8-6-3.8Zm18-3.8 6 3.8-6 3.8-6-3.8 6-3.8ZM6 18.4l6-3.8 6 3.8-6 3.8-6-3.8Z" />
                    </svg>
                  )},
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      if (option.id === 'computer') {
                        inputRef.current?.click();
                        return;
                      }
                      setShowCloudSelector(option.id as 'gdrive' | 'onedrive' | 'dropbox');
                    }}
                  >
                    <span className="flex items-center">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input ref={inputRef} type="file" className="hidden" onChange={(e) => addFiles(e.target.files)} />

          <p className="text-sm text-gray-500">{files.length > 0 ? files[0].name : "Drag your files here"}</p>

          {showCloudSelector && (
            <div className="w-full mt-4">
              <CloudStorageSelector onFileSelected={handleCloudFileSelected} onClose={() => setShowCloudSelector(null)} />
            </div>
          )}
        </div>

        {files.length > 0 && (
          <Button type="button" className="mt-4 w-full bg-brand-600 text-white hover:bg-brand-700" onClick={handleContinue}>Continue</Button>
        )}
      </div>
    </div>
  );
}