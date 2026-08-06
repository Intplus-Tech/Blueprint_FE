"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
      <div className="relative flex max-h-[92vh] w-full max-w-3xl gap-4">
        <div className="flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{mode === "create" ? "New Invoice" : "Update Invoice"}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Date: <span className="font-medium text-gray-600">{date}</span></span>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <p className="mb-4 text-xs text-gray-400">Invoice No.: <span className="font-semibold text-gray-600">{invoiceNumber}</span></p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="billTo">Bill To</Label>
              <textarea id="billTo" value={billTo} onChange={(e) => setBillTo(e.target.value)} placeholder="Customer Address" rows={2}
                className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact Name" />
              <Label htmlFor="phone" className="pt-1 block">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact Number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Company Email Address" />
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="mb-1 grid grid-cols-[1fr_70px_100px_100px] gap-2 text-xs font-medium text-gray-400">
              <span>Description</span><span>QTY</span><span>Rate</span><span>Total</span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_70px_100px_100px] gap-2">
                  <Input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Description" />
                  <Input type="number" min={0} value={item.qty} onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })} />
                  <Input type="number" min={0} value={item.rate} onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) || 0 })} />
                  <Input value={`$${(item.qty * item.rate).toLocaleString()}`} readOnly className="bg-gray-50" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-[100px_100px_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="terms">Update Terms &amp; Conditions</Label>
              <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3}
                className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <span className="text-sm font-semibold text-gray-500">Total</span>
              <p className="text-lg font-bold text-gray-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <Button type="button" onClick={handleSubmit}>{mode === "create" ? "Create Invoice" : "Update Invoice"}</Button>
          </div>
        </div>

        {templateThumbnail && (
          <div className="hidden w-40 shrink-0 self-start rounded-lg bg-white p-2 shadow-2xl sm:block">{templateThumbnail}</div>
        )}
      </div>
    </div>
  );
}