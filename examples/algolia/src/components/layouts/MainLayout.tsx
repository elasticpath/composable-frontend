import Header from "../header/Header";
import Footer from "../footer/Footer";
import type { ReactNode } from "react";
import type { NavigationNode } from "../../lib/build-site-navigation";
import { Toaster } from "../toast/toaster";

interface IMainLayout {
  nav?: NavigationNode[];
  children: ReactNode;
}

const MainLayout = ({ nav = [], children }: IMainLayout): JSX.Element => {
  return (
    <>
      <Toaster />
      <Header nav={nav} />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
