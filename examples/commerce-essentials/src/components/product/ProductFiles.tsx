import { File } from "@elasticpath/js-sdk";
import DownloadLink from "../files/DownloadLink";
import PDFFiles, { PDFDisplayStyle } from "../files/PDFFiles";

interface IProductFilesProps {
  files: File[];
  pdfDisplayStyle: PDFDisplayStyle;
}

const ProductFiles = ({
  files,
  pdfDisplayStyle,
}: IProductFilesProps): JSX.Element => {
  const pdfFiles = files.filter((file) => file.mime_type === "application/pdf");
  const otherFiles = files.filter(
    (file) => file.mime_type !== "application/pdf",
  );
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
      {otherFiles.length > 0 && (
        <>
          <h3 className="mb-2 text-base font-medium uppercase text-gray-800 lg:text-lg">
            Downloads
          </h3>
          {otherFiles.map((file) => {
            return (
              <DownloadLink
                key={file.id}
                href={file.link.href}
                filename={file.file_name ?? file.link.href}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default ProductFiles;
