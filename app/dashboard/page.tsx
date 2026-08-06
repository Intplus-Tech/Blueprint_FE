"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  AddSignerModal,
  DocumentDetailsModal,
  ResendInviteModal,
  DeleteConfirmModal,
  type DetailSigner,
} from "@/components/dashboard-modals";
import { UploadModal } from "@/components/upload-modal";
import { InvoicesPanel } from "@/components/invoices-panel";
import { Search, Settings, Bell, LogOut, Filter, DownloadCloud, MoreVertical, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { storePdfFile } from "@/lib/pdf";

type Status = "Pending" | "Signed" | "Expired";

type DocRow = {
  id: string;
  docId: string;
  name: string;
  status: Status;
  signers: { name: string; signed: boolean }[];
  created: string;
  lastActivity: string;
  createdBy: string;
};

const INITIAL_DOCS: DocRow[] = [
  {
    id: "1", docId: "144532", name: "Sales Agreement.pdf", status: "Pending",
    signers: [{ name: "Busayo", signed: false }, { name: "James", signed: true }, { name: "Gbemisola", signed: true }, { name: "Gabriel", signed: true }],
    created: "21.03.2021", lastActivity: "14.07.2021",
    createdBy: "Busayo",
  },
  {
    id: "2", docId: "335845", name: "NDA_Template.pdf", status: "Signed",
    signers: [{ name: "Busayo", signed: false }, { name: "James", signed: true }, { name: "Gbemisola", signed: true }, { name: "Gabriel", signed: true }],
    created: "21.03.2021", lastActivity: "14.07.2021",
    createdBy: "Busayo",
  },
  {
    id: "3", docId: "720472", name: "Sales Agreement.pdf", status: "Expired",
    signers: [{ name: "Busayo", signed: false }, { name: "James", signed: true }, { name: "Gbemisola", signed: true }, { name: "Gabriel", signed: true }],
    created: "21.03.2021", lastActivity: "14.07.2021",
    createdBy: "Busayo",
  },
];

const STATUS_STYLES: Record<Status, string> = {
  Pending: "bg-amber-500",
  Signed: "bg-green-500",
  Expired: "bg-red-500",
};

type Tab = "Documents" | "Invoices" | "Templates";
type SortKey = "created" | "lastActivity" | null;

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("Documents");
  const [docs, setDocs] = useState<DocRow[]>(INITIAL_DOCS);
  const [selected, setSelected] = useState<Set<string>>(new Set(["1", "2"]));
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(12);

  // Modals state
  const [addSignerDocId, setAddSignerDocId] = useState<string | null>(null);
  const [detailsDocId, setDetailsDocId] = useState<string | null>(null);
  const [resendDocId, setResendDocId] = useState<string | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [invoicesEmpty, setInvoicesEmpty] = useState(false);

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter((d) => d.name.toLowerCase().includes(q) || d.docId.includes(q));
  }, [docs, search]);

  const allSelected = filteredDocs.length > 0 && filteredDocs.every((d) => selected.has(d.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allSelected) return new Set();
      return new Set(filteredDocs.map((d) => d.id));
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirmDelete() {
    if (deleteDocId) setDocs((prev) => prev.filter((d) => d.id !== deleteDocId));
    setDeleteDocId(null);
  }

  function handleAddSignerFromModal(docId: string, signer: { firstName: string; lastName: string; email: string }) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, signers: [...d.signers, { name: `${signer.firstName} ${signer.lastName}`, signed: false }] }
          : d
      )
    );
    setAddSignerDocId(null);
  }

  function handleUploaded(file: File) {
    storePdfFile(file).catch((err) => console.error("Failed to read file:", err));

    setDocs((prev) => [
      {
        id: crypto.randomUUID(),
        docId: String(Math.floor(100000 + Math.random() * 900000)),
        name: file.name,
        status: "Pending",
        signers: [{ name: "You", signed: false }],
        created: new Date().toLocaleDateString("en-GB").replaceAll("/", "."),
        lastActivity: new Date().toLocaleDateString("en-GB").replaceAll("/", "."),
        createdBy: "Busayo",
      },
      ...prev,
    ]);
  }

  function toDetailSigners(doc: DocRow): DetailSigner[] {
    return [
      { id: "you", name: "You (Alex)", status: "Signed" },
      ...doc.signers.map((s, i) => ({
        id: `${doc.id}:${i}`,
        label: `Signer ${i + 1}`,
        name: s.name,
        email: `${s.name.toLowerCase().replace(/\s+/g, "")}@greymail.com`,
        status: (s.signed ? "Signed" : "Pending") as DetailSigner["status"],
        date: s.signed ? new Date().toISOString().slice(0, 16).replace("T", " ") : undefined,
      })),
    ];
  }

  const selectedDoc = docs.find((d) => d.id === detailsDocId) ?? null;
  const resendDoc = docs.find((d) => d.id === resendDocId) ?? null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 shadow-sm sm:gap-3 sm:px-6">
        <div className="shrink-0 scale-[0.6] origin-left">
          <Logo />
        </div>
        <div className="relative min-w-0 max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quick access to documents"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-1 pl-7 pr-2 text-[11px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex shrink-0 flex-1 items-center justify-end gap-2 text-gray-400 sm:gap-2.5">
          <button type="button" className="shrink-0 hover:text-gray-600" aria-label="Settings"><Settings className="h-4 w-4" /></button>
          <button type="button" className="relative shrink-0 hover:text-gray-600" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">3</span>
          </button>
          <Link href="/login" className="shrink-0 hover:text-gray-600" aria-label="Log out"><LogOut className="h-4 w-4" /></Link>
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm w-fit">
          {(["Documents", "Invoices", "Templates"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors", tab === t ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:text-gray-700")}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Templates" && (
          <div className="mt-3 flex h-48 items-center justify-center rounded-lg bg-white text-xs text-gray-400 shadow-sm">
            No templates yet.
          </div>
        )}

        {tab === "Invoices" && (
          <InvoicesPanel onBreadcrumbChange={(text) => setInvoicesEmpty(text === "Invoices > New Invoices")} />
        )}

        {tab === "Documents" && (
          <div className="mt-3 rounded-lg bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-base font-semibold text-gray-900">Documents</h1>
              <button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                + New Document
              </button>
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 text-xs text-gray-500">
              <button type="button" className="flex items-center gap-1 hover:text-gray-700"><Filter className="h-3.5 w-3.5" />Filter</button>
              <button type="button" className="flex items-center gap-1 hover:text-gray-700"><DownloadCloud className="h-3.5 w-3.5" />Export</button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-medium text-gray-500">
                    <th className="w-8 py-1.5">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                    </th>
                    <th className="py-1.5 pr-3">Document ID</th>
                    <th className="py-1.5 pr-3">Document Name</th>
                    <th className="py-1.5 pr-3">Status</th>
                    <th className="py-1.5 pr-3">Signers</th>
                    <th className={cn("cursor-pointer select-none py-1.5 pr-3", sortKey === "created" && "rounded bg-brand-50 px-1.5 text-brand-700")} onClick={() => setSortKey("created")}>
                      Created
                    </th>
                    <th className={cn("cursor-pointer select-none py-1.5 pr-3", sortKey === "lastActivity" && "rounded bg-brand-50 px-1.5 text-brand-700")} onClick={() => setSortKey("lastActivity")}>
                      Last Activity
                    </th>
                    <th className="w-6 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-50 text-gray-700">
                      <td className="py-2">
                        <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleRow(doc.id)} className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                      </td>
                      <td className="py-2 pr-3">{doc.docId}</td>
                      <td className="py-2 pr-3 font-medium text-gray-900">{doc.name}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[doc.status])} />
                          {doc.status === "Pending" ? "Pending (You)" : doc.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {doc.signers.map((s) => (
                            <span key={s.name} className="inline-flex items-center gap-1 text-[11px]">
                              {s.signed ? <Check className="h-3 w-3 text-green-500" /> : <XIcon className="h-3 w-3 text-red-500" />}
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-gray-500">{doc.created}</td>
                      <td className="py-2 pr-3 text-gray-500">{doc.lastActivity}</td>
                      <td className="relative py-2">
                        <button type="button" onClick={() => setOpenMenuId((prev) => (prev === doc.id ? null : doc.id))} className="text-gray-400 hover:text-gray-600" aria-label="Row actions">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                        {openMenuId === doc.id && (
                          <RowMenu
                            docId={doc.id}
                            onClose={() => setOpenMenuId(null)}
                            onDelete={() => setDeleteDocId(doc.id)}
                            onAddSigner={() => setAddSignerDocId(doc.id)}
                            onViewDetails={() => setDetailsDocId(doc.id)}
                            onResend={() => setResendDocId(doc.id)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr><td colSpan={8} className="py-6 text-center text-xs text-gray-400">No documents match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={page} onChange={setPage} />
          </div>
        )}
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />

      {/* Render Add Signer Modal */}
      {addSignerDocId && (
        <AddSignerModal
          onClose={() => setAddSignerDocId(null)}
          onAddSigner={(signer) => handleAddSignerFromModal(addSignerDocId, signer)}
        />
      )}

      {/* Render Document Details Modal */}
      {selectedDoc && detailsDocId && (
        <DocumentDetailsModal
          name={selectedDoc.name}
          type="PDF Document"
          size="1.2 MB"
          createdBy={selectedDoc.createdBy}
          signers={toDetailSigners(selectedDoc)}
          showAddForm={showAddForm}
          onToggleAddForm={setShowAddForm}
          onClose={() => {
            setDetailsDocId(null);
            setShowAddForm(false);
          }}
          onAddSigner={(signer) => handleAddSignerFromModal(selectedDoc.id, signer)}
          onResend={(id) => console.log("Resend invite to:", id)}
        />
      )}

      {/* Render Resend Invite Modal */}
      {resendDoc && (
        <ResendInviteModal
          signers={toDetailSigners(resendDoc)}
          showAddForm={showAddForm}
          onToggleAddForm={setShowAddForm}
          onClose={() => { setResendDocId(null); setShowAddForm(false); }}
          onAddSigner={(signer) => handleAddSignerFromModal(resendDoc.id, signer)}
          onResend={(id) => console.log("Resend invite to:", id)}
        />
      )}

      {/* Render Delete Confirmation Modal */}
      {deleteDocId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteDocId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function RowMenu({
  docId,
  onClose,
  onDelete,
  onAddSigner,
  onViewDetails,
  onResend,
}: {
  docId: string;
  onClose: () => void;
  onDelete: () => void;
  onAddSigner: () => void;
  onViewDetails: () => void;
  onResend: () => void;
}) {
  type MenuItem = { label: string; href?: string; danger?: boolean; onClick?: () => void };

  const items: MenuItem[] = [
    { label: "Open Document", href: `/document?id=${docId}&from=dashboard` },
    { label: "Add Signer", onClick: onAddSigner },
    { label: "View Details", onClick: onViewDetails },
    { label: "Resend", onClick: onResend },
    { label: "Download (PDF)" },
    { label: "Delete", danger: true, onClick: onDelete },
  ];

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 text-left shadow-lg">
      {items.map((item) =>
        item.href ? (
          <Link key={item.label} href={item.href} className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50" onClick={onClose}>
            {item.label}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => { item.onClick?.(); onClose(); }}
            className={cn("block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50", item.danger ? "text-red-600" : "text-gray-600")}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

function Pagination({ page, onChange }: { page: number; onChange: (p: number) => void }) {
  const totalPages = 78;
  const nearby = [page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
      <button type="button" onClick={() => onChange(Math.max(1, page - 10))} className="hover:text-gray-700">← Prev 10</button>
      <div className="flex items-center gap-1">
        <PageButton n={1} active={page === 1} onClick={() => onChange(1)} />
        <span className="px-1 text-gray-300">…</span>
        {nearby.map((n) => <PageButton key={n} n={n} active={page === n} onClick={() => onChange(n)} />)}
        <span className="px-1 text-gray-300">…</span>
        <PageButton n={totalPages} active={page === totalPages} onClick={() => onChange(totalPages)} />
      </div>
      <button type="button" onClick={() => onChange(Math.min(totalPages, page + 10))} className="hover:text-gray-700">Next 10 →</button>
    </div>
  );
}

function PageButton({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[11px]", active ? "bg-brand-600 text-white" : "text-gray-500 hover:bg-gray-100")}>
      {n}
    </button>
  );
}