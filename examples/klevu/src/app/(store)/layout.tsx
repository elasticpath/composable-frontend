import { ReactNode, Suspense } from "react";
import { Inter } from "next/font/google";
import { getStoreInitialState } from "../../lib/get-store-initial-state";
import { getServerSideImplicitClient } from "../../lib/epcc-server-side-implicit-client";
import { Providers } from "../providers";
import Header from "../../components/header/Header";
import { Toaster } from "../../components/toast/toaster";
import Footer from "../../components/footer/Footer";

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

/**
 * Used to revalidate until the js-sdk supports passing of fetch options.
 * At that point we can be more intelligent about revalidation.
 */
export const revalidate = 300;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const client = getServerSideImplicitClient();
  const initialState = await getStoreInitialState(client);

  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* headless ui needs this div - https://github.com/tailwindlabs/headlessui/issues/2752#issuecomment-1745272229 */}
        <div>
          <Providers initialState={initialState}>
            <Header />
            <Toaster />
            <Suspense>
              <main>{children}</main>
            </Suspense>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
