import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

// 版本号单一事实来源：package.json（递增请用 `npm version`，见 AGENTS.md §8）
const pkg = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	// 相对路径产物，便于放到任意子目录 / 静态托管
	base: "./",
	define: {
		// 构建时注入版本号，避免把整个 package.json 打进产物
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			// sql.js 的 package.json `exports.browser` 指向 UMD 构建
			// （exports["Module"]，无 default 导出），会导致 Vite 的 ESM interop
			// 报 "does not provide an export named 'default'"。
			// 指向 classic dist 构建（含 module.exports.default）即可正常 interop。
			"sql.js": fileURLToPath(
				new URL(
					"./node_modules/sql.js/dist/sql-wasm.js",
					import.meta.url,
				),
			),
		},
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		// Element Plus 采用「全量引入」（见 src/main.js），产物约 1 MB（gzip 约 340 kB）。
		// 若日后需要瘦身：改用 unplugin-vue-components + ElementPlusResolver 按需引入（需新增 devDependency，见 AGENTS.md §9）。
		chunkSizeWarningLimit: 1200,
	},
	server: {
		// 开发服务固定端口；strictPort 让端口被占用时直接报错，
		// 避免 Vite 静默换端口导致实际访问地址与文档/约定不一致
		port: 8100,
		strictPort: true,
		host: true,
	},
});
