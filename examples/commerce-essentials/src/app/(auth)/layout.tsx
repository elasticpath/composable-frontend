import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { getStoreInitialState } from "../../lib/get-store-initial-state";
import { getServerSideImplicitClient } from "../../lib/epcc-server-side-implicit-client";
import { Providers } from "../providers";
import clsx from "clsx";

const { SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const client = getServerSideImplicitClient();
  const initialState = await getStoreInitialState(client);

  return (
    <html lang="en" className={clsx(inter.variable, "h-full bg-white")}>
      <body className="h-full">
        {/* headless ui needs this div - https://github.com/tailwindlabs/headlessui/issues/2752#issuecomment-1745272229 */}
        <div className="h-full">
          <Providers initialState={initialState}>
            <main className="h-full">{children}</main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
