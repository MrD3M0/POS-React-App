import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import tailwindcss from "@tailwindcss/vite";

const require = createRequire(import.meta.url);
const esToolkitRoot = path.dirname(require.resolve("es-toolkit/package.json"));

// recharts imports these `es-toolkit/compat/*` subpaths, which es-toolkit only
// ships as CJS. Its CJS sources use variable names that collide with the dev
// optimizer's interop helpers (`require_isUnsafeProperty` etc.), producing a
// broken `var require_isUnsafeProperty = require_isUnsafeProperty()` shim in
// the optimized bundle ("require_isUnsafeProperty is not a function"). Point
// each subpath at its ESM twin via a tiny shim that also `default`-exports the
// function (recharts default-imports these modules).
const ESM_COMPAT_ALIASES: Record<string, string> = {
  get: "object/get.mjs",
  isPlainObject: "predicate/isPlainObject.mjs",
  last: "array/last.mjs",
  maxBy: "math/maxBy.mjs",
  minBy: "math/minBy.mjs",
  omit: "object/omit.mjs",
  range: "math/range.mjs",
  sortBy: "array/sortBy.mjs",
  sumBy: "math/sumBy.mjs",
  throttle: "function/throttle.mjs",
  uniqBy: "array/uniqBy.mjs",
};

const shimDir = path.join(esToolkitRoot, "compat-esm-shims");
fs.mkdirSync(shimDir, { recursive: true });
for (const [name, rel] of Object.entries(ESM_COMPAT_ALIASES)) {
  const target = path.join(esToolkitRoot, "dist", "compat", rel);
  fs.writeFileSync(
    path.join(shimDir, `${name}.mjs`),
    `import { ${name} } from ${JSON.stringify(target)};\nexport default ${name};\nexport { ${name} };\n`,
  );
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      ...Object.entries(ESM_COMPAT_ALIASES).map(([name]) => ({
        find: `es-toolkit/compat/${name}`,
        replacement: path.join(shimDir, `${name}.mjs`),
      })),
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
