export type InvoiceItem = {
  id: string;
  description: string;
  qty: number;
  rate: number;
};

export type InvoiceStatus = "Draft" | "Sent" | "Paid";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  billTo: string;
  contactName: string;
  email: string;
  phone: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
  terms: string;
  status: InvoiceStatus;
};

export function invoiceTotal(invoice: Pick<Invoice, "items" | "tax" | "discount">) {
  const subtotal = invoice.items.reduce((sum, it) => sum + it.qty * it.rate, 0);
  return subtotal + subtotal * (invoice.tax / 100) - subtotal * (invoice.discount / 100);
}