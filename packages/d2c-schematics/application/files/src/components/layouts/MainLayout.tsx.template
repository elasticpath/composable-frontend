import Header from "../header/Header";
import Footer from "../footer/Footer";
import type { ReactNode } from "react";
import type { NavigationNode } from "../../lib/build-site-navigation";
import { Toaster } from "../toast/toaster";
import Head from "next/head";
export const MAIN_LAYOUT_TITLE = "D2C Starter Kit";

interface IMainLayout {
  nav?: NavigationNode[];
  children: ReactNode;
}

const MainLayout = ({ nav = [], children }: IMainLayout): JSX.Element => {
  return (
    <>
      <Head>
        <title>{MAIN_LAYOUT_TITLE}</title>
        <meta
          name="description"
          content="D2C Starter Kit - a store front starter for Elastic Path Commerce Cloud"
        />
      </Head>
      <Toaster />
      <Header nav={nav} />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
