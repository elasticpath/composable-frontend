import { useQuery } from "@tanstack/react-query";
import { countries } from "../lib/all-countries";

export function useCountries() {
  const storeCountries = useQuery({
    queryKey: ["countries"],
    queryFn: () => {
      /**
       * Replace these with your own source for supported delivery countries. You can also fetch them from the API.
       */
      return countries;
    },
  });

  return {
    ...storeCountries,
  };
}
