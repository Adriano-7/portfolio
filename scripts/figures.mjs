// Converts case-study figures to webp (max 1600px wide). Usage: node scripts/figures.mjs <srcDir>
import sharp from "sharp";
import path from "node:path";
const srcDir = process.argv[2];
const figs = [
  ["llm-negotiation/winrate", "thesis-winrate.png"],
  ["llm-negotiation/self-refine", "thesis-selfrefine.jpg"],
  ["llm-negotiation/team", "thesis-team.png"],
  ["imbalance-synthetic-data/methodology", "synth-methodology.jpg"],
  ["politeness-nlp/embeddings", "nlp-happy.png"],
  ["politeness-nlp/f1-vs-time", "nlp-f1time.png"],
  ["chess-digital-twin/task1", "cv-task1.png"],
  ["chess-digital-twin/task3", "cv-task3.png"],
  ["deepfake/dataset", "df-dataset.png"],
  ["deepfake/generated", "df-epoch1500.png"],
];
for (const [out, file] of figs) {
  await sharp(path.join(srcDir, file)).flatten({ background: "#fff" })
    .resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 })
    .toFile(path.join("public/projects", out + ".webp"));
  console.log("ok", out);
}
