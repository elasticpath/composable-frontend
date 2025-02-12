import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename");

  if (url) {
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: new Headers({
          "content-disposition": `attachment; filename="${filename}"`,
          "content-type": "application/pdf",
          "content-length": String(buffer.byteLength),
        }),
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { type: "error", message: "System error" },
        {
          status: 400,
        },
      );
    }
  } else {
    return NextResponse.json(
      { type: "error", message: "Missing url" },
      {
        status: 400,
      },
    );
  }
}