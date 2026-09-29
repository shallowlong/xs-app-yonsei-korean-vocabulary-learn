# 方案：接入 AI 协作规范 + Element Plus 重构 + 可配置语音引擎

日期：2026-09-29
状态：已实施

## 背景与问题

项目首版为纯 Vue 3 + Vite 的轻量单页应用，结构扁平（`src/` 下直接放 `db.js` /
`tts.js` / `progress.js` / `meta.js`），存在三类问题：

1. **缺工程规范**：无 AI 协作规范、无 CI 门禁、无知识库与方案文档归档机制，
   多方协作时容易各写各的、规范随项目演进而腐烂
2. **结构与技术栈未定型**：手写按钮/卡片/进度条/单选，样式集中在单个 `main.css`；
   无状态管理库，进度与设置各写一套 localStorage 逻辑
3. **发音能力写死**：仅支持浏览器内置语音，且混在页面里无法切换或配置；
   页面还残留了大量与"学词"无关的信息

## 技术方案

### 1. 接入规范脚手架（`ai-dev-conventions-scaffold`）

用 `init.js` 一次性落地：`AGENTS.md`（唯一权威规范）+ `CLAUDE.md` /
`.github/copilot-instructions.md` 兼容入口 + `.agents`/`.claude` skill 双副本 +
`ci/` 五个零依赖校验脚本 + `.github/workflows/ci.yml` + `docs/designs/_template` +
各 agent 规范合并副本（`.codebuddy` / `.trae` / `.cursor` / `.claude`）。
落地后按本项目实际填写 `AGENTS.md` §1/§2/§4/§6/§9 并启用 `PATH-CHECK`。

### 2. 结构改造（对齐 `xs-app-nte` 的分层）

`src/` 按职责分层，并设置 `@` 别名：

| 新目录          | 承接的旧文件 / 新职责                                                     |
| --------------- | ------------------------------------------------------------------------- |
| `api/`          | `db.js` → `api/vocabulary.js`（SQL 唯一入口，新增批量 ID 查询与全库统计） |
| `stores/`       | `progress.js`（改为 Pinia）+ 新增 `settings.js`（引擎与显示偏好）         |
| `utils/`        | 新增 `storage.js`（schema 版本 + 容错 + 防抖 + 导出）                     |
| `utils/speech/` | `tts.js` 拆成 `index.js`（调度）+ `webSpeech.js` + `urlSpeech.js`         |
| `data/`         | `meta.js` → `labels.js`；新增 `engines.js`、`appMeta.js`、`copyright.js`  |
| `composables/`  | 新增 `useVocabulary.js`（加载样板）、`useSpeech.js`（播放态与错误）       |
| `router/`       | 路由表从 `main.js` 抽出，加懒加载与标题维护                               |
| `styles/`       | `main.css` → `tokens.css`（令牌）+ `app.css`（Element 覆盖 + 骨架）       |

### 3. Element Plus + Pinia

- 全量引入 Element Plus 2 + `zhCn` 语言包，样式按「Element 主题 → 设计令牌 → 项目覆盖」三层加载
- 交互控件改用 Element 组件（`el-card` / `el-progress` / `el-tag` / `el-radio-group` /
  `el-switch` / `el-slider` / `el-select` / `el-skeleton` / `el-empty` / `el-alert`），
  覆盖样式集中改 CSS 变量，避免 `!important`
- 不引入 `@element-plus/icons-vue`：喇叭图标用内联 SVG 组件（`SpeakIcon.vue`）

### 4. 可配置语音引擎（核心新增）

配置驱动的三层结构，新增引擎只改 `src/data/engines.js`：

| 引擎            | kind        | 离线 | 实现                                          |
| --------------- | ----------- | ---- | --------------------------------------------- |
| 浏览器内置语音  | `webspeech` | 是   | Web Speech API，可挑系统语音、调速、调音高    |
| Google 翻译语音 | `url`       | 否   | URL 模板 + `<audio>` 播放（不受跨域读取限制） |
| 自定义语音服务  | `url`       | 否   | 用户填模板，可接入自建 edge-tts / Piper 服务  |

新增设置页（`/settings`）集中管理引擎参数、显示偏好、进度管理与关于信息。

### 5. UI 精简

- 首页去掉 hero 宣传文案，直接进入册次选择
- 学习页移除常驻统计大卡与冗余链接，改为一行文字概览
- 词源、词典依据、复核状态收进 `el-collapse`，由设置项 `showEtymology`（默认关）控制
- 英文释义可关（`showEnglish`），只留中文时更专注
- 与教材出版方无关的声明移至设置页「关于」，页脚仅保留合规必需的署名

## 影响范围

- **新增**：`AGENTS.md`、`ci/`、`docs/`、`.agents/`、`.claude/`、`.codebuddy/`、
  `.trae/`、`.cursor/`、`.github/`、`src/{api,stores,utils,composables,data,router}/`、
  `src/views/SettingsView.vue`、`src/components/{AppShell,AppFooter,SpeakIcon}.vue`
- **改写**：`src/main.js`、`src/App.vue`、`vite.config.js`、`package.json`、
  三个业务视图、`src/styles/`
- **删除**：`src/{db,tts,progress,meta}.js`、`src/styles/main.css`、
  `src/views/ChapterView.vue`、`src/components/ProgressBar.vue`
- **行为变化**：存储键由 `xs-korean-learn:progress:v1` 改为 `korean-learn:progress:v1`
  （旧进度不迁移，属首版未发布阶段的破坏性变更）
- **不改**：`scripts/build-db.py` 的数据语义、词条内容、许可结构

## 可复用资源

- 上游脚手架自带的 `ci/` 脚本、`docs/designs/_template/`、各 agent 规范合并副本 —— 直接沿用
- `xs-app-nte` 已验证的模式：`@` 别名 + `__APP_VERSION__` 注入、`utils/storage.js`
  的 schema 版本与防抖、`AppShell` 布局、tokens/app 双层样式、Element 变量覆盖
- 既有的 `scripts/build-db.py` 与 sql.js alias 兼容处理（见 `AGENTS.md` §9）

## 需同步文档

- [x] `AGENTS.md`（§1/§2/§4/§5/§6/§9 + `PATH-CHECK`）
- [x] `docs/knowledge/`（README / architecture / data-model / speech-engines / sources-and-license）
- [x] `README.md`（技术栈、结构、语音引擎、使用步骤）
- [x] `.gitignore`（新增运行期生成物与本地验证产物）
- [ ] `CHANGELOG.md`（首次发版前补，见 `AGENTS.md` §8）
