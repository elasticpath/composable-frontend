import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryKeysFactory, UseQueryOptionsWrapper } from "src/lib/query-keys-factory";

const OIDC_QUERY_KEY = "authentications" as const;

export const oidcQueryKeys = queryKeysFactory(OIDC_QUERY_KEY);
type OIDCQueryKey = typeof oidcQueryKeys;

export function useAuthentication(
  options?: UseQueryOptionsWrapper<
    any,
    Error,
    ReturnType<OIDCQueryKey["list"]>
  >,
): Partial<any> & Omit<UseQueryResult<any, Error>, "data"> {

  const { data, ...rest } = useQuery({
    queryKey: oidcQueryKeys.list(),
    queryFn: async () => {
      const res = await fetch("/api/account-auth-settings");
      return res.json();
    },
    ...options,
  });
  
  return { ...data, ...rest } as const;
}
