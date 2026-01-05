import { NextRequest } from "next/server";

// Allowed domains for PDF fetching - add your trusted domains here
const ALLOWED_DOMAINS = [
  "d1s4tacif4dym4.cloudfront.net",
  // Add other trusted domains as needed
  // 'your-cdn.com',
  // 'trusted-partner.com'
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Check if the hostname is in the allowed list
    return ALLOWED_DOMAINS.some(
      (domain) =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  // Validate URL against allowlist
  if (!isAllowedUrl(url)) {
    return new Response("URL not allowed", { status: 403 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(`Failed to fetch PDF: ${response.statusText}`, {
        status: response.status,
      });
    }

    const data = await response.arrayBuffer();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return new Response("Failed to fetch PDF", { status: 500 });
  }
}
