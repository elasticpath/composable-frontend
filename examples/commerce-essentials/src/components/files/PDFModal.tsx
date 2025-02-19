"use client";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs";
import { useEffect, useRef, useState } from "react";

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
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: "auto",
    height: "auto",
  });

  useEffect(() => {
    const loadPDF = async () => {
      if (!viewerContainerRef.current) return;
      // Initialize PDF.js
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          // @ts-ignore
          setDimensions({ width, height });
        }
      });
      try {
        const eventBus = new pdfjsViewer.EventBus();
        const pdfViewer = new pdfjsViewer.PDFViewer({
          container: viewerContainerRef.current,
          eventBus,
        });
        eventBus.on("pagesinit", function () {
          // We can use pdfViewer now, e.g. let's change default scale.
          pdfViewer.currentScaleValue = "page-width";
        });

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(
          `/pdf?url=${encodeURI(url)}&filename=${encodeURI(filename ?? "pdf-viewer")}`,
        );
        const pdf = await loadingTask.promise;
        pdfViewer.setDocument(pdf);
        if (viewerContainerRef.current) {
          resizeObserver.observe(viewerContainerRef.current);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
      return () => {
        if (viewerContainerRef.current) {
          resizeObserver.unobserve(viewerContainerRef.current);
        }
      };
    };

    loadPDF();
  }, [url, filename]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={outerContainerRef}
        className="relative bg-white p-4 shadow-lg rounded-lg overflow-auto"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxHeight: "90vh", // Prevents it from going beyond the screen
          maxWidth: "90vw", // Ensures it doesn't go beyond the screen width
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-10 top-auto text-gray-600 hover:text-gray-800 z-10"
        >
          Close
        </button>
        <div
          ref={viewerContainerRef}
          className="absolute top-10 left-0"
        >
          <div id="viewer" className="pdfViewer"></div>
        </div>
      </div>
    </div>
  );
};

export default PDFModal;
