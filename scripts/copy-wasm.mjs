// Copy sql.js WebAssembly binary into the public directory so the app can load it at runtime.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "node_modules/sql.js/dist/sql-wasm.wasm");
const destDir = resolve(root, "public/data");
const dest = resolve(destDir, "sql-wasm.wasm");

if (!existsSync(src)) {
	console.error("sql.js wasm not found. Run `npm install` first.");
	process.exit(1);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("copied sql-wasm.wasm -> public/data/sql-wasm.wasm");
