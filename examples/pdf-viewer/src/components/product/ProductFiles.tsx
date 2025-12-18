"use client";

import PDFFiles, { PDFDisplayStyle } from "../files/PDFFiles";
import { JSX } from "react";

interface IProductFilesProps {
  files: any[];
  pdfDisplayStyle: PDFDisplayStyle;
}

const ProductFiles = ({
  files,
  pdfDisplayStyle,
}: IProductFilesProps): JSX.Element => {
  const pdfFiles = files.filter((file) => file.mime_type === "application/pdf");

  return (
    <div className="mt-4">
      {pdfFiles.length > 0 && (
        <>
          <h3 className="mb-2 text-base font-medium uppercase text-gray-800 lg:text-lg">
            Reference Material
          </h3>
          <PDFFiles files={pdfFiles} pdfDisplayStyle={pdfDisplayStyle} />
        </>
      )}
    </div>
  );
};

export default ProductFiles;
