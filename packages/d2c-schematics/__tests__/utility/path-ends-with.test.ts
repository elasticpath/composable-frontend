import { pathEndsWith } from "../../utility/path-ends-with"
import { Path } from "@angular-devkit/core"

describe("pathEndsWith", () => {
  it("pathEndsWith should return true when one of the provided ends matches the path", () => {
    const path: Path = "/test/path/abc" as Path
    const ends = ["abc", "def"]
    expect(pathEndsWith(path, ends)).toEqual(true)
  })

  it("pathEndsWith should return true when the single end provided matches the path end", () => {
    const path: Path = "/test/path/abc" as Path
    const ends = "abc"
    expect(pathEndsWith(path, ends)).toEqual(true)
  })

  it("pathEndsWith should return false when one of the provided ends does not match the path", () => {
    const path: Path = "/test/path/abc" as Path
    const ends = ["def", "ghi"]
    expect(pathEndsWith(path, ends)).toEqual(false)
  })
})
