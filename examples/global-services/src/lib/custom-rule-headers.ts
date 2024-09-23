import { isEmptyObj } from "./is-empty-object";

export function resolveEpccCustomRuleHeaders():
  | { "EP-Context-Tag"?: string; "EP-Channel"?: string }
  | undefined {
  const { epContextTag, epChannel } = {
    epContextTag: process.env.NEXT_PUBLIC_CONTEXT_TAG,
    epChannel: process.env.NEXT_PUBLIC_CHANNEL,
  };

  const headers = {
    ...(epContextTag ? { "EP-Context-Tag": epContextTag } : {}),
    ...(epChannel ? { "EP-Channel": epChannel } : {}),
  };

  return isEmptyObj(headers) ? undefined : headers;
}
