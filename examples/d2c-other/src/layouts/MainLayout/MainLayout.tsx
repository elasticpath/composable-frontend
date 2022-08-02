import Footer from "../../components/Footer/Footer";
import MainMenu from "../../components/MainMenu/MainMenu";

import type { ReactNode } from "react";

interface IMainLayout {
  children: ReactNode;
}

const MainLayout = ({ children }: IMainLayout): JSX.Element => {
  return (
    <div>
      <MainMenu />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
