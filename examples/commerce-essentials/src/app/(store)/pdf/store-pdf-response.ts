export type StoreFile = {
  file_name?: string;
  mime_type: string;
  link: { href: string };
};

type LookupStoreFile = (fileId: string) => Promise<StoreFile | undefined>;

type FetchFile = (href: string) => Promise<Response>;

const PDF_MIME_TYPE = "application/pdf";

function headerSafeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\- ]/g, "_");
}

export async function storePdfResponse(
  fileId: string | null,
  lookupFile: LookupStoreFile,
  fetchFile: FetchFile = fetch,
): Promise<Response> {
  if (!fileId) {
    return Response.json(
      { type: "error", message: "Missing file id" },
      { status: 400 },
    );
  }

  const file = await lookupFile(fileId);

  if (!file || file.mime_type !== PDF_MIME_TYPE) {
    return Response.json(
      { type: "error", message: "No PDF with that file id" },
      { status: 404 },
    );
  }

  const fileResponse = await fetchFile(file.link.href).catch(() => undefined);

  if (!fileResponse?.ok) {
    return Response.json(
      { type: "error", message: "The PDF could not be fetched" },
      { status: 502 },
    );
  }

  const fileName = headerSafeFileName(file.file_name ?? "document.pdf");

  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      "content-type": PDF_MIME_TYPE,
      "content-disposition": `attachment; filename="${fileName}"`,
    },
  });
}
