import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { buildSync } from "esbuild";

buildSync({
  entryPoints: ["src/states-test.jsx"], bundle: true, format: "iife",
  target: "es2020", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
  outfile: "dist/states.js", logLevel: "info",
});
execSync("npx @tailwindcss/cli -i src/styles.css -o dist/tw.css --minify", { stdio: "inherit" });

const font = readFileSync("lilita-latin.b64", "utf8").trim();
const floor = readFileSync("mine-floor.b64", "utf8").trim();
const css = readFileSync("dist/tw.css", "utf8").replace("__LILITA_B64__", font).replace("__FLOOR_B64__", floor);
const js = readFileSync("dist/states.js", "utf8");
writeFileSync("dist/states.html", `<!doctype html><meta charset="utf8"><style>${css}
body{background:#1a1330}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px}
.cell{background:#241a42;border:2px solid #3a2c5e;border-radius:14px;display:flex;flex-direction:column;
align-items:center;justify-content:flex-end;min-height:220px;padding:10px}
.cell .unit{position:relative;left:auto;top:auto;transform:none}
.lbl{font-family:var(--display);color:#ffe33e;font-size:.8rem;letter-spacing:.08em;margin-top:6px}
</style><div id="test-root"></div><script>${js}</script>`);
console.log("OK -> dist/states.html");
