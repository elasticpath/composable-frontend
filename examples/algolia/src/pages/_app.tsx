import StoreNextJSProvider from "../lib/providers/store-provider";
import type { AppProps as NextAppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";
import "focus-visible/dist/focus-visible";
import "../styles/globals.css";
import { StoreContext } from "@elasticpath/react-shopper-hooks";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import { getMainLayout } from "../lib/get-main-layout";

// modified version - allows for custom pageProps type, falling back to 'any'
type AppProps<P = {}> = {
  pageProps: P;
  Component: NextPageWithLayout<P>;
} & Omit<NextAppProps<P>, "pageProps" | "Component">;

interface CustomAppProps {
  store: StoreContext | undefined;
}

export type GetLayoutFn<P> = (
  page: ReactElement,
  pageProps: P,
  storeContext?: StoreContext
) => ReactNode;

/**
 * Adds getLayout function as possible prop on Components
 */
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: GetLayoutFn<P>;
};

function MyApp({ Component, pageProps }: AppProps<CustomAppProps>) {
  const getLayout = Component.getLayout ?? getMainLayout;
  return (
    <ChakraProvider theme={theme}>
      <StoreNextJSProvider storeContext={pageProps.store}>
        {getLayout(<Component {...pageProps} />, pageProps, pageProps.store)}
      </StoreNextJSProvider>
    </ChakraProvider>
  );
}

export default MyApp;
