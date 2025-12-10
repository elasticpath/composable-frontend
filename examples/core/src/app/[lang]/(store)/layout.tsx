import { ReactNode, Suspense } from "react";
import localFont from "next/font/local";
import { getStoreInitialState } from "src/lib/get-store-initial-state";
import { Providers } from "../providers";
import Header from "src/components/header/Header";
import { Toaster } from "src/components/toast/toaster";
import Footer from "src/components/footer/Footer";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";

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

const inter = localFont({
  src: "../../../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  display: "swap",
  variable: "--font-inter",
});

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang;

  const client = await createElasticPathClient();
  const initialState = await getStoreInitialState(client);

  return (
    <html lang={lang || "en"} className={inter.variable}>
      <body>
        {/* headless ui needs this div - https://github.com/tailwindlabs/headlessui/issues/2752#issuecomment-1745272229 */}
        <div>
          <Providers initialState={initialState}>
            <Header lang={lang} />
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
