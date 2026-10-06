import { NextRequest } from "next/server";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { storePdfResponse } from "./store-pdf-response";

export async function GET(request: NextRequest) {
  const client = getServerSideImplicitClient();

  return storePdfResponse(request.nextUrl.searchParams.get("file"), (fileId) =>
    client.Files.Get(fileId).then(
      ({ data }) => data,
      () => undefined,
    ),
  );
}
