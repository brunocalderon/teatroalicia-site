import { describe, expect, it } from "vitest"

import {
  findCmsPathCollisions,
  findDuplicateCmsPaths,
} from "@/lib/cms-page-path-collisions"

describe("cms page path collisions", () => {
  it("detects overlap with reserved form paths", () => {
    const collisions = findCmsPathCollisions(
      ["/info/nosotros", "/contacto"],
      ["/contacto", "/i/murano"],
    )
    expect(collisions).toEqual(["/contacto"])
  })

  it("detects duplicate cms paths", () => {
    const duplicates = findDuplicateCmsPaths([
      "/info/a",
      "/info/a/",
      "/info/b",
    ])
    expect(duplicates).toEqual(["/info/a"])
  })
})