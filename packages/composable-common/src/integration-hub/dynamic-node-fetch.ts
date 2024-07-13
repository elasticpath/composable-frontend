const _importDynamic = new Function("modulePath", "return import(modulePath)")

export const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic("node-fetch")
  return fetch(...args)
}
