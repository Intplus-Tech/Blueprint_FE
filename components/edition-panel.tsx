"use client";

import { useRef, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/api-client";

type Currency = { code: string; symbol: string; flag: string };

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CHF", symbol: "F", flag: "🇨🇭" },
  { code: "CNY", symbol: "¥", flag: "🇨🇳" },
  { code: "MKN", symbol: "$", flag: "🇲🇰" },
  { code: "BTC", symbol: "₿", flag: "🟠" },
];

const DEFAULT_TERMS =
  "Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.";

/**
 * Branding + defaults used when generating invoices (logo, company info,
 * default signature, currency). Uploads are backed by the backend and the
 * panel reflects only real uploaded asset URLs.
 */
export function EditionPanel() {
  const [isotype, setIsotype] = useState<string | null>(null);
  const [logotype, setLogotype] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("BRIX Agency");
  const [address, setAddress] = useState("Pablo Alto, San Francisco, CA 94109, United States of America");
  const [taxNumber, setTaxNumber] = useState("12345 6789 US0001");

  const [web, setWeb] = useState("www.brixagency.com");
  const [email, setEmail] = useState("contact@brixagency.com");
  const [phone, setPhone] = useState("0802 - 879 - 0102");
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  const [currencySymbol, setCurrencySymbol] = useState("₦");
  const [currencyCode, setCurrencyCode] = useState("NGN");
  const [saved, setSaved] = useState(false);

  const isotypeInput = useRef<HTMLInputElement>(null);
  const logotypeInput = useRef<HTMLInputElement>(null);
  const signatureInput = useRef<HTMLInputElement>(null);

  function selectCurrency(currency: Currency) {
    setCurrencySymbol(currency.symbol);
    setCurrencyCode(currency.code);
  }

  function handleSave() {
    console.log("Saving edition panel settings", {
      isotype,
      logotype,
      signature,
      companyName,
      address,
      taxNumber,
      web,
      email,
      phone,
      terms,
      currencySymbol,
      currencyCode,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 rounded-md bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-white">
          <Pencil className="h-3 w-3" />
        </span>
        Edition Panel
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <Card title="Brand">
          <ImageField
            label="Isotype"
            imageUrl={isotype}
            onChangeClick={() => isotypeInput.current?.click()}
            placeholder={<Dots />}
          />
          <input
            ref={isotypeInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                const result = await uploadFile(file, { type: "brand" });
                const uploadedUrl =
                  (result as any)?.url ??
                  (result as any)?.secure_url ??
                  (result as any)?.fileUrl ??
                  (result as any)?.data?.url ??
                  (result as any)?.data?.secure_url ??
                  (result as any)?.data?.fileUrl ??
                  (typeof result === "string" ? result : null);

                setIsotype(uploadedUrl ?? null);
              } catch (error) {
                console.error("Failed to upload isotype:", error);
                setIsotype(null);
              }
            }}
          />

          <ImageField
            label="Logotype"
            imageUrl={logotype}
            onChangeClick={() => logotypeInput.current?.click()}
            placeholder={
              <span className="flex items-center gap-1.5 text-lg font-bold text-gray-800">
                <Dots small />
                brix
              </span>
            }
          />
          <input
            ref={logotypeInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                const result = await uploadFile(file, { type: "brand" });
                const uploadedUrl =
                  (result as any)?.url ??
                  (result as any)?.secure_url ??
                  (result as any)?.fileUrl ??
                  (result as any)?.data?.url ??
                  (result as any)?.data?.secure_url ??
                  (result as any)?.data?.fileUrl ??
                  (typeof result === "string" ? result : null);

                setLogotype(uploadedUrl ?? null);
              } catch (error) {
                console.error("Failed to upload logotype:", error);
                setLogotype(null);
              }
            }}
          />
        </Card>

        {/* Invoice information */}
        <Card title="Invoice information">
          <Field label="Name/Company">
            <TextInput value={companyName} onChange={setCompanyName} />
          </Field>
          <Field label="Address">
            <TextArea value={address} onChange={setAddress} rows={3} />
          </Field>
          <Field label="Tax Number">
            <TextInput value={taxNumber} onChange={setTaxNumber} />
          </Field>
          <ImageField
            label="Signature"
            imageUrl={signature}
            onChangeClick={() => signatureInput.current?.click()}
            placeholder={<span className="text-xs text-gray-300">Upload signature</span>}
            tall
          />
          <input
            ref={signatureInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                const result = await uploadFile(file, { type: "brand" });
                const uploadedUrl =
                  (result as any)?.url ??
                  (result as any)?.secure_url ??
                  (result as any)?.fileUrl ??
                  (result as any)?.data?.url ??
                  (result as any)?.data?.secure_url ??
                  (result as any)?.data?.fileUrl ??
                  (typeof result === "string" ? result : null);

                setSignature(uploadedUrl ?? null);
              } catch (error) {
                console.error("Failed to upload signature:", error);
                setSignature(null);
              }
            }}
          />
        </Card>

        {/* Company information */}
        <Card title="Company information">
          <Field label="Web">
            <TextInput value={web} onChange={setWeb} />
          </Field>
          <Field label="Email">
            <TextInput value={email} onChange={setEmail} type="email" />
          </Field>
          <Field label="Number Phone">
            <TextInput value={phone} onChange={setPhone} />
          </Field>
          <Field label="Terms & Conditions">
            <TextArea value={terms} onChange={setTerms} rows={5} />
          </Field>
        </Card>

        {/* Other information */}
        <Card title="Other information">
          <Field label="Currency Symbol">
            <TextInput value={currencySymbol} onChange={setCurrencySymbol} />
          </Field>
          <Field label="Currency Code">
            <TextInput value={currencyCode} onChange={setCurrencyCode} />
          </Field>
          <div className="space-y-1.5">
            <Label>Currencys</Label>
            <div className="flex flex-wrap gap-1.5">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => selectCurrency(c)}
                  className={cn(
                    "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
                    currencyCode === c.code
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span>{c.flag}</span>
                  {c.code} {c.symbol}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        <Button type="button" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
}

function TextArea({ value, onChange, rows }: { value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
}

function ImageField({
  label,
  imageUrl,
  onChangeClick,
  placeholder,
  tall,
}: {
  label: string;
  imageUrl: string | null;
  onChangeClick: () => void;
  placeholder: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button type="button" onClick={onChangeClick} className="text-xs font-medium text-brand-600 hover:text-brand-700">
          Change
        </button>
      </div>
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-gray-200 bg-gray-50",
          tall ? "h-20" : "h-16"
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          placeholder
        )}
      </div>
    </div>
  );
}

function Dots({ small }: { small?: boolean }) {
  const colors = ["bg-red-500", "bg-blue-500", "bg-blue-400", "bg-red-400", "bg-blue-600", "bg-red-300"];
  return (
    <div className={cn("grid grid-cols-3 gap-0.5", small ? "h-3 w-3" : "h-6 w-6")}>
      {colors.map((c, i) => (
        <span key={i} className={cn("rounded-full", c, small ? "h-0.5 w-0.5" : "h-1.5 w-1.5")} />
      ))}
    </div>
  );
}
