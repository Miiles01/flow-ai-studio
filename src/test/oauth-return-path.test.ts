import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "@/lib/oauth-return-path";

describe("OAuth return path", () => {
  it("preserves the authorization request through login", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=request-123#approve")).toBe("/.lovable/oauth/consent?authorization_id=request-123#approve");
  });
  it.each(["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/\n/outside.invalid"])("rejects external or unsafe return path %s", (path) => {
    expect(oauthReturnPath(path)).toBe("/");
  });
});