/**
 * Client-only PDF.js loader utilities.
 *
 * We intentionally avoid browser persistence for uploaded document data.
 * The frontend now uploads directly to the backend and loads document content
 * from backend-backed endpoints instead of sessionStorage.
 */

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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