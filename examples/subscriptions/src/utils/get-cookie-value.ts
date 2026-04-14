export function getCookieValue(name: string): string | undefined {
    if (typeof document === "undefined") return undefined
    const cookieString = document.cookie
    const cookies = cookieString
        .split("; ")
        .reduce<Record<string, string>>((acc, cookie) => {
            const [key, ...v] = cookie.split("=")
            acc[key] = decodeURIComponent(v.join("="))
            return acc
        }, {})
    return cookies[name]
}
