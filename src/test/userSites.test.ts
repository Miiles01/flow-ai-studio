import { describe, expect, it } from "vitest";
import { canCreateSite, normalizePageSlug, publicSiteUrl, validateSiteFile } from "@/lib/userSites";

describe("páginas de usuarios", () => {
  it("Free permite solo 1 página", () => {
    expect(canCreateSite(false, 0)).toBe(true);
    expect(canCreateSite(false, 1)).toBe(false);
  });
  it("Pro permite páginas ilimitadas", () => {
    expect(canCreateSite(true, 25)).toBe(true);
  });
  it("publica en wearemiiles.com/<usuario>", () => {
    expect(publicSiteUrl("manuel")).toBe("https://wearemiiles.com/manuel/");
  });
  it("rechaza rutas que salen de la carpeta", () => {
    expect(() => validateSiteFile("../secreto.html", "utf8")).toThrow();
    expect(() => validateSiteFile(".env", "utf8")).toThrow();
  });
  it("rechaza tipos no permitidos y binarios sin base64", () => {
    expect(() => validateSiteFile("script.php", "utf8")).toThrow();
    expect(() => validateSiteFile("img/foto.jpg", "utf8")).toThrow();
    expect(validateSiteFile("img/foto.jpg", "base64")).toBe("image/jpeg");
  });
  it("rechaza nombres de página inválidos", () => {
    expect(() => normalizePageSlug("mi página!")).toThrow();
    expect(normalizePageSlug("Tienda")).toBe("tienda");
  });
});
