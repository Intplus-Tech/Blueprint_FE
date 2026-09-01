"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InvoiceItem } from "@/lib/invoice-types";

export type Template = {
  id: string;
  name: string;
  swatch: string;
  textClass: string;
  starterItem: InvoiceItem;
};

export const TEMPLATES: Template[] = [
  { id: "minimal", name: "Minimal", swatch: "bg-white border border-gray-200", textClass: "text-gray-800", starterItem: { id: "t1", description: "Consulting hours", qty: 1, rate: 500 } },
  { id: "classic", name: "Classic", swatch: "bg-amber-50 border border-amber-100", textClass: "text-amber-900", starterItem: { id: "t2", description: "Design services", qty: 1, rate: 1200 } },
  { id: "grid", name: "Grid", swatch: "bg-white border-2 border-gray-800", textClass: "text-gray-900", starterItem: { id: "t3", description: "Line item", qty: 2, rate: 250 } },
  { id: "badge", name: "Badge", swatch: "bg-stone-50 border border-stone-200", textClass: "text-stone-800", starterItem: { id: "t4", description: "Service fee", qty: 1, rate: 800 } },
  { id: "qr", name: "QR Code", swatch: "bg-black", textClass: "text-white", starterItem: { id: "t5", description: "Digital product", qty: 1, rate: 99 } },
  { id: "project", name: "Project", swatch: "bg-indigo-900", textClass: "text-white", starterItem: { id: "t6", description: "Project milestone", qty: 1, rate: 5000 } },
  { id: "studio", name: "Studio", swatch: "bg-orange-50 border border-orange-100", textClass: "text-orange-900", starterItem: { id: "t7", description: "Retainer", qty: 1, rate: 4900 } },
  { id: "modern", name: "Modern", swatch: "bg-slate-900", textClass: "text-white", starterItem: { id: "t8", description: "Premium package", qty: 1, rate: 2500 } },
];

function TemplateThumb({ template, className }: { template: Template; className?: string }) {
  return (
    <div className={cn("flex flex-col justify-between rounded-md p-3", template.swatch, className)}>
      <div className="space-y-1.5">
        <p className={cn("text-[10px] font-bold uppercase tracking-wide", template.textClass)}>Invoice</p>
        <div className={cn("h-1 w-2/3 rounded-full opacity-30", template.textClass, "bg-current")} />
        <div className={cn("h-1 w-1/2 rounded-full opacity-20", template.textClass, "bg-current")} />
      </div>
      <div className="mt-4 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("h-[3px] w-full rounded-full opacity-10", template.textClass, "bg-current")} />
        ))}
      </div>
      <p className={cn("mt-3 text-right text-[9px] font-semibold opacity-70", template.textClass)}>
        ${(template.starterItem.qty * template.starterItem.rate).toLocaleString()}
      </p>
    </div>
  );
}

export { TemplateThumb };

export function TemplateGallery({
  onPreview,
  onUseTemplate,
}: {
  onPreview: (template: Template) => void;
  onUseTemplate: (template: Template) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {TEMPLATES.map((template) => (
        <div key={template.id} className="group relative aspect-[3/4]">
          <button type="button" onClick={() => onPreview(template)} className="block h-full w-full">
            <TemplateThumb template={template} className="h-full shadow-sm transition-shadow group-hover:shadow-md" />
          </button>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-colors group-hover:bg-black/30">
            <Button
              type="button"
              size="sm"
              className="pointer-events-auto opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onUseTemplate(template)}
            >
              Use the Template
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Full-size preview ----------------------------------------------------
// Generic invoice preview without seeded customer or business data.

function TemplateFullPreview({ template }: { template: Template }) {
  const item = template.starterItem;
  const amount = item.qty * item.rate;
  const subtotal = amount;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">{template.name}</p>
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
        </div>
        <div className="text-right text-[11px] text-gray-400">
          <p>Invoice No.</p>
          <p className="font-semibold text-gray-700">INV-001</p>
          <p className="mt-1">Issue Date</p>
          <p className="font-semibold text-gray-700">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-[11px]">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-400">Bill To</p>
          <p className="mt-1 font-semibold text-gray-800">Client</p>
          <p className="text-gray-400">Customer details will be filled in later</p>
        </div>
        <div className="text-right">
          <p className="font-semibold uppercase tracking-wide text-gray-400">From</p>
          <p className="mt-1 font-semibold text-gray-800">Business Name</p>
          <p className="text-gray-400">Your contact info here</p>
        </div>
      </div>

      <table className="mt-6 w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-left font-semibold text-brand-500">
            <th className="pb-2">Description</th>
            <th className="pb-2 text-right">Qty</th>
            <th className="pb-2 text-right">Rate</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-50">
            <td className="py-2 text-gray-700">{item.description}</td>
            <td className="py-2 text-right text-gray-500">{item.qty}</td>
            <td className="py-2 text-right text-gray-500">${item.rate.toLocaleString()}</td>
            <td className="py-2 text-right text-gray-700">${amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-right text-[11px]">
        <p className="text-gray-400">
          Subtotal <span className="ml-4 inline-block w-24 font-medium text-gray-600">${subtotal.toLocaleString()}</span>
        </p>
        <p className="text-sm font-bold text-gray-900">
          Total <span className="ml-4 inline-block w-24 text-brand-700">${subtotal.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUseTemplate,
}: {
  template: Template;
  onClose: () => void;
  onUseTemplate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button type="button" size="sm" onClick={onUseTemplate}>Use the Template</Button>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <TemplateFullPreview template={template} />
      </div>
    </div>
  );
}
