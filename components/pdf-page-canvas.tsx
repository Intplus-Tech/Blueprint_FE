"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PdfDocumentProxy } from "@/lib/pdf";

/**
 * Renders one page of a pdfjs document into a <canvas>, scaled to fit
 * `targetWidth` CSS pixels (rendered at 2x for sharpness on retina).
 */
export function PdfPageCanvas({
  pdfDoc,
  pageNumber,
  targetWidth,
  className,
}: {
  pdfDoc: PdfDocumentProxy;
  pageNumber: number;
  targetWidth: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);

    async function render() {
      const page = await pdfDoc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = (targetWidth / baseViewport.width) * 2;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas || !active) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport }).promise;
      if (active) setReady(true);
    }

    render().catch((err) => console.error("PDF render failed:", err));

    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber, targetWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "h-auto w-full rounded-sm bg-white transition-opacity duration-150",
        ready ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}