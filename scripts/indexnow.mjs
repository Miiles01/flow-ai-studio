// Avisa a Bing, Yandex y otros buscadores (IndexNow) que hay URLs nuevas o cambiadas en miiles.app.
// Uso, después de publicar en Lovable:  node scripts/indexnow.mjs            (todas las del sitemap)
//                                       node scripts/indexnow.mjs <url> ...  (solo esas)
// La llave es el archivo .txt de 32 caracteres en public/ (debe estar publicado en miiles.app).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const keyFile = fs.readdirSync(path.join(root, "public")).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No hay llave de IndexNow en public/");
const key = keyFile.replace(".txt", "");
let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "miiles.app", key, keyLocation: `https://miiles.app/${keyFile}`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} · ${urls.length} URLs`);
