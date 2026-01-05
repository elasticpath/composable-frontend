"use client";

import { Dialog } from "@headlessui/react";

interface IPDFIFrameProps {
  url: string;
  filename?: string;
  onClose: () => void;
}

const PDFIFrame = ({ url, filename, onClose }: IPDFIFrameProps) => {
  return (
    <Dialog
      open={url !== null}
      onClose={onClose}
      className="relative z-10"
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pt-16">
        {/* Modal Container */}
        <div className="relative h-[90vh] w-[90vw] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section with Close Button */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-gray-100 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-700">
              {filename || "PDF Viewer"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
              aria-label="Close PDF Viewer"
            >
              Close
            </button>
          </div>

          {/* PDF Viewer */}
          <iframe
            src={url}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PDFIFrame;
