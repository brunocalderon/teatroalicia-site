import { describe, expect, it } from "vitest"

import {
  CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH,
  contentSecurityPolicyHeaderLineLength,
} from "@/lib/content-security-policy"

describe("content-security-policy", () => {
  it("fits Cloudflare Pages _headers line limit", () => {
    expect(contentSecurityPolicyHeaderLineLength()).toBeLessThanOrEqual(
      CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH,
    )
  })
})