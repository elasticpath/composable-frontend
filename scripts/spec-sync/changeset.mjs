const rank = { patch: 0, minor: 1, major: 2 }

export function bumpOf(changeset) {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(changeset)?.[1] ?? ""
  let highest = null
  for (const [, bump] of frontmatter.matchAll(
    /^"[^"]+":\s*(patch|minor|major)\s*$/gm,
  )) {
    if (highest === null || rank[bump] > rank[highest]) highest = bump
  }
  return highest
}

export function raisedBump(existingChangeset, computedBump) {
  const existing = bumpOf(existingChangeset)
  if (existing === null || rank[existing] <= rank[computedBump]) return null
  return existing
}
