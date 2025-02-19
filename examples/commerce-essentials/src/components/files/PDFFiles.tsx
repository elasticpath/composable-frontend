import { File } from "@elasticpath/js-sdk";
import { useEffect, useState } from "react";
import PDFIFrame from "./PDFIFrame";
// import PDFModal from "./PDFModal";
import dynamic from "next/dynamic";
const PDFModal = dynamic(() => import("./PDFModal"), { ssr: false });

interface IPDFFilesProps {
  files: File[];
  pdfDisplayStyle: PDFDisplayStyle;
}

export enum PDFDisplayStyle {
  tab = "tab",
  iframe = "iframe",
  pdfJs = "pdfJs",
}
interface IPDF {
  url: string;
  filename?: string;
}

const PDFFiles = ({ files, pdfDisplayStyle }: IPDFFilesProps): JSX.Element => {
  const [selectedPdf, setSelectedPdf] = useState<IPDF | null>(null);

  const addPDFToolConfig = (url: string) => {
    return `${url}#toolbar=0&navpanes=0`;
  };

  const openPdf = (url: string) => {
    window.open(addPDFToolConfig(url), "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === "Escape") {
        setSelectedPdf(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSelectedPdf]);

  return (
    <div className="flex flex-col gap-2">
      {pdfDisplayStyle === PDFDisplayStyle.tab &&
        files.map((file) => (
          <button
            key={file.id}
            onClick={() => openPdf(`${file.link.href}`)}
            className="text-left text-blue-600 hover:underline"
          >
            {file.file_name}
          </button>
        ))}

      {(pdfDisplayStyle === PDFDisplayStyle.pdfJs ||
        pdfDisplayStyle === PDFDisplayStyle.iframe) &&
        files.map((file) => (
          <button
            key={file.id}
            onClick={() =>
              setSelectedPdf({
                url: addPDFToolConfig(file.link.href),
                filename: file.file_name,
              })
            }
            className="text-left text-blue-600 hover:underline"
          >
            {file.file_name}
          </button>
        ))}

      {pdfDisplayStyle === PDFDisplayStyle.pdfJs && selectedPdf && (
        <PDFModal
          url={selectedPdf.url}
          filename={selectedPdf.filename}
          onClose={() => setSelectedPdf(null)}
        />
      )}
      {pdfDisplayStyle === PDFDisplayStyle.iframe && selectedPdf && (
        <PDFIFrame
          url={selectedPdf.url}
          filename={selectedPdf.filename}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};

export default PDFFiles;
