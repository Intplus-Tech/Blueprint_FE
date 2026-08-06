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
  { id: "mockup", name: "Mockup Invoice", swatch: "bg-gray-900", textClass: "text-white", starterItem: { id: "t2", description: "Screeding Machine (5 Days)", qty: 3, rate: 300000 } },
  { id: "cream", name: "Classic", swatch: "bg-amber-50 border border-amber-100", textClass: "text-amber-900", starterItem: { id: "t3", description: "Design services", qty: 1, rate: 1200 } },
  { id: "grid", name: "Grid", swatch: "bg-white border-2 border-gray-800", textClass: "text-gray-900", starterItem: { id: "t4", description: "Line item", qty: 2, rate: 250 } },
  { id: "badge", name: "Badge", swatch: "bg-stone-50 border border-stone-200", textClass: "text-stone-800", starterItem: { id: "t5", description: "Service fee", qty: 1, rate: 800 } },
  { id: "qr", name: "QR Code", swatch: "bg-black", textClass: "text-white", starterItem: { id: "t6", description: "Digital product", qty: 1, rate: 99 } },
  { id: "project", name: "Project XYZ", swatch: "bg-indigo-900", textClass: "text-white", starterItem: { id: "t7", description: "Project milestone", qty: 1, rate: 5000 } },
  { id: "panda", name: "Panda Inc", swatch: "bg-orange-50 border border-orange-100", textClass: "text-orange-900", starterItem: { id: "t8", description: "Retainer", qty: 1, rate: 4900 } },
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
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button type="button" size="sm" onClick={onUseTemplate}>Use the Template</Button>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <TemplateThumb template={template} className="min-h-[420px] rounded-b-none rounded-t-lg p-6" />
        <div className="p-4 text-center text-sm font-medium text-gray-600">{template.name}</div>
      </div>
    </div>
  );
}