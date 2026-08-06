"use client";

import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoiceTotal, type Invoice } from "@/lib/invoice-types";

export function InvoicePreviewModal({
  invoice,
  onClose,
  onUpdate,
}: {
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const total = invoiceTotal(invoice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-8 shadow-2xl">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button type="button" size="sm" onClick={onUpdate}>Update Invoice</Button>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
          <div className="text-right text-xs text-gray-400">
            <p>Invoice No.</p>
            <p className="font-semibold text-gray-700">#{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400">Billed To:</p>
            <p className="mt-1 font-semibold text-gray-800">{invoice.contactName || "Client Name"}</p>
            <p className="whitespace-pre-line text-xs text-gray-400">{invoice.billTo || "Address | Contact Info"}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Issued On</p>
            <p className="mb-2 font-medium text-gray-600">{invoice.issueDate}</p>
            <p>Payment Due</p>
            <p className="font-medium text-gray-600">{invoice.dueDate}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400">
              <th className="pb-2">Services</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">{item.description || "Invoice item"}</td>
                <td className="py-2 text-right text-gray-500">{item.qty}</td>
                <td className="py-2 text-right text-gray-500">${item.rate.toLocaleString()}</td>
                <td className="py-2 text-right text-gray-700">${(item.qty * item.rate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-48 rounded-md bg-brand-50 px-4 py-3 text-right">
            <p className="text-xs font-medium text-brand-500">Total (USD)</p>
            <p className="text-xl font-bold text-brand-700">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:grid-cols-3">
          <div>
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded bg-brand-100 text-brand-600">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="font-semibold text-gray-700">Company Name LLC</p>
            <p>Address, City</p>
            <p>email@company.com</p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-700">Payment Instructions</p>
            <p>Transfer to the account below. Please include the invoice number as reference.</p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-700">Additional Notes</p>
            <p className="whitespace-pre-line">{invoice.terms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}