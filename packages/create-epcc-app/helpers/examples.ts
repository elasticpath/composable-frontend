/* eslint-disable import/no-extraneous-dependencies */
import got from "got"
import tar from "tar"
import { Stream } from "stream"
import { promisify } from "util"

const pipeline = promisify(Stream.pipeline)

const getGithubTokenHeadersTemp = (token: string) => ({
  "User-Agent": "field123",
  Authorization: `token ${token}`,
})

export type RepoInfo = {
  username: string
  name: string
  branch: string
  filePath: string
}

export async function isUrlOk(url: string, token?: string): Promise<boolean> {
  const res = await got
    .head(url, {
      ...(token ? { headers: getGithubTokenHeadersTemp(token) } : {}),
    })
    .catch((e) => e)
  return res.statusCode === 200
}

export async function getLatestMainSha(token?: string): Promise<string> {
  const res = await got
    .get("https://api.github.com/repos/field123/epcc-d2c/commits/main", {
      ...(token ? { headers: getGithubTokenHeadersTemp(token) } : {}),
    })
    .catch((e) => e)

  return JSON.parse(res.body).sha
}

export async function getRepoInfo(
  url: URL,
  examplePath?: string
): Promise<RepoInfo | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split("/")
  const filePath = examplePath ? examplePath.replace(/^\//, "") : file.join("/")

  // Support repos whose entire purpose is to be a Elastic Path Storefront example, e.g.
  // https://github.com/:username/:my-cool-ep-storefront-example-repo-name.
  if (t === undefined) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`
    ).catch((e) => e)
    if (infoResponse.statusCode !== 200) {
      return
    }
    const info = JSON.parse(infoResponse.body)
    return { username, name, branch: info["default_branch"], filePath }
  }

  // If examplePath is available, the branch name takes the entire path
  const branch = examplePath
    ? `${_branch}/${file.join("/")}`.replace(new RegExp(`/${filePath}|/$`), "")
    : _branch

  if (username && name && branch && t === "tree") {
    return { username, name, branch, filePath }
  }
}

export function hasRepo({
  username,
  name,
  branch,
  filePath,
}: RepoInfo): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`
  const packagePath = `${filePath ? `/${filePath}` : ""}/package.json`

  return isUrlOk(contentsUrl + packagePath + `?ref=${branch}`)
}

export function existsInRepo(
  nameOrUrl: string,
  token?: string
): Promise<boolean> {
  try {
    const url = new URL(nameOrUrl)
    return isUrlOk(url.href, token)
  } catch {
    return isUrlOk(
      `https://api.github.com/repos/field123/epcc-d2c/contents/examples/${encodeURIComponent(
        nameOrUrl
      )}`,
      token
    )
  }
}

export function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo
): Promise<void> {
  return pipeline(
    got.stream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
    ),
    tar.extract(
      { cwd: root, strip: filePath ? filePath.split("/").length + 1 : 1 },
      [`${name}-${branch.replace(/\//g, "-")}${filePath ? `/${filePath}` : ""}`]
    )
  )
}

export function downloadAndExtractExample(
  root: string,
  name: string,
  sha: string,
  token?: string
): Promise<void> {
  if (name === "__internal-testing-retry") {
    throw new Error("This is an internal example for testing the CLI.")
  }

  const stream = got.stream(
    `https://api.github.com/repos/field123/epcc-d2c/tarball/${sha}`,
    {
      ...(token ? { headers: getGithubTokenHeadersTemp(token) } : {}),
      followRedirect: true,
    }
  )

  return pipeline(
    stream,
    tar.extract({ cwd: root, strip: 3 }, [
      `field123-epcc-d2c-${sha}/examples/${name}`,
    ])
  )
}
