import { Inter } from "next/font/google";
import { ReactNode, Suspense } from "react";
import "../styles/globals.css";
import Header from "../components/header/Header";
import { getStoreContext } from "../lib/get-store-context";
import { getServerSideImplicitClient } from "../lib/epcc-server-side-implicit-client";
import { Providers } from "./providers";
import { Toaster } from "../components/toast/toaster";
import Footer from "../components/footer/Footer";

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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const client = getServerSideImplicitClient();
  const storeContext = await getStoreContext(client);

  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* headless ui needs this div - https://github.com/tailwindlabs/headlessui/issues/2752#issuecomment-1745272229 */}
        <div>
          <Providers store={storeContext}>
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
