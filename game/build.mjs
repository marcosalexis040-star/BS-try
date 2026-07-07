// Ensambla el Artifact autocontenido: React + Lucide (esbuild) + Tailwind + fuente embebida.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { buildSync } from "esbuild";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

// 1. JS: bundle minificado de React + app
buildSync({
  entryPoints: ["src/app.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: "dist/app.js",
  logLevel: "info",
});

// 2. CSS: Tailwind (preflight + utilidades) + sistema visual propio
run("npx @tailwindcss/cli -i src/styles.css -o dist/tw.css --minify");

// 3. HTML final (sin doctype/html/head/body: lo añade el publicador de Artifacts)
const font = readFileSync("lilita-latin.b64", "utf8").trim();
const floor = readFileSync("mine-floor.b64", "utf8").trim();
const css = readFileSync("dist/tw.css", "utf8")
  .replace("__LILITA_B64__", font)
  .replace("__FLOOR_B64__", floor);
let js = readFileSync("dist/app.js", "utf8").replace(/<\/script/gi, "<\\/script");

const html = `<title>Brawl Stars: Squad Battler</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`;

writeFileSync("dist/squad-battler.html", html);
console.log(`OK -> dist/squad-battler.html (${(html.length / 1024).toFixed(0)} KB)`);
