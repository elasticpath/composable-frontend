import MainLayout from "../components/layouts/MainLayout";
import { GetLayoutFn } from "../pages/_app";

export const getMainLayout: GetLayoutFn = (page, ctx) => {
  return <MainLayout nav={ctx?.nav}>{page}</MainLayout>;
};
