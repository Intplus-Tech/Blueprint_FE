"use client";

import { useState } from "react";
import { X, CheckCircle2, Clock, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* Shared signer row (used by Details + Resend modals) */

export type DetailSigner = {
  id: string;
  label?: string;
  name: string;
  email?: string;
  status: "Pending" | "Signed";
  date?: string;
};

function SignerRow({ signer, onResend }: { signer: DetailSigner; onResend?: (id: string) => void }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <div>
        {signer.label && <p className="text-xs font-semibold text-gray-500">{signer.label}</p>}
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-800">{signer.name}</p>
          {signer.status === "Pending" && onResend && (
            <button
              type="button"
              onClick={() => onResend(signer.id)}
              className="rounded bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-brand-700"
            >
              Resend Invite
            </button>
          )}
        </div>
        {signer.email && <p className="text-xs text-gray-400">{signer.email}</p>}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={cn("flex items-center gap-1 text-xs font-medium", signer.status === "Signed" ? "text-green-600" : "text-red-500")}>
          {signer.status === "Signed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {signer.status === "Signed" ? "Signed" : "Not Signed"}
        </span>
        {signer.date && <span className="text-[11px] text-gray-400">{signer.date}</span>}
      </div>
    </div>
  );
}

function InlineNewSignerForm({
  onCancel,
  onSend,
  compact = false,
}: {
  onCancel: () => void;
  onSend: (signer: { firstName: string; lastName: string; email: string }) => void;
  compact?: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  function handleSend() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    onSend({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    setFirstName("");
    setLastName("");
    setEmail("");
  }

  return (
    <div className={cn(compact ? "mt-3" : "mt-4 rounded-md border border-gray-100 bg-gray-50 p-3")}>
      {!compact && <p className="mb-2 text-xs font-semibold text-gray-600">New Signer</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label htmlFor="inlineFirstName" className="text-xs">First name</Label>
          <Input
            id="inlineFirstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Marcus"
            className="h-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="inlineLastName" className="text-xs">Last name</Label>
          <Input
            id="inlineLastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Armstrong"
            className="h-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        <Label htmlFor="inlineEmail" className="text-xs">Email Address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            id="inlineEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            className="h-8 pl-8 text-xs focus-visible:ring-brand-500"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" className="h-8 bg-brand-600 text-xs text-white hover:bg-brand-700" onClick={handleSend}>Send Invite</Button>
      </div>
    </div>
  );
}

/* Document Details — Properties + Signers + inline "New Signer" form */

export function DocumentDetailsModal({
  name, type, size, createdBy, signers, showAddForm, onToggleAddForm, onClose, onAddSigner, onResend,
}: {
  name: string; type: string; size: string; createdBy: string;
  signers: DetailSigner[]; showAddForm: boolean; onToggleAddForm: (open: boolean) => void;
  onClose: () => void;
  onAddSigner: (signer: { firstName: string; lastName: string; email: string }) => void;
  onResend: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2 border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500">Properties</p>
        <dl className="space-y-2 text-sm">
          <Row label="Document Name" value={name} />
          <Row label="Type" value={type} />
          <Row label="Size" value={size} />
          <Row label="Created By" value={createdBy} />
        </dl>

        <p className="mb-2 mt-5 border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500">Signer</p>
        <div className="space-y-3">
          {signers.map((s) => <SignerRow key={s.id} signer={s} onResend={onResend} />)}
        </div>

        {showAddForm ? (
          <InlineNewSignerForm
            onCancel={() => onToggleAddForm(false)}
            onSend={(signer) => { onAddSigner(signer); onToggleAddForm(false); }}
          />
        ) : (
          <Button type="button" className="mt-5 bg-brand-600 text-white hover:bg-brand-700" onClick={() => onToggleAddForm(true)}>+ New Signer</Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-700">{value}</dd>
    </div>
  );
}

/* Resend Invite — signer list + resend actions + add signer */

export function ResendInviteModal({
  signers, showAddForm, onToggleAddForm, onClose, onAddSigner, onResend,
}: {
  signers: DetailSigner[]; showAddForm: boolean; onToggleAddForm: (open: boolean) => void;
  onClose: () => void;
  onAddSigner: (signer: { firstName: string; lastName: string; email: string }) => void;
  onResend: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Resend Invite</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {signers.map((s) => <SignerRow key={s.id} signer={s} onResend={onResend} />)}
        </div>

        {showAddForm ? (
          <InlineNewSignerForm
            onCancel={() => onToggleAddForm(false)}
            onSend={(signer) => { onAddSigner(signer); onToggleAddForm(false); }}
          />
        ) : (
          <Button type="button" className="mt-5 bg-brand-600 text-white hover:bg-brand-700" onClick={() => onToggleAddForm(true)}>+ New Signer</Button>
        )}
      </div>
    </div>
  );
}

/* Delete confirmation */

export function DeleteConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="w-full max-w-xs rounded-lg bg-gray-900 p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <Trash2 className="h-5 w-5 text-white" />
        </div>
        <p className="mb-5 text-sm text-white">Are you sure you want delete this document?</p>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10" onClick={onCancel}>No</Button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Yes</button>
        </div>
      </div>
    </div>
  );
}

/* Standalone Add Signer Modal */

export function AddSignerModal({
  onClose,
  onAddSigner,
}: {
  onClose: () => void;
  onAddSigner: (signer: { firstName: string; lastName: string; email: string }) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Add Signer</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <InlineNewSignerForm
          compact
          onCancel={onClose}
          onSend={(signer) => {
            onAddSigner(signer);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

/* Export hook for dashboard usage */
export function useDashboardModals(docs: any[], handleAddSignerFromModal: (docId: string, signer: any) => void) {
  const [detailsDocId, setDetailsDocId] = useState<string | null>(null);
  const [addSignerDocId, setAddSignerDocId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const render = () => (
    <>
      {detailsDocId && (() => {
        const selectedDoc = docs.find((d) => d.id === detailsDocId);

        return (
          <DocumentDetailsModal
            name={selectedDoc?.name || ""}
            type="PDF Document"
            size="1.2 MB"
            createdBy={selectedDoc?.createdBy || "Unknown User"}
            signers={
              selectedDoc?.signers.map((s: any, idx: number) => ({
                id: String(idx),
                name: s.name,
                status: s.signed ? "Signed" : "Pending",
              })) || []
            }
            showAddForm={showAddForm}
            onToggleAddForm={setShowAddForm}
            onClose={() => {
              setDetailsDocId(null);
              setShowAddForm(false);
            }}
            onAddSigner={(signer) => handleAddSignerFromModal(detailsDocId, signer)}
            onResend={(id) => console.log("Resend to signer:", id)}
          />
        );
      })()}

      {addSignerDocId && (
        <AddSignerModal
          onClose={() => setAddSignerDocId(null)}
          onAddSigner={(signer) => handleAddSignerFromModal(addSignerDocId, signer)}
        />
      )}
    </>
  );

  return { render, setDetailsDocId, setAddSignerDocId };
}