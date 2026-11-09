import { test } from "node:test"
import assert from "node:assert/strict"
import { bumpOf, raisedBump } from "./changeset.mjs"

const changeset = (bumps, body = "Regenerate from the upstream spec.") =>
  `---\n${Object.entries(bumps)
    .map(([name, bump]) => `"${name}": ${bump}`)
    .join("\n")}\n---\n\n${body}\n`

test("bumpOf reads the bump from the frontmatter", () => {
  assert.equal(
    bumpOf(changeset({ "@epcc-sdk/commerce-extensions": "minor" })),
    "minor",
  )
})

test("bumpOf takes the highest bump when the changeset lists several packages", () => {
  assert.equal(
    bumpOf(
      changeset({
        "@epcc-sdk/a": "patch",
        "@epcc-sdk/b": "major",
        "@epcc-sdk/c": "minor",
      }),
    ),
    "major",
  )
})

test("bumpOf is null for text that has no frontmatter bump", () => {
  assert.equal(bumpOf("Just a note.\n"), null)
  assert.equal(bumpOf(""), null)
})

test("a bump someone raised above the computed one is kept", () => {
  const existing = changeset(
    { "@epcc-sdk/commerce-extensions": "minor" },
    "**Breaking.** The types get stricter.",
  )
  assert.equal(raisedBump(existing, "patch"), "minor")
})

test("a bump equal to the computed one is not a raise", () => {
  assert.equal(
    raisedBump(
      changeset({ "@epcc-sdk/commerce-extensions": "minor" }),
      "minor",
    ),
    null,
  )
})

test("a bump below the computed one is not a raise; the run may raise it", () => {
  assert.equal(
    raisedBump(
      changeset({ "@epcc-sdk/commerce-extensions": "patch" }),
      "minor",
    ),
    null,
  )
})

test("a changeset without a bump is never a raise", () => {
  assert.equal(raisedBump("", "patch"), null)
})
