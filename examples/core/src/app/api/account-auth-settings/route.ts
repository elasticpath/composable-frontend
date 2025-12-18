import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CREDENTIALS_COOKIE_NAME } from "src/lib/cookie-constants";

export async function GET() {
  const cookieStore = await cookies();
  const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);

  let accessToken: string | null = null;

  if (credentialsCookie?.value) {
    accessToken = JSON.parse(credentialsCookie.value).access_token;
  }

  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/settings/account-authentication`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}
