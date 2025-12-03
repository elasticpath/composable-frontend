import { useParams } from "next/navigation";

export function useLocalePath(path: string) {
  const { lang } = useParams();
  return lang ? `/${lang}${path}` : path;
}
