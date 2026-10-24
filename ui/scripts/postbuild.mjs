import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiOutDir = path.resolve(__dirname, "..", "out");
const rootOutDir = path.resolve(__dirname, "..", "..", "out");
const rootDocsDir = path.resolve(__dirname, "..", "..", "docs");

if (!fs.existsSync(uiOutDir)) {
  console.error("Static export directory ui/out not found.");
  process.exit(1);
}

// 1. Add .nojekyll so GitHub Pages serves the _next directory
fs.writeFileSync(path.join(uiOutDir, ".nojekyll"), "");

// 2. Make _next asset references relative in HTML files so the bundle works
// both at https://gmascagni.github.io/airgap/ and at root /
const htmlFiles = ["index.html", "404.html"];
for (const file of htmlFiles) {
  const filePath = path.join(uiOutDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    const updated = content.replace(/(href|src)="\/_next\//g, '$1="./_next/');
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

// 3. Sync static bundle to repository root /out and /docs
for (const targetDir of [rootOutDir, rootDocsDir]) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.cpSync(uiOutDir, targetDir, { recursive: true });
}

console.log("Postbuild complete: synced static export to /ui/out, /out, and /docs with .nojekyll.");
