import path from "path"

export function resolveD2CCollectionName(nodeEnv: string): string {
  if (nodeEnv === "development" || nodeEnv === "CI") {
    return path.resolve(__dirname, "../../../d2c-schematics/dist")
  }
  return "@elasticpath/d2c-schematics"
}
