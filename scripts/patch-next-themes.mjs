/**
 * next-themes 0.4.6 injects an inline <script> that React 19 warns about on the client.
 * Skip rendering that script during client renders; it still runs from SSR HTML.
 * @see https://github.com/pacocoursey/next-themes/issues/387
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pkgDir = path.join(root, "node_modules", "next-themes", "dist");

const patches = [
  {
    file: "index.js",
    needle:
      "Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{let p=JSON.stringify([n,s,d,e,h,u,l,o]).slice(1,-1);return t.createElement(\"script\"",
    insert:
      "Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{if(typeof window!==\"undefined\")return null;let p=JSON.stringify([n,s,d,e,h,u,l,o]).slice(1,-1);return t.createElement(\"script\"",
  },
  {
    file: "index.mjs",
    needle:
      "_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{let p=JSON.stringify([s,i,a,e,h,l,u,m]).slice(1,-1);return t.createElement(\"script\"",
    insert:
      "_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{if(typeof window!==\"undefined\")return null;let p=JSON.stringify([s,i,a,e,h,l,u,m]).slice(1,-1);return t.createElement(\"script\"",
  },
];

for (const { file, needle, insert } of patches) {
  const fp = path.join(pkgDir, file);
  if (!fs.existsSync(fp)) {
    console.warn(`[patch-next-themes] skip: missing ${fp}`);
    continue;
  }
  let src = fs.readFileSync(fp, "utf8");
  if (src.includes('if(typeof window!=="undefined")return null;let p=JSON.stringify')) {
    continue;
  }
  if (!src.includes(needle)) {
    console.warn(
      `[patch-next-themes] skip ${file}: expected snippet not found (next-themes version changed?)`
    );
    continue;
  }
  src = src.replace(needle, insert);
  fs.writeFileSync(fp, src, "utf8");
  console.log(`[patch-next-themes] patched ${file}`);
}
