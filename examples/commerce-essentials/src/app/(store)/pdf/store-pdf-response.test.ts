import { describe, test, expect, vi } from "vitest";
import { storePdfResponse, type StoreFile } from "./store-pdf-response";

const pdfFile: StoreFile = {
  file_name: "spec-sheet.pdf",
  mime_type: "application/pdf",
  link: { href: "https://files.example.test/spec-sheet.pdf" },
};

const lookupReturning = (file: StoreFile | undefined) =>
  vi.fn(async (_fileId: string) => file);

const pdfBytes = new Uint8Array([37, 80, 68, 70]);

const fetchReturning = (response: Response) =>
  vi.fn(async (_input: string) => response);

describe("storePdfResponse", () => {
  test("rejects a request with no file id without looking anything up", async () => {
    const lookupFile = lookupReturning(pdfFile);
    const fetchFile = fetchReturning(new Response(pdfBytes));

    const response = await storePdfResponse(null, lookupFile, fetchFile);

    expect(response.status).toBe(400);
    expect(lookupFile).not.toHaveBeenCalled();
    expect(fetchFile).not.toHaveBeenCalled();
  });

  test("answers 404 and fetches nothing when the store has no file with that id", async () => {
    const fetchFile = fetchReturning(new Response(pdfBytes));

    const response = await storePdfResponse(
      "missing-file",
      lookupReturning(undefined),
      fetchFile,
    );

    expect(response.status).toBe(404);
    expect(fetchFile).not.toHaveBeenCalled();
  });

  test("answers 404 and fetches nothing when the store file is not a PDF", async () => {
    const fetchFile = fetchReturning(new Response(pdfBytes));

    const response = await storePdfResponse(
      "image-file",
      lookupReturning({ ...pdfFile, mime_type: "image/png" }),
      fetchFile,
    );

    expect(response.status).toBe(404);
    expect(fetchFile).not.toHaveBeenCalled();
  });

  test("fetches only the link the store holds for the file id", async () => {
    const lookupFile = lookupReturning(pdfFile);
    const fetchFile = fetchReturning(new Response(pdfBytes));

    await storePdfResponse("file-1", lookupFile, fetchFile);

    expect(lookupFile).toHaveBeenCalledWith("file-1");
    expect(fetchFile).toHaveBeenCalledWith(pdfFile.link.href);
  });

  test("streams the PDF as a download named after the store file", async () => {
    const response = await storePdfResponse(
      "file-1",
      lookupReturning(pdfFile),
      fetchReturning(new Response(pdfBytes)),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="spec-sheet.pdf"',
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdfBytes);
  });

  test("keeps quotes and line breaks in a file name out of the content-disposition header", async () => {
    const response = await storePdfResponse(
      "file-1",
      lookupReturning({ ...pdfFile, file_name: 'a"b\r\nSet-Cookie: x.pdf' }),
      fetchReturning(new Response(pdfBytes)),
    );

    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="a_b__Set-Cookie_ x.pdf"',
    );
  });

  test("answers 502 when the file host does not return the file", async () => {
    const response = await storePdfResponse(
      "file-1",
      lookupReturning(pdfFile),
      fetchReturning(new Response("gone", { status: 404 })),
    );

    expect(response.status).toBe(502);
  });

  test("answers 502 when the file host cannot be reached", async () => {
    const response = await storePdfResponse(
      "file-1",
      lookupReturning(pdfFile),
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    expect(response.status).toBe(502);
  });
});
