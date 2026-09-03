"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { HardDrive, Cloud, Info, Feather, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { inviteCoSigner } from "@/lib/blueprint-api";

/* ------------------------------------------------------------------ */
/* New Document — authenticated source picker                         */
/* ------------------------------------------------------------------ */

const SOURCES = [
  { id: "device", label: "My Device", icon: HardDrive, color: "text-gray-500" },
  { id: "google", label: "Google Drive", icon: Cloud, color: "text-green-500" },
  { id: "onedrive", label: "Onedrive", icon: Cloud, color: "text-blue-500" },
  { id: "dropbox", label: "Dropbox", icon: Cloud, color: "text-sky-500" },
];

export function NewDocumentPanel({ onSelected }: { onSelected: (fileName: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSourceClick(id: string) {
    if (id === "device") {
      inputRef.current?.click();
      return;
    }
    // TODO: wire up real Google Drive / OneDrive / Dropbox picker integrations
    onSelected(`${SOURCES.find((s) => s.id === id)?.label} file.pdf`);
  }

  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1.5 shadow-xl">
      {SOURCES.map(({ id, label, icon: Icon, color }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleSourceClick(id)}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          <Icon className={cn("h-4 w-4", color)} />
          {label}
        </button>
      ))}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onSelected(e.target.files[0].name);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add Signer — authenticated co-signer form                          */
/* ------------------------------------------------------------------ */

export type SignerStatusValue = "Pending" | "Signed" | "Not Signed";

export type Signer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string | boolean;
};

export function AddSignerPanel({
  signers,
  onAddSigner,
  onResend,
  onClose,
}: {
  signers: Signer[];
  onAddSigner: (signer: Omit<Signer, "id" | "status">) => void;
  onResend: (id: string) => void;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [addMore, setAddMore] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleSendInvite() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    };

    setIsSending(true);
    try {
      const result = await inviteCoSigner(payload)
      if (!result.ok && result.status >= 400) {
        throw new Error(result.error ?? "Invite failed")
      }
      onAddSigner(payload);
      setFirstName("");
      setLastName("");
      setEmail("");
      if (!addMore) onClose();
    } catch (error) {
      console.error("Failed to create signer invite:", error)
      if (!addMore) onClose();
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Add Signer</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {signers.length > 0 && (
        <div className="mb-3 space-y-1.5 border-b border-gray-100 pb-3">
          {signers.map((s, i) => {
            // Expect backend to provide a normalized `status` string ("Signed" | "Pending" | "Not Signed").
            // Fall back to a simple string coercion if absent.
            const status = typeof s.status === 'string' && s.status ? s.status : 'Pending';

            return (
              <div key={s.id} className="rounded-md bg-gray-50 px-2.5 py-1.5 text-xs">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Signer {i + 1}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-medium",
                      status === "Signed"
                        ? "bg-green-100 text-green-700"
                        : status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    )}
                  >
                    {status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{s.firstName} {s.lastName}</span>
                  {status === "Pending" && (
                    <button type="button" onClick={() => onResend(s.id)} className="font-medium text-brand-600 hover:text-brand-700">
                      Resend Invite
                    </button>
                  )}
                </div>
                <div className="text-gray-400">{s.email}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label htmlFor="signerFirstName" className="text-xs">First name</Label>
          <Input
            id="signerFirstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Marcus"
            className="h-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="signerLastName" className="text-xs">Last name</Label>
          <Input
            id="signerLastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Armstrong"
            className="h-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
      </div>

      <div className="mt-2.5 space-y-1">
        <Label htmlFor="signerEmail" className="text-xs">Email Address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            id="signerEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            className="h-8 pl-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
      </div>

      <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs text-gray-600">
        <Checkbox checked={addMore} onCheckedChange={setAddMore} />
        Add more signer
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>Cancel</Button>
        <Button type="button" size="sm" className="h-8 bg-brand-600 text-xs text-white hover:bg-brand-700" onClick={handleSendInvite} disabled={isSending}>
          {isSending ? "Sending..." : "Send Invite"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Review — authenticated confirmation panel                       */
/* ------------------------------------------------------------------ */

export function AIReviewPanel({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
      <h3 className="mb-2 text-sm font-bold text-gray-900">AI Document Reviewer</h3>
      <p className="text-sm leading-snug text-gray-500">
        AI Engine uses Gemini API with a vector search approach (for example, Supabase pgvector) to review document chunks, spot issues, and provide contextual prompts.
      </p>
      <p className="mt-2 flex items-start gap-1 text-xs text-gray-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          <Link href="/terms" className="font-medium text-brand-600 hover:text-brand-700">Read Terms and Conditions</Link>{" "}
          to review the document with this system.
        </span>
      </p>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="button" size="sm" className="bg-brand-600 text-white hover:bg-brand-700" onClick={onStart}>Review free</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Approval watermark — brief overlay after "Review free"             */
/* ------------------------------------------------------------------ */

export function ApprovalWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40">
          <Feather className="h-7 w-7" />
        </div>
        <span className="text-lg font-bold tracking-wide">AI ENGINE</span>
        <span className="text-sm text-white/80">Gemini + pgvector</span>
      </div>
    </div>
  );
}