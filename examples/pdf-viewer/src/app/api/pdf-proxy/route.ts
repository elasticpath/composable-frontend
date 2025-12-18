import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new Response("Missing URL", { status: 400 });

  const response = await fetch(url);
  const data = await response.arrayBuffer();

  return new Response(data, {
    headers: {
      'Content-Type': 'application/pdf',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
