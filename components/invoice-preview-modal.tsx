"use client";

import { X, Pencil, Save, Mail, Download, Phone, AtSign } from "lucide-react";
import { invoiceTotal, type Invoice } from "@/lib/invoice-types";
import { saveInvoice } from "@/lib/blueprint-api";
import { exportData } from "@/lib/export";

function PreviewActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
        primary
          ? "bg-[#0ea5e9] text-white hover:bg-[#0a9ad9]"
          : "bg-[#0ea5e9] text-white hover:bg-[#0a9ad9]",
      ].join(" ")}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function CompanyLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] border-[#12b3d7]" />
        <span className="-ml-3.5 flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] border-[#12b3d7]" />
      </div>
      <div className="-ml-1.5 flex items-baseline gap-2">
        <span className="text-[20px] font-black tracking-[-0.02em] text-[#1f2937]">Blueprint</span>
        <span className="text-[20px] font-light text-[#c7ced8]">|</span>
        <span className="text-[20px] font-light text-[#4b5563]">Invoice</span>
      </div>
    </div>
  );
}

function ContactBlock({
  align,
  name,
  address,
  email,
  phone,
}: {
  align: "left" | "right";
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
}) {
  const isRight = align === "right";
  return (
    <div className={isRight ? "text-right" : "text-left"}>
      {name && <p className="text-[13px] font-semibold text-gray-800">{name}</p>}
      {address && <p className="mt-0.5 whitespace-pre-line leading-5 text-gray-500">{address}</p>}
      {(email || phone) && (
        <div className="mt-3 space-y-0.5">
          {email && (
            <p
              className={[
                "flex items-center gap-1.5 text-gray-500",
                isRight ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              {!isRight && <AtSign className="h-3 w-3 text-gray-400" />}
              <span>{email}</span>
              {isRight && <AtSign className="h-3 w-3 text-gray-400" />}
            </p>
          )}
          {phone && (
            <p
              className={[
                "flex items-center gap-1.5 text-gray-500",
                isRight ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              {!isRight && <Phone className="h-3 w-3 text-gray-400" />}
              <span>{phone}</span>
              {isRight && <Phone className="h-3 w-3 text-gray-400" />}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatAmount(n: number) {
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD`;
}

export function InvoicePreviewModal({
  invoice,
  onClose,
  onUpdate,
}: {
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountAmount = subtotal * (invoice.discount / 100);
  const taxAmount = subtotal * (invoice.tax / 100);
  const total = invoiceTotal(invoice);

  async function handleSaveForLater() {
    try {
      await saveInvoice(invoice as unknown as Record<string, unknown>);
      onUpdate?.();
      console.log("Invoice saved")
    } catch (err) {
      console.error("Failed to save invoice:", err)
    }
  }

  async function handleDownload() {
    try {
      const rows = invoice.items.map((it) => ({
        description: it.description,
        hours: it.qty,
        units: it.qty,
        amount: (it.qty * it.rate).toFixed(2),
      }));

      await exportData({
        data: rows,
        format: 'csv',
        filename: `invoice-${invoice.invoiceNumber ?? Date.now()}`,
        headers: ['description', 'hours', 'units', 'amount'],
      });
    } catch (err) {
      console.error('Failed to download invoice:', err)
    }
  }

  function handleSendViaEmail() {
    try {
      const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber ?? ''}`);
      const bodyLines = [
        `Total: ${formatAmount(total)}`,
        '',
        'Items:',
        ...invoice.items.map((it) => `${it.description} — ${it.qty} x ${it.rate} = ${formatAmount(it.qty * it.rate)}`),
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const to = invoice.email ?? '';
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    } catch (err) {
      console.error('Failed to open mail client:', err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4 py-10"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[1000px] items-start gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto max-h-[88vh] w-full max-w-[720px] overflow-y-auto rounded-[10px] bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-4">
            <CompanyLogo />
            <div className="mt-1 shrink-0 text-right">
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Invoice No.
              </div>
              <div className="text-[12px] font-bold text-gray-800">
                {invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : ""}
              </div>
              <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Invoice Date
              </div>
              <div className="text-[11px] font-medium text-gray-600">{invoice.issueDate}</div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-10 text-[11px]">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                Recipient
              </p>
              <ContactBlock
                align="left"
                name={invoice.contactName}
                address={invoice.billTo}
                email={invoice.email}
                phone={invoice.phone}
              />
            </div>

            <div className="pt-[22px]">
              <ContactBlock
                align="right"
                name={invoice.contactName}
                address={invoice.billTo}
                email={invoice.email}
                phone={invoice.phone}
              />
            </div>
          </div>

          <table className="mt-7 w-full text-left text-[11px]">
            <thead>
              <tr className="border-b-2 border-[#12b3d7]/25 text-[10px] font-bold uppercase tracking-[0.12em] text-[#12b3d7]">
                <th className="px-2 py-2 font-bold">Description</th>
                <th className="px-2 py-2 text-right font-bold">Hours</th>
                <th className="px-2 py-2 text-right font-bold">Units</th>
                <th className="px-2 py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-[#eef3f8] text-gray-700">
                  <td className="px-2 py-2.5">{item.description}</td>
                  <td className="px-2 py-2.5 text-right">{item.qty}</td>
                  <td className="px-2 py-2.5 text-right">{item.qty}</td>
                  <td className="px-2 py-2.5 text-right font-medium text-gray-800">
                    {formatAmount(item.qty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-[240px] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-700">{formatAmount(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-[#12b3d7]">
                <span className="uppercase tracking-[0.04em]">Discount {invoice.discount}%</span>
                <span>- {formatAmount(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Tax {invoice.tax}%</span>
                <span className="text-gray-700">+ {formatAmount(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#edf2f7] pt-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-gray-900">
                  Total
                </span>
                <span className="text-[15px] font-bold text-[#12b3d7]">{formatAmount(total)}</span>
              </div>
            </div>
          </div>

          {invoice.email && (
            <div className="mt-6">
              <div className="rounded-t-md bg-[#12b3d7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                Account Data
              </div>
              <div className="rounded-b-md border border-t-0 border-[#e7edf5] px-3 py-3 text-[11px] leading-5 text-gray-600">
                <p>Transfer the amount to the business account below. Please include invoice number on your check.</p>
                <p className="mt-1">{invoice.email}</p>
              </div>
            </div>
          )}

          {invoice.terms && (
            <div className="mt-6 border-t border-[#edf2f7] pt-4 text-[11px] text-gray-500">
              <p className="font-bold uppercase tracking-[0.12em] text-gray-400">Notes</p>
              <p className="mt-2 whitespace-pre-line leading-5">{invoice.terms}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[#edf2f7] pt-3 text-[9px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#12b3d7]" />
              {invoice.contactName && (
                <span className="font-semibold uppercase tracking-[0.1em]">{invoice.contactName}</span>
              )}
            </div>
            {invoice.invoiceNumber && <span>Invoice #{invoice.invoiceNumber}</span>}
          </div>
        </div>

        <div className="flex w-[190px] flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto mb-1 flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-gray-500 transition hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <PreviewActionButton icon={Pencil} label="Back to Edit" onClick={onUpdate} primary />
          <PreviewActionButton icon={Save} label="Save for Later" onClick={handleSaveForLater} />
          <PreviewActionButton icon={Mail} label="Send via Email" onClick={handleSendViaEmail} />
          <PreviewActionButton icon={Download} label="Download" onClick={handleDownload} />
        </div>
      </div>
    </div>
  );
}