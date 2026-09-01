"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TEMPLATES, type Template, TemplateThumb } from "@/components/invoice-templates";
import type { Invoice, InvoiceItem } from "@/lib/invoice-types";

const DEFAULT_TERMS =
  "Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.";

function blankItem(): InvoiceItem {
  return { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 };
}

export function InvoiceEditorModal({
  mode,
  invoice,
  templateThumbnail,
  onClose,
  onSubmit,
}: {
  mode: "create" | "update";
  invoice?: Partial<Invoice>;
  templateThumbnail?: React.ReactNode;
  onClose: () => void;
  onSubmit: (data: Omit<Invoice, "id" | "status">) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!invoice?.contactName);
  const [billTo, setBillTo] = useState(invoice?.billTo ?? "");
  const [contactName, setContactName] = useState(invoice?.contactName ?? "");
  const [email, setEmail] = useState(invoice?.email ?? "");
  const [phone, setPhone] = useState(invoice?.phone ?? "");
  const [invoiceNumber] = useState(invoice?.invoiceNumber ?? String(Math.floor(1000 + Math.random() * 9000)));
  const [date] = useState(
    invoice?.issueDate ?? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
  );
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items?.length ? invoice.items : [blankItem()]);
  const [tax, setTax] = useState(invoice?.tax ?? 0);
  const [discount, setDiscount] = useState(invoice?.discount ?? 0);
  const [terms, setTerms] = useState(invoice?.terms ?? DEFAULT_TERMS);

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
  }

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
  const total = subtotal + subtotal * (tax / 100) - subtotal * (discount / 100);

  function handleSubmit() {
    onSubmit({ invoiceNumber, billTo, contactName, email, phone, issueDate: date, dueDate: invoice?.dueDate ?? date, items, tax, discount, terms });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl gap-4">
        <div className="flex-1 overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
          {showTemplateSelector && !invoice?.contactName ? (
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Choose an Invoice Template</h2>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateSelector(false);
                    }}
                    className="group relative aspect-[3/4] rounded-lg overflow-hidden transition-transform hover:scale-105"
                  >
                    <TemplateThumb template={template} className="h-full w-full" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/30">
                      <span className="pointer-events-auto rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                        Select
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[1.75rem] font-bold tracking-tight text-gray-900">{mode === "create" ? "New Invoice" : "Update Invoice"}</h2>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Draft</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Invoice No.: <span className="font-semibold text-gray-700">{invoiceNumber}</span></span>
                  <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
              </div>

              {selectedTemplate && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md">
                      <TemplateThumb template={selectedTemplate} className="h-full" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Using <span className="text-brand-600">{selectedTemplate.name}</span> template</span>
                  </div>
                  <button type="button" onClick={() => setShowTemplateSelector(true)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    Change
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="billTo">Bill To</Label>
                  <textarea id="billTo" value={billTo} onChange={(e) => setBillTo(e.target.value)} placeholder="Customer Address" rows={2}
                    className="w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact Name" className="bg-gray-50" />
                  <Label htmlFor="phone" className="pt-1 block">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact Number" className="bg-gray-50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Company Email Address" className="bg-gray-50" />
                  <div className="pt-1.5">
                    <span className="block text-[11px] font-medium text-gray-500">Date</span>
                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{date}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="mb-2 grid grid-cols-[1fr_70px_100px_100px] gap-2 text-xs font-medium text-gray-400">
                  <span>Description</span><span>QTY</span><span>Rate</span><span>Total</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_70px_100px_100px] gap-2">
                      <Input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Description" className="bg-gray-50" />
                      <Input type="number" min={0} value={item.qty} onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })} className="bg-gray-50" />
                      <Input type="number" min={0} value={item.rate} onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) || 0 })} className="bg-gray-50" />
                      <Input value={`$${(item.qty * item.rate).toLocaleString()}`} readOnly className="bg-gray-100" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-[100px_100px_1fr]">
                <div className="space-y-1.5">
                  <Label htmlFor="tax">Tax</Label>
                  <Input id="tax" type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value) || 0)} className="bg-gray-50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="discount">Discount</Label>
                  <Input id="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="bg-gray-50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="terms">Update Terms &amp; Conditions</Label>
                  <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3}
                    className="w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <span className="text-sm font-semibold text-gray-500">Total</span>
                  <p className="text-[2rem] font-bold tracking-tight text-gray-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <Button type="button" className="h-11 rounded-lg bg-[#1d7ef2] px-8 text-sm font-semibold text-white hover:bg-[#166bd6]" onClick={handleSubmit}>{mode === "create" ? "Create Invoice" : "Update Invoice"}</Button>
              </div>
            </div>
          )}
        </div>

        {selectedTemplate && !showTemplateSelector && (
          <div className="hidden w-52 shrink-0 self-start rounded-lg bg-white p-2 shadow-2xl sm:block">
            <TemplateThumb template={selectedTemplate} className="h-full" />
          </div>
        )}
      </div>
    </div>
  );
}