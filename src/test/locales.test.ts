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
  it("es.json and en.json have the same keys", () => {
    expect(keys(load(join(root, "en.json"))).sort()).toEqual(keys(load(join(root, "es.json"))).sort());
  });
  const files = existsSync(join(root, "es")) ? readdirSync(join(root, "es")) : [];
  for (const f of files) {
    it(`${f} exists in English with the same keys`, () => {
      expect(existsSync(join(root, "en", f))).toBe(true);
      expect(keys(load(join(root, "en", f))).sort()).toEqual(keys(load(join(root, "es", f))).sort());
    });
  }
});
