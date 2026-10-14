import { describe, it, expect, vi } from "vitest";
import JSZip from "jszip";
import { uploadStudioProject, studioThumbnail } from "@/lib/studioUpload";

vi.mock("@/hooks/useAdminAuth", () => ({ adminFetch: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { storage: { from: vi.fn() } } }));

async function archive(entries: Record<string, string>) {
  const zip = new JSZip();
  Object.entries(entries).forEach(([path, value]) => zip.file(path, value));
  // JSZip accepts ArrayBuffer in the browser and in the test environment.
  const buffer = await zip.generateAsync({ type: "arraybuffer" });
  return Object.assign(buffer, { size: buffer.byteLength, name: "project.zip" }) as unknown as File;
}

describe("Studio project validation", () => {
  it("requires the selected HTML entry", async () => {
    await expect(uploadStudioProject(await archive({ "repo/readme.md": "hello" }), "index.html", vi.fn())).rejects.toThrow("No encontramos index.html");
  });
  it("rejects unbuilt React entrypoints", async () => {
    await expect(uploadStudioProject(await archive({ "repo/index.html": '<script src="/src/main.tsx"></script>' }), "index.html", vi.fn())).rejects.toThrow("versión compilada");
  });
  it("rejects traversal even after ZIP normalizes paths", async () => {
    await expect(uploadStudioProject(await archive({ "../index.html": "hello" }), "index.html", vi.fn())).rejects.toThrow("rutas no seguras");
  });
  it("rejects oversized archives", async () => {
    await expect(uploadStudioProject({ size: 51 * 1024 * 1024 } as File, "index.html", vi.fn())).rejects.toThrow("50 MB");
  });
  it("rejects non-raster thumbnails", async () => {
    await expect(studioThumbnail(new File(["<svg/>"], "image.svg", { type: "image/svg+xml" }))).rejects.toThrow("PNG");
  });
});