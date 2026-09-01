/**
 * Client-only PDF.js loader + sessionStorage bridge.
 *
 * The uploaded PDF is handed from the landing page / dashboard upload modal to
 * the document viewer via sessionStorage as a base64 data URL.
 */

export const PDF_STORAGE_KEY = "bp_doc_pdf_data";
export const PDF_NAME_KEY = "bp_doc_pdf_name";

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function storePdfFile(file: File) {
  sessionStorage.setItem(PDF_NAME_KEY, file.name);
  if (file.type === "application/pdf") {
    return fileToDataUrl(file).then((dataUrl) => {
      sessionStorage.setItem(PDF_STORAGE_KEY, dataUrl);
    });
  }
  // Non-PDF upload: clear any previous PDF so the viewer waits for a real file.
  sessionStorage.removeItem(PDF_STORAGE_KEY);
  return Promise.resolve();
}

/** Dynamically imports pdfjs-dist (client-only) and configures its worker. */
export async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist" as any);
  // Self-hosted worker (copied to public/pdf.worker.min.mjs — see README) avoids
  // depending on an external CDN, which some hosts' CSP will block. Re-copy this
  // file from node_modules/pdfjs-dist/build/pdf.worker.min.mjs if you bump the
  // pdfjs-dist version in package.json.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

export type PdfDocumentProxy = Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]>;