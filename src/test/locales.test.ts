import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../locales");
const keys = (o: unknown, p = ""): string[] =>
  o && typeof o === "object" && !Array.isArray(o)
    ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
    : [p];
const load = (f: string) => JSON.parse(readFileSync(f, "utf8"));

describe("translations", () => {
  for (const lang of ["en", "pt"]) {
    it(`es.json and ${lang}.json have the same keys`, () => {
      expect(keys(load(join(root, `${lang}.json`))).sort()).toEqual(keys(load(join(root, "es.json"))).sort());
    });
  }
  const files = existsSync(join(root, "es")) ? readdirSync(join(root, "es")) : [];
  for (const f of files) {
    for (const lang of ["en", "pt"]) {
      it(`${f} exists in ${lang} with the same keys`, () => {
        expect(existsSync(join(root, lang, f))).toBe(true);
        expect(keys(load(join(root, lang, f))).sort()).toEqual(keys(load(join(root, "es", f))).sort());
      });
    }
  }
});
