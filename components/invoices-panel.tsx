"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { invoiceTotal, type Invoice } from "@/lib/invoice-types";
import { InvoicePreviewModal } from "@/components/invoice-preview-modal";
import { InvoiceEditorModal } from "@/components/invoice-editor-modal";
import { TemplateGallery, TemplatePreviewModal, type Template } from "@/components/invoice-templates";

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "1", invoiceNumber: "000123", billTo: "Address | Contact Info", contactName: "Client Name",
    email: "", phone: "", issueDate: "December 2, 2023", dueDate: "December 20, 2023",
    items: [{ id: "i1", description: "Invoice item 1", qty: 1, rate: 4000 }],
    tax: 0, discount: 0, terms: "Have a great day.", status: "Draft",
  },
  {
    id: "2", invoiceNumber: "23455", billTo: "Company Name LLC", contactName: "Company Name LLC",
    email: "", phone: "", issueDate: "25 Jan 2025", dueDate: "25 Jan 2025",
    items: [{ id: "i2", description: "Retainer", qty: 1, rate: 4000 }],
    tax: 0, discount: 0, terms: "", status: "Sent",
  },
  {
    id: "3", invoiceNumber: "23456", billTo: "Company Name LLC", contactName: "Company Name LLC",
    email: "", phone: "", issueDate: "25 Jun 2025", dueDate: "25 Jun 2025",
    items: [{ id: "i3", description: "Retainer", qty: 1, rate: 4000 }],
    tax: 0, discount: 0, terms: "", status: "Sent",
  },
];

type SubTab = "my" | "templates" | "editor";
type EditorState = { mode: "create" | "update"; invoice?: Invoice; template?: Template } | null;

export function InvoicesPanel({ onBreadcrumbChange }: { onBreadcrumbChange?: (text: string) => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [subTab, setSubTab] = useState<SubTab>("my");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [templatePreview, setTemplatePreview] = useState<Template | null>(null);

  useEffect(() => {
    if (editor?.mode === "update") {
      onBreadcrumbChange?.("Update Invoice");
    } else if (editor?.mode === "create" && editor.template) {
      onBreadcrumbChange?.("Use Template Invoice");
    } else if (editor?.mode === "create") {
      onBreadcrumbChange?.("Invoices > Create Invoice");
    } else if (previewId) {
      onBreadcrumbChange?.("Invoices > Create Invoice");
    } else if (templatePreview) {
      onBreadcrumbChange?.("Invoices > All Templates");
    } else if (subTab === "templates") {
      onBreadcrumbChange?.("Invoices > All Templates");
    } else if (subTab === "editor") {
      onBreadcrumbChange?.("Invoices > Editor's Panel");
    } else {
      onBreadcrumbChange?.("Invoices > My Invoices");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab, editor, previewId, templatePreview]);

  const filtered = invoices.filter(
    (inv) => inv.contactName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.includes(search)
  );

  const previewInvoice = invoices.find((inv) => inv.id === previewId) ?? null;

  function handleCreateSubmit(data: Omit<Invoice, "id" | "status">) {
    setInvoices((prev) => [{ ...data, id: crypto.randomUUID(), status: "Draft" }, ...prev]);
    setEditor(null);
  }

  function handleUpdateSubmit(data: Omit<Invoice, "id" | "status">) {
    if (!editor?.invoice) return;
    setInvoices((prev) => prev.map((inv) => (inv.id === editor.invoice!.id ? { ...inv, ...data } : inv)));
    setEditor(null);
  }

  return (
    <div className="mt-4 rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <nav className="flex items-center gap-4 text-sm">
            <SubTabButton label="My Invoices" active={subTab === "my"} onClick={() => setSubTab("my")} />
            <SubTabButton label="All Templates" active={subTab === "templates"} onClick={() => setSubTab("templates")} />
            <SubTabButton label="Editor's Panel" active={subTab === "editor"} onClick={() => setSubTab("editor")} />
          </nav>
        </div>

        {subTab === "my" && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Invoices"
              className="w-44 rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        {subTab === "templates" && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search for invoice"
              className="w-44 rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      {subTab === "editor" && (
        <div className="mt-6 flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Editor&apos;s Panel coming soon.
        </div>
      )}

      {subTab === "templates" && (
        <TemplateGallery
          onPreview={(t) => setTemplatePreview(t)}
          onUseTemplate={(t) => { setTemplatePreview(null); setEditor({ mode: "create", template: t }); }}
        />
      )}

      {subTab === "my" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setEditor({ mode: "create" })}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200 text-brand-600 hover:border-brand-300 hover:bg-brand-50"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Create New Invoice</span>
          </button>

          {filtered.map((inv) => <InvoiceCard key={inv.id} invoice={inv} onClick={() => setPreviewId(inv.id)} />)}

          {filtered.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-gray-400">No invoices match your search.</p>
          )}
        </div>
      )}

      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewId(null)}
          onUpdate={() => { setPreviewId(null); setEditor({ mode: "update", invoice: previewInvoice }); }}
        />
      )}

      {templatePreview && (
        <TemplatePreviewModal
          template={templatePreview}
          onClose={() => setTemplatePreview(null)}
          onUseTemplate={() => {
            const t = templatePreview;
            setTemplatePreview(null);
            setEditor({ mode: "create", template: t });
          }}
        />
      )}

      {editor && (
        <InvoiceEditorModal
          mode={editor.mode}
          invoice={editor.mode === "update" ? editor.invoice : editor.template ? { items: [editor.template.starterItem] } : undefined}
          templateThumbnail={
            editor.template ? (
              <div className={cn("flex h-full flex-col justify-between rounded-md p-3", editor.template.swatch)}>
                <p className={cn("text-[10px] font-bold uppercase tracking-wide", editor.template.textClass)}>Invoice</p>
                <p className={cn("text-right text-[9px] font-semibold opacity-70", editor.template.textClass)}>
                  ${(editor.template.starterItem.qty * editor.template.starterItem.rate).toLocaleString()}
                </p>
              </div>
            ) : undefined
          }
          onClose={() => setEditor(null)}
          onSubmit={editor.mode === "create" ? handleCreateSubmit : handleUpdateSubmit}
        />
      )}
    </div>
  );
}

function SubTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex items-center gap-1 border-b-2 pb-0.5 font-medium transition-colors", active ? "border-brand-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600")}
    >
      {active && <span className="text-brand-600">✓</span>}
      {label}
    </button>
  );
}

function InvoiceCard({ invoice, onClick }: { invoice: Invoice; onClick: () => void }) {
  const total = invoiceTotal(invoice);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[3/4] flex-col overflow-hidden rounded-md border border-gray-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex-1 space-y-2 p-3">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold text-gray-700">Invoice</span>
          <span className="text-[9px] text-gray-400">#{invoice.invoiceNumber}</span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-3/4 rounded-full bg-gray-100" />
          <div className="h-1.5 w-1/2 rounded-full bg-gray-100" />
        </div>
        <div className="mt-3 space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-1 w-full rounded-full bg-gray-50" />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{invoice.status}</span>
          <span className="font-semibold text-gray-900">${total.toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}
