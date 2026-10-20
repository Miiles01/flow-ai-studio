import { describe, expect, it } from "vitest";
import templates from "../data/studio-templates.json";

describe("Studio numeric identity", () => {
  it("assigns a distinct positive integer to each template", () => {
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) {
      expect(Number.isSafeInteger(template.template_number)).toBe(true);
      expect(template.template_number).toBeGreaterThan(0);
    }
    expect(new Set(templates.map((t) => t.template_number)).size).toBe(templates.length);
  });

  it("keeps existing version links mapped to their original numbers", () => {
    for (let number = 2; number <= 13; number++) {
      expect(templates.find((t) => t.slug === `portafolio-ugc-v${number}`)?.template_number).toBe(number);
    }
  });
});