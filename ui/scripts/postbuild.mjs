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

// 2. Make _next, brand, audio, and sample_docs asset references relative in root and nested HTML files
// so the bundle works both at https://gmascagni.github.io/airgap/ and at root /
const rootHtmlFiles = ["index.html", "404.html"];
for (const file of rootHtmlFiles) {
  const filePath = path.join(uiOutDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/(href|src)="\/_next\//g, '$1="./_next/');
    content = content.replace(/(href|src)="\/brand\//g, '$1="./brand/');
    content = content.replace(/(href|src)="\/audio\//g, '$1="./audio/');
    content = content.replace(/(href|src)="\/sample_docs\//g, '$1="./sample_docs/');
    fs.writeFileSync(filePath, content, "utf8");
  }
}

const nestedHtmlFiles = [
  path.join("app", "index.html"),
  path.join("noc", "index.html"),
  path.join("appliances", "index.html"),
  path.join("demo", "index.html"),
  path.join("404", "index.html"),
];
for (const relPath of nestedHtmlFiles) {
  const filePath = path.join(uiOutDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/(href|src)="\/_next\//g, '$1="../_next/');
    content = content.replace(/(href|src)="\/brand\//g, '$1="../brand/');
    content = content.replace(/(href|src)="\/audio\//g, '$1="../audio/');
    content = content.replace(/(href|src)="\/sample_docs\//g, '$1="../sample_docs/');
    fs.writeFileSync(filePath, content, "utf8");
  }
}

// 3. Sync static bundle in-place to repository root /out and /docs (preserving open server directory handles)
for (const targetDir of [rootOutDir, rootDocsDir]) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(uiOutDir, targetDir, { recursive: true, force: true });
}

console.log(
  "Postbuild complete: synced static export (including /app, /noc, /demo, and /appliances) to /ui/out, /out, and /docs with relative assets and .nojekyll."
);
