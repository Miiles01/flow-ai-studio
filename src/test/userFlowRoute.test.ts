import { describe, expect, it } from "vitest";
import { flowRoute } from "@/lib/userFlow";

describe("flowRoute", () => {
  it("counts public pages in every language", () => {
    expect(flowRoute("/en/afiliados")).toBe("affiliates");
    expect(flowRoute("/pt")).toBe("home");
  });
  it("counts the log-in page as its own stage", () => {
    expect(flowRoute("/login")).toBe("login");
    expect(flowRoute("/es/login")).toBe("login");
  });
  it("counts opened boards, templates and programs as their Explore section", () => {
    expect(flowRoute("/boards/abc")).toBe("boards");
    expect(flowRoute("/studio/minimalist")).toBe("studio");
    expect(flowRoute("/programs/123")).toBe("programs");
  });
  it("does not count board invitations or unknown pages", () => {
    expect(flowRoute("/boards/join/tok")).toBeNull();
    expect(flowRoute("/admin")).toBeNull();
  });
});
