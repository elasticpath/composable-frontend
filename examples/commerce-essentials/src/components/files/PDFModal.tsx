"use client";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef } from "react";

interface IPDFModalProps {
  url: string;
  filename?: string;
  onClose: () => void;
}
/*
 * This code is build on pdf-js which has issues working within a Next.js environment.
 * - https://stackoverflow.com/questions/78121846/how-to-get-pdfjs-dist-working-with-next-js-14
 * - https://github.com/vercel/next.js/issues/65406#issuecomment-2295783162
 * 
 * The most straightforward approach was just to copy the minified worker script to be served from
 * the public folder. Obviously this is not ideal but it works for now. It appears that Next.js v15
 * has a fix for this issue.
 * 
 * If the iframe alternate approach is acceptable then the public worker script support can be removed.
 *
 */
const PDFModal = ({ url, filename, onClose }: IPDFModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      if (!canvasRef.current) return;

      // Initialize PDF.js
      // @ts-ignore
      //await import("pdfjs-dist/build/pdf.worker.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/pdf.worker.min.mjs";
      try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(
          `/pdf?url=${encodeURI(url)}&filename=${encodeURI(filename ?? "pdf-viewer")}`,
        );
        const pdf = await loadingTask.promise;

        // Get the first page
        const page = await pdf.getPage(1);

        // Prepare canvas for rendering
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Set scale for better resolution
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPDF();
  }, [url, filename]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative h-[90vh] w-[90vw] bg-white p-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-10 top-4 text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
        <div className="h-[85vh] overflow-auto p-4">
          <canvas ref={canvasRef} className="mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default PDFModal;
