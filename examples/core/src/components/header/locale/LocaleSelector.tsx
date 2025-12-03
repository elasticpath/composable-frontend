"use client";
import { useRouter, usePathname } from "next/navigation";
import { SUPPORTED_LOCALES } from "src/lib/i18n";

export const LocaleSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <select id='locale_select' value={currentLocale} onChange={handleChange} className="border p-1 w-[6rem] rounded">
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
};