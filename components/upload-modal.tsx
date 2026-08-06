"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (file: File) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  }, []);

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
                {["From computer", "From Google Drive", "From Dropbox"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setMenuOpen(false); if (option === "From computer") inputRef.current?.click(); }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input ref={inputRef} type="file" className="hidden" onChange={(e) => addFiles(e.target.files)} />

          <p className="text-sm text-gray-500">{files.length > 0 ? files[0].name : "Drag your files here"}</p>
        </div>

        {files.length > 0 && (
          <Button type="button" className="mt-4 w-full bg-brand-600 text-white hover:bg-brand-700" onClick={handleContinue}>Continue</Button>
        )}
      </div>
    </div>
  );
}