import { ReactNode, Suspense } from "react";
import { Inter } from "next/font/google";
import { getStoreInitialState } from "../../lib/get-store-initial-state";
import { Providers } from "../providers";
import Header from "../../components/header/Header";
import { Toaster } from "../../components/toast/toaster";
import Footer from "../../components/footer/Footer";
import { createElasticPathClient } from "../../lib/create-elastic-path-client";
import { GoogleAnalytics } from "@next/third-parties/google";
import { cookies } from "next/headers";
import { ConsentBanner } from "../../components/consent-banner/ConsentBanner";
import { CONSENT_COOKIE_NAME } from "../../lib/visitor/consent-cookie";

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
  const client = await createElasticPathClient();
  const initialState = await getStoreInitialState(client);
  const consentAnswered = (await cookies()).has(CONSENT_COOKIE_NAME);

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
        <ConsentBanner answered={consentAnswered} />
        {process.env.NEXT_PUBLIC_GA_ID && (
          // requires google analytics id in .env
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
