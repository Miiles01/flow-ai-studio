import { describe, it, expect } from "vitest";
import { langOf, pickLang, isLang, SUPPORTED_LANGS } from "@/i18n";

describe("supported languages", () => {
  it("offers Spanish, English and Portuguese", () => {
    expect([...SUPPORTED_LANGS]).toEqual(["es", "en", "pt"]);
    expect(isLang("pt")).toBe(true);
    expect(isLang("fr")).toBe(false);
  });
  it("normalizes regional codes", () => {
    expect(langOf("pt-BR")).toBe("pt");
    expect(langOf("en-US")).toBe("en");
    expect(langOf("fr")).toBe("es");
  });
  it("uses Portuguese copy and falls back to Spanish when it is missing", () => {
    expect(pickLang({ es: "Ver más", en: "Show more", pt: "Ver mais" }, "pt")).toBe("Ver mais");
    expect(pickLang({ es: "Ver", en: "View" }, "pt")).toBe("Ver");
  });
});
