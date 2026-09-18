// Builds the header avatar + favicons from content/profile.jpg.
// Run: node scripts/avatar.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const src = "content/profile.jpg";
// Square crop around the face (source is 991x1321).
const crop = { left: 262, top: 346, width: 490, height: 490 };

const circle = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
  );

const square = (size) => sharp(src).extract(crop).resize(size, size, { kernel: "lanczos3" });

const round = (size) =>
  square(size).composite([{ input: circle(size), blend: "dest-in" }]).png({ compressionLevel: 9 });

await mkdir("public", { recursive: true });
await square(192).webp({ quality: 82 }).toFile("public/avatar.webp");
await round(64).toFile("app/icon.png");
await round(180).toFile("app/apple-icon.png");

console.log("avatar + icons written");
