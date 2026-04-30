import { describe, it, expect } from "vitest"
import { mergeIncludedResources } from "./included-merge"

describe("mergeIncludedResources", () => {
  it("resolves a single main_image relationship onto the hit when include is configured", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
        },
      },
    ]
    const included = {
      main_images: [
        {
          id: "img-1",
          type: "file",
          link: { href: "https://cdn.example.com/img-1.jpg" },
          mime_type: "image/jpeg",
        },
      ],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: ["main_image"],
    })

    expect(result.hits[0]).toMatchObject({
      objectID: "p1",
      main_image: {
        id: "img-1",
        link: { href: "https://cdn.example.com/img-1.jpg" },
      },
    })
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("resolves a files relationship as an ordered array of records", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          files: {
            data: [
              { id: "f-3", type: "file" },
              { id: "f-1", type: "file" },
              { id: "f-2", type: "file" },
            ],
          },
        },
      },
    ]
    const included = {
      // Deliberately stored out of order — the merged array should follow
      // the relationships.files.data order, not the included order.
      files: [
        { id: "f-1", link: { href: "https://cdn.example.com/f-1.jpg" } },
        { id: "f-2", link: { href: "https://cdn.example.com/f-2.jpg" } },
        { id: "f-3", link: { href: "https://cdn.example.com/f-3.jpg" } },
      ],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: ["files"],
    })

    expect(result.hits[0].files).toEqual([
      { id: "f-3", link: { href: "https://cdn.example.com/f-3.jpg" } },
      { id: "f-1", link: { href: "https://cdn.example.com/f-1.jpg" } },
      { id: "f-2", link: { href: "https://cdn.example.com/f-2.jpg" } },
    ])
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("leaves the resolved field undefined when a relationship references an id not present in included", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-missing", type: "main_image" } },
        },
      },
    ]
    const included = {
      main_images: [
        { id: "img-other", link: { href: "https://cdn.example.com/other.jpg" } },
      ],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: ["main_image"],
    })

    expect(result.hits[0]).not.toHaveProperty("main_image")
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("filters out unresolved entries from an array resource without dropping the array entirely", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          files: {
            data: [
              { id: "f-present", type: "file" },
              { id: "f-missing", type: "file" },
            ],
          },
        },
      },
    ]
    const included = {
      files: [
        { id: "f-present", link: { href: "https://cdn.example.com/present.jpg" } },
      ],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: ["files"],
    })

    expect(result.hits[0].files).toEqual([
      { id: "f-present", link: { href: "https://cdn.example.com/present.jpg" } },
    ])
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("flags needsIncludedWarning when include was requested but the response has no included block", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
        },
      },
    ]

    const result = mergeIncludedResources({
      hits,
      included: undefined,
      includeRequested: ["main_image"],
    })

    expect(result.needsIncludedWarning).toBe(true)
    // Hits stay un-resolved; the merge couldn't do its job
    expect(result.hits[0]).not.toHaveProperty("main_image")
  })

  it("does not flag a warning when include was requested and the included block is present but empty for that resource", () => {
    // included exists at top level but the requested resource collection is
    // either missing or empty — that's a "no records matched" case (Q5 case 2),
    // not a "server didn't honour my include" case (Q5 case 1).
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
        },
      },
    ]

    const result = mergeIncludedResources({
      hits,
      included: {},
      includeRequested: ["main_image"],
    })

    expect(result.needsIncludedWarning).toBe(false)
    expect(result.hits[0]).not.toHaveProperty("main_image")
  })

  it("returns hits unchanged and does not flag a warning when includeRequested is undefined", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
        },
      },
    ]
    const included = {
      main_images: [{ id: "img-1", link: { href: "https://x" } }],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: undefined,
    })

    expect(result.hits[0]).not.toHaveProperty("main_image")
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("returns hits unchanged and does not flag a warning when includeRequested is an empty array", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
        },
      },
    ]
    const included = {
      main_images: [{ id: "img-1", link: { href: "https://x" } }],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: [],
    })

    expect(result.hits[0]).not.toHaveProperty("main_image")
    expect(result.needsIncludedWarning).toBe(false)
  })

  it("resolves multiple resource types in a single call", () => {
    const hits = [
      {
        objectID: "p1",
        relationships: {
          main_image: { data: { id: "img-1", type: "main_image" } },
          files: { data: [{ id: "f-1", type: "file" }] },
        },
      },
    ]
    const included = {
      main_images: [
        { id: "img-1", link: { href: "https://cdn/img.jpg" } },
      ],
      files: [{ id: "f-1", link: { href: "https://cdn/f-1.jpg" } }],
    }

    const result = mergeIncludedResources({
      hits,
      included,
      includeRequested: ["main_image", "files"],
    })

    expect(result.hits[0].main_image).toEqual({
      id: "img-1",
      link: { href: "https://cdn/img.jpg" },
    })
    expect(result.hits[0].files).toEqual([
      { id: "f-1", link: { href: "https://cdn/f-1.jpg" } },
    ])
  })

  it("does not mutate the input hit objects", () => {
    const inputHit = {
      objectID: "p1",
      _rawTypesenseHit: {
        document: {
          relationships: {
            main_image: { data: { id: "img-1", type: "main_image" } },
          },
        },
      },
      relationships: {
        main_image: { data: { id: "img-1", type: "main_image" } },
      },
    }
    const inputHitSnapshot = JSON.parse(JSON.stringify(inputHit))
    const included = {
      main_images: [
        { id: "img-1", link: { href: "https://cdn/img.jpg" } },
      ],
    }

    const result = mergeIncludedResources({
      hits: [inputHit],
      included,
      includeRequested: ["main_image"],
    })

    // Result has the merged field
    expect(result.hits[0].main_image).toBeDefined()
    // Input was not touched (in particular, _rawTypesenseHit stays clean)
    expect(inputHit).toEqual(inputHitSnapshot)
    expect(result.hits[0]).not.toBe(inputHit)
  })
})
