# 执行计划：版本管理、页脚瘦身、语音配置收敛与标题更名

日期：2026-09-29

## 1. 版本管理

- [x] `package.json` 版本号 `0.1.0` → `1.0.0`
- [x] 确认 `preversion` 钩子已接 `npm run verify`（沿用既有机制，无需新脚本）
- [x] 新增 `CHANGELOG.md`（`## 1.0.0` 非空章节，含新增能力与许可说明）
- [x] 更新 `docs/knowledge/README.md` 的 `VERSION: version=1.0.0` 事实标注

## 2. 页脚瘦身

- [x] `src/data/copyright.js` 的 `PROJECT` 增加 `holder: "奚叔2099"` 与 `years: "2025-2026"`
- [x] `src/components/AppFooter.vue` 重写为仅 `© {years} {holder} · v{version}`
- [x] `app.css` 的 `.footer` 改居中对齐，移除 `.footer .row`
- [x] `AGENTS.md` §9 更新页脚条款（页脚只放版权与版本；署名改由设置页「关于」等承担）

## 3. 语音配置收敛

- [x] 新建 `src/utils/speech.js`（合并 webSpeech + 韩语过滤，导出 `PRIMARY_LANG` / `isSupported` /
      `waitForVoices` / `listKoreanVoices` / `hasKoreanVoice` / `speak` / `stop`）
- [x] 删除 `src/utils/speech/`（`index.js` / `webSpeech.js` / `urlSpeech.js`）与 `src/data/engines.js`
- [x] `src/stores/settings.js` 移除 `engineId` / `customUrlTemplate`（`migrate()` 容错丢弃）
- [x] `src/composables/useSpeech.js` 改为 `supported` 判定 + 内置语音参数
- [x] `src/views/SettingsView.vue` 重写：合并为「语音引擎配置」（语速 / 音高 / 韩语语音 / 试听）
- [x] `src/views/StudyView.vue` 不可用提示改为浏览器能力提示
- [x] `app.css` 删除引擎选项相关样式

## 4. 网站更名

- [x] `src/data/appMeta.js`：`APP_NAME = "延世韩国语词汇发音练习"`、`APP_TAGLINE` 调整为册次与词条数
- [x] `index.html` `<title>` 同步

## 5. 页脚贴底修复

- [x] 定位根因：`app.css` 缺 `#app` flex 布局，`.main` 用硬编码 `calc(100vh - var(--appbar-h) - 92px)` 估算
- [x] 恢复 `#app { display:flex; flex-direction:column; min-height:100vh }` 并令 `.main { flex: 1 }`
- [x] `vite.config.js` 增加 `strictPort: true`（避免端口占用时静默换端口，与本项目固定 8100 的约定冲突）

## 6. 文档同步

- [x] `docs/knowledge/speech.md`（新建，替代 `speech-engines.md`）并更新知识库索引
- [x] `docs/knowledge/architecture.md`（目录树 / 数据流 / SYMBOL / 引用）
- [x] `docs/knowledge/{data-model,sources-and-license}.md` 措辞
- [x] `AGENTS.md`（§1 / §2 / §6 / §9）+ 重新同步并格式化各 agent 副本
- [x] `README.md` 全面同步
- [x] 本方案三件套

## 7. 验证

- [x] `npm run check:kb` 曾捕获 `version` 事实不一致（0.1.0 vs 1.0.0），修正后通过
- [x] `npm run verify` 全通过（format:check + build + check:spec / check:skill / check:deps / check:kb）
- [x] Edge 无头验证五项需求（详见 `checklist.md`）
- [x] 结果记录到 `checklist.md`
