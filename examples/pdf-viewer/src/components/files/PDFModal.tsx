"use client";

import { Dialog } from "@headlessui/react";
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs`;

interface PDFReactModalProps {
  url: string;
  filename?: string;
  onClose: () => void;
}

const PDFModal = ({ url, filename, onClose }: PDFReactModalProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [page, setPage] = useState(1);

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 flex items-center justify-center p-6">
        <Dialog.Panel className="flex h-[90vh] w-[90vw] flex-col rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h2 className="font-medium truncate">
              {filename ?? "PDF Viewer"}
            </h2>
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          {/* Viewer */}
          <div className="flex-1 overflow-auto p-4">
            <Document
              // file={url}
              file={`/api/pdf-proxy?url=${encodeURIComponent(url)}`}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPage(1);
              }}
              loading={<p>Loading PDF…</p>}
              error={<p>Failed to load PDF</p>}
            >
              <Page
                pageNumber={page}
                width={900}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          </div>

          {/* Footer controls */}
          {numPages && (
            <div className="flex items-center justify-center gap-4 border-t py-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm">
                {page} / {numPages}
              </span>

              <button
                disabled={page >= numPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PDFModal;
