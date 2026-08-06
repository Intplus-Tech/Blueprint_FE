"use client";

import { useEffect, useRef, useState } from "react";
import { History, PenLine, Type, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SavedSignature = {
  id: string;
  kind: "draw" | "type" | "upload";
  dataUrl: string;
};

type Tab = "history" | "draw" | "type" | "upload";

const TABS: { id: Tab; label: string; icon: typeof History }[] = [
  { id: "history", label: "My Signature", icon: History },
  { id: "draw", label: "Draw it in", icon: PenLine },
  { id: "type", label: "Use your name", icon: Type },
  { id: "upload", label: "Upload image", icon: ImageIcon },
];

export function SignaturePanel({
  signatures,
  onInsert,
  onDeleteSaved,
  onClose,
  onTabChange,
  userName = "John Doe",
}: {
  signatures: SavedSignature[];
  onInsert: (sig: SavedSignature) => void;
  onDeleteSaved: (id: string) => void;
  onClose: () => void;
  onTabChange?: (tab: Tab) => void;
  userName?: string;
}) {
  const [tab, setTab] = useState<Tab>(signatures.length > 0 ? "history" : "draw");

  useEffect(() => {
    onTabChange?.(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="absolute right-0 top-full z-30 mt-2 flex w-[380px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      {/* Icon rail */}
      <div className="flex w-12 flex-col items-center gap-1 border-r border-gray-100 bg-gray-50 py-3">
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              tab === id ? "bg-brand-600 text-white" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            )}
            aria-label={id}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {tab === "history" ? "Use Signature" : "Add your Signature"}
          </h3>
          <button type="button" onClick={onClose} className="text-xs font-medium text-gray-400 hover:text-gray-600">
            Close
          </button>
        </div>

        {tab === "history" && (
          <HistoryTab signatures={signatures} onInsert={onInsert} onDelete={onDeleteSaved} onGoDraw={() => setTab("draw")} />
        )}
        {tab === "draw" && <DrawTab onInsert={onInsert} />}
        {tab === "type" && <TypeTab defaultName={userName} onInsert={onInsert} />}
        {tab === "upload" && <UploadTab onInsert={onInsert} />}
      </div>
    </div>
  );
}

function HistoryTab({
  signatures,
  onInsert,
  onDelete,
  onGoDraw,
}: {
  signatures: SavedSignature[];
  onInsert: (sig: SavedSignature) => void;
  onDelete: (id: string) => void;
  onGoDraw: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(signatures[0]?.id ?? null);
  const active = signatures.find((s) => s.id === selected) ?? null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500">My Signature</p>

      {signatures.length === 0 ? (
        <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 text-center">
          <p className="text-sm text-gray-400">No Signature found</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {signatures.map((sig) => (
            <button
              key={sig.id}
              type="button"
              onClick={() => setSelected(sig.id)}
              className={cn(
                "group relative flex h-20 w-28 items-center justify-center rounded-md border bg-white p-1",
                selected === sig.id ? "border-brand-500 ring-2 ring-brand-100" : "border-gray-200 hover:border-gray-300"
              )}
            >
              {sig.kind === "type" ? (
                <span className="font-script text-2xl text-gray-900">{sig.dataUrl}</span>
              ) : (
                <img src={sig.dataUrl} alt="Saved signature" className="max-h-full max-w-full object-contain" />
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sig.id);
                  if (selected === sig.id) setSelected(null);
                }}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow ring-1 ring-gray-200 hover:text-red-500 group-hover:flex"
              >
                <Trash2 className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      )}

      <Button type="button" className="w-full" disabled={!active} onClick={() => active && onInsert(active)}>
        {signatures.length === 0 ? "Add Signature" : "Add Signature to Document"}
      </Button>

      {signatures.length === 0 && (
        <button type="button" onClick={onGoDraw} className="w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700">
          Create a new signature
        </button>
      )}
    </div>
  );
}

function DrawTab({ onInsert }: { onInsert: (sig: SavedSignature) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function handlePointerUp() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function handleInsert() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onInsert({ id: crypto.randomUUID(), kind: "draw", dataUrl: canvas.toDataURL("image/png") });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500">Draw it in</p>
      <div className="relative rounded-md border border-gray-200 bg-brand-50/40">
        <canvas
          ref={canvasRef}
          width={316}
          height={110}
          className="h-[110px] w-full touch-none rounded-md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 border-b border-gray-300" />
        {!hasDrawn && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300">
            Sign here
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={clearCanvas} className="text-xs font-medium text-gray-500 hover:text-gray-700">
          Clear
        </button>
      </div>
      <Button type="button" className="w-full" disabled={!hasDrawn} onClick={handleInsert}>
        Insert
      </Button>
    </div>
  );
}

function TypeTab({ defaultName, onInsert }: { defaultName: string; onInsert: (sig: SavedSignature) => void }) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500">Use your name</p>
      <div className="relative rounded-md border border-gray-200 bg-brand-50/40 px-4 py-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-none bg-transparent font-script text-3xl text-gray-900 outline-none placeholder:text-gray-300"
          placeholder="Type your name"
        />
        <div className="mt-3 border-b border-gray-300" />
      </div>
      <Button
        type="button"
        className="w-full"
        disabled={!name.trim()}
        onClick={() => onInsert({ id: crypto.randomUUID(), kind: "type", dataUrl: name.trim() })}
      >
        Insert
      </Button>
    </div>
  );
}

function UploadTab({ onInsert }: { onInsert: (sig: SavedSignature) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500">Upload an image</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100"
      >
        {preview ? (
          <img src={preview} alt="Uploaded signature" className="max-h-24 max-w-full object-contain" />
        ) : (
          <>
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Click to choose an image</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <Button
        type="button"
        className="w-full"
        disabled={!preview}
        onClick={() => preview && onInsert({ id: crypto.randomUUID(), kind: "upload", dataUrl: preview })}
      >
        Insert
      </Button>
    </div>
  );
}