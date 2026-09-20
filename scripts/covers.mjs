// Builds public/projects/<slug>/cover.webp (1280x800) and cover-sm.webp (640x400)
// from source figures. Usage: node scripts/covers.mjs <srcDir>
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const srcDir = process.argv[2];
if (!srcDir) throw new Error("usage: node scripts/covers.mjs <srcDir>");

// fit: "cover" crops to 16:10 (position = attention), "contain" letterboxes on `bg`.
const covers = [
  { slug: "llm-negotiation",          file: "thesis-winrate.png",   fit: "contain", bg: "#ffffff" },
  { slug: "imbalance-synthetic-data", file: "synth-methodology.jpg", fit: "contain", bg: "#ffffff" },
  { slug: "politeness-nlp",           file: "nlp-embeddings3d.png", fit: "cover" },
  { slug: "chess-digital-twin",       file: "cv-task3.png",         fit: "contain", bg: "#ffffff" },
  { slug: "deepfake",                 file: "df-dataset.png",       fit: "contain", bg: "#ffffff" },
];

for (const c of covers) {
  const out = path.join("public", "projects", c.slug);
  await mkdir(out, { recursive: true });
  let img = sharp(path.join(srcDir, c.file)).flatten({ background: "#ffffff" });
  if (c.trim) {
    const m = await img.metadata();
    img = img.extract({ left: c.trim, top: c.trim, width: m.width - 2 * c.trim, height: m.height - 2 * c.trim });
  }
  const base = img.resize({
    width: 1280, height: 800, fit: c.fit, position: sharp.strategy.attention,
    background: c.bg ?? "#ffffff", withoutEnlargement: false,
  });
  await base.clone().webp({ quality: 82 }).toFile(path.join(out, "cover.webp"));
  await base.clone().resize(640, 400).webp({ quality: 78 }).toFile(path.join(out, "cover-sm.webp"));
  console.log("ok", c.slug);
}
