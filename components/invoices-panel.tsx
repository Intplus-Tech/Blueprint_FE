"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { invoiceTotal, type Invoice } from "@/lib/invoice-types";
import { InvoicePreviewModal } from "@/components/invoice-preview-modal";
import { InvoiceEditorModal } from "@/components/invoice-editor-modal";
import { TemplateGallery, TemplatePreviewModal, type Template } from "@/components/invoice-templates";
import { saveInvoice } from "@/lib/blueprint-api";

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

// ---- Editor's Panel (Image 3) -------------------------------------------

type BrandInfo = { isotype: string; logotype: string };
type InvoiceInfo = { name: string; address: string; taxNumber: string; signature: string };
type CompanyInfo = { web: string; email: string; phone: string };
type CurrencyInfo = { symbol: string; code: string; enabled: string[] };

const CURRENCY_OPTIONS = [
  { code: "USD", flag: "🇺🇸" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "CHF", flag: "🇨🇭" },
  { code: "JPY", flag: "🇯🇵" },
  { code: "NGN", flag: "🇳🇬" },
  { code: "BTC", flag: "₿" },
];

function EditorField({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const shared = "w-full rounded-md border border-[#dfe8f2] bg-[#f6f8fb] px-2.5 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500";
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-gray-500">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </div>
  );
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#dfe7f1] bg-[#f7f9fb] p-4 shadow-sm">
      <div className="rounded-md bg-[#edf4fb] px-2 py-1.5">
        <h3 className="text-xs font-semibold text-[#2d5478]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EditorsPanel() {
  const [brand, setBrand] = useState<BrandInfo>({ isotype: "", logotype: "" });
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({
    name: "BRIX Agency", address: "Pablo Alto, San Francisco, CA 94106, United States of America", taxNumber: "12345 6789 US0001", signature: "",
  });
  const [company, setCompany] = useState<CompanyInfo>({ web: "www.brixagency.com", email: "contact@brixagency.com", phone: "0802 - 879 - 0102" });
  const [currency, setCurrency] = useState<CurrencyInfo>({ symbol: "N", code: "NGN", enabled: ["USD", "NGN"] });

  function toggleCurrency(code: string) {
    setCurrency((prev) => ({
      ...prev,
      enabled: prev.enabled.includes(code) ? prev.enabled.filter((c) => c !== code) : [...prev.enabled, code],
    }));
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2 rounded-md border border-[#dfe7f1] bg-[#edf4fb]/80 px-3 py-2.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#dfeefb] text-brand-600">
          <Pencil className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">Edition Panel</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EditorCard title="Brand">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-gray-500">Isotype</label>
              <button type="button" className="text-[10px] font-medium text-brand-600 hover:underline">Change</button>
            </div>
            <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50">
              {brand.isotype ? (
                <img src={brand.isotype} alt="Isotype" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-gray-300">No image</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-gray-500">Logotype</label>
              <button type="button" className="text-[10px] font-medium text-brand-600 hover:underline">Change</button>
            </div>
            <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50">
              {brand.logotype ? (
                <img src={brand.logotype} alt="Logotype" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-gray-300">No image</span>
              )}
            </div>
          </div>
        </EditorCard>

        <EditorCard title="Invoice information">
          <EditorField label="Name/Company" value={invoiceInfo.name} onChange={(v) => setInvoiceInfo((p) => ({ ...p, name: v }))} />
          <EditorField label="Address" value={invoiceInfo.address} onChange={(v) => setInvoiceInfo((p) => ({ ...p, address: v }))} textarea />
          <EditorField label="Tax Number" value={invoiceInfo.taxNumber} onChange={(v) => setInvoiceInfo((p) => ({ ...p, taxNumber: v }))} />
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-500">Signature</label>
            <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50">
              {invoiceInfo.signature ? (
                <img src={invoiceInfo.signature} alt="Signature" className="h-full object-contain" />
              ) : (
                <span className="text-[10px] text-gray-400">Upload signature</span>
              )}
            </div>
          </div>
        </EditorCard>

        <EditorCard title="Company Information">
          <EditorField label="Web" value={company.web} onChange={(v) => setCompany((p) => ({ ...p, web: v }))} />
          <EditorField label="Email" value={company.email} onChange={(v) => setCompany((p) => ({ ...p, email: v }))} />
          <EditorField label="Number Phone" value={company.phone} onChange={(v) => setCompany((p) => ({ ...p, phone: v }))} />
        </EditorCard>

        <EditorCard title="Other information">
          <EditorField label="Currency Symbol" value={currency.symbol} onChange={(v) => setCurrency((p) => ({ ...p, symbol: v }))} />
          <EditorField label="Currency Code" value={currency.code} onChange={(v) => setCurrency((p) => ({ ...p, code: v }))} />
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-500">Currencies</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCY_OPTIONS.map((c) => {
                const active = currency.enabled.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCurrency(c.code)}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                      active ? "border-brand-300 bg-brand-50 text-brand-700" : "border-gray-200 bg-gray-50 text-gray-500"
                    )}
                  >
                    <span>{c.flag}</span>
                    {c.code}
                  </button>
                );
              })}
            </div>
          </div>
        </EditorCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

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
      // Fixed: this used to incorrectly reuse "Invoices > Create Invoice".
      // Image 2 shows the preview modal breadcrumb reading just "Preview".
      onBreadcrumbChange?.("Preview");
    } else if (templatePreview) {
      onBreadcrumbChange?.("Invoices > All Templates");
    } else if (subTab === "templates") {
      onBreadcrumbChange?.("Invoices > All Templates");
    } else if (subTab === "editor") {
      onBreadcrumbChange?.("Invoices > All Templates");
    } else {
      onBreadcrumbChange?.("Invoices > My Invoices");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab, editor, previewId, templatePreview]);

  const filtered = invoices.filter(
    (inv) => inv.contactName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.includes(search)
  );

  const previewInvoice = invoices.find((inv) => inv.id === previewId) ?? null;

  async function handleCreateSubmit(data: Omit<Invoice, "id" | "status">) {
    const payload = { ...data, status: "Draft" };
    const result = await saveInvoice(payload)
    const newInvoice = {
      ...payload,
      id: typeof result.data?.id === "string" ? result.data.id : crypto.randomUUID(),
      status: (typeof result.data?.status === "string" ? result.data.status : payload.status) as Invoice["status"],
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setEditor(null);
  }

  async function handleUpdateSubmit(data: Omit<Invoice, "id" | "status">) {
    if (!editor?.invoice) return;
    const payload = { ...data, status: editor.invoice.status };
    await saveInvoice(payload)
    setInvoices((prev) => prev.map((inv) => (inv.id === editor.invoice!.id ? { ...inv, ...payload, status: editor.invoice!.status } : inv)));
    setEditor(null);
  }

  return (
    <div className="mt-4 rounded-lg bg-transparent p-0 shadow-none sm:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-[2.1rem] font-black tracking-[-0.04em] text-gray-900">Invoices</h1>
          <nav className="flex items-center gap-4 text-sm">
            <SubTabButton label="My Invoices" active={subTab === "my"} onClick={() => setSubTab("my")} />
            <SubTabButton label="All Templates" active={subTab === "templates"} onClick={() => setSubTab("templates")} />
            <SubTabButton label="Editor&apos;s Panel" active={subTab === "editor"} onClick={() => setSubTab("editor")} />
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

      {subTab === "editor" && <EditorsPanel />}

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
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-[#1f2937] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {active && <span className="text-white">✓</span>}
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
          <span className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
            invoice.status === "Paid" && "bg-emerald-100 text-emerald-700",
            invoice.status === "Sent" && "bg-blue-100 text-blue-700",
            invoice.status === "Draft" && "bg-gray-100 text-gray-700"
          )}>{invoice.status}</span>
          <span className="font-semibold text-gray-900">${total.toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}
