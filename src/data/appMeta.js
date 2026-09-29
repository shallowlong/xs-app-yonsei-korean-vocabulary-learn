/**
 * 应用元信息 —— 名称与版本号的单一事实来源。
 * 版本号来自构建时注入的 `__APP_VERSION__`（源自 package.json），组件禁止硬编码。
 */

/** vite.config.js 的 define 注入；dev 或未注入时回退 "dev" */
export const APP_VERSION =
	typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

export const APP_NAME = "延世韩国语词汇发音练习";

export const APP_TAGLINE = "1–6 册 · 韩 / 中 / 英 · 4,445 条词条";
