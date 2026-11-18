// Mini-webserver zonder afhankelijkheden:  node scripts/server.mjs  ->  http://localhost:8080
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../app/", import.meta.url));
const PORT = process.env.PORT || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };

createServer(async (req, res) => {
  let pad = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  if (pad.endsWith("/")) pad += "index.html";
  try {
    const data = await readFile(join(ROOT, pad));
    res.writeHead(200, { "Content-Type": TYPES[extname(pad)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("Niet gevonden");
  }
}).listen(PORT, () => console.log(`Vogeldex draait op http://localhost:${PORT}`));
