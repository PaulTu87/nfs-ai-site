import { build } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function prerender() {
  await build({
    root,
    logLevel: "warn",
    build: {
      ssr: "src/entry-server.jsx",
      outDir: "dist/server",
      rollupOptions: { output: { format: "esm" } },
    },
  });

  // pathToFileURL is required on Linux (Vercel) for absolute path imports
  const serverEntry = pathToFileURL(resolve(root, "dist/server/entry-server.js")).href;
  const { render } = await import(serverEntry);
  const appHtml = render("/");

  let template = readFileSync(resolve(root, "dist/index.html"), "utf-8");
  // Greedy [\s\S]* matches up to the LAST </div> in the file,
  // which is the root div's closing tag (no </div> appears after it in the template).
  const output = template.replace(
    /<div id="root">[\s\S]*<\/div>/,
    `<div id="root">${appHtml}</div>`
  );
  writeFileSync(resolve(root, "dist/index.html"), output);

  console.log("Prerendering complete — dist/index.html updated.");
}

prerender().catch((err) => {
  console.error("Prerender failed (static HTML fallback will be used):", err.message);
  // Exit 0 so Vercel deploys with the static fallback in index.html
  process.exit(0);
});
