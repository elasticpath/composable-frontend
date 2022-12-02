const parseCookie = (str: string): Record<string, string> =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v, index) => {
      return {
        ...acc,
        ...(index == 0
          ? {
              value: decodeURIComponent(v[1].trim()),
              name: decodeURIComponent(v[0].trim()),
            }
          : {
              [decodeURIComponent(v[0].trim())]: decodeURIComponent(
                v[1].trim()
              ),
            }),
      };
    }, {} as Record<string, string>);

export const parseCookies = (
  values: string[]
): Record<string, Record<string, string>> => {
  return values.reduce((acc, val) => {
    const parsed = parseCookie(val);

    return { ...acc, [parsed["name"]]: parsed };
  }, {});
};
