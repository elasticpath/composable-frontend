import { normalize, virtualFs } from "@angular-devkit/core"
import { Stats } from "fs"
import { HostSink, Tree } from "@angular-devkit/schematics"
import { NodeJsSyncHost } from "@angular-devkit/core/node"

export async function commitTree(
  host: virtualFs.Host<Stats>,
  tree: Tree,
  { force }: { force?: boolean } = {},
): Promise<void> {
  const sink = new HostSink(host, force)
  await sink
    .commit(tree)
    .toPromise()
    .catch((error) => {
      console.log("error", error)
      return error
    })
}

export function createScopedHost(workspaceRoot: string) {
  const root = normalize(workspaceRoot)

  return new virtualFs.ScopedHost(new NodeJsSyncHost(), root)
}
