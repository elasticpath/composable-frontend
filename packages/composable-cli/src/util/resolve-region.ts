export function resolveHostFromRegion(
  host: "eu-west" | "us-east"
): "https://euwest.api.elasticpath.com" | "https://useast.api.elasticpath.com" {
  switch (host) {
    case "eu-west":
      return "https://euwest.api.elasticpath.com"
    case "us-east":
      return "https://useast.api.elasticpath.com"
    default:
      return "https://euwest.api.elasticpath.com"
  }
}
