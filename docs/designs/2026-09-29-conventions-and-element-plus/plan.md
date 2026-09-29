# 执行计划：接入规范 + Element Plus 重构 + 可配置语音引擎

日期：2026-09-29

## 1. 接入规范脚手架

- [x] 运行 `node init.js ../xs-app-korean-learn --name "韩语词汇发音学习" --checklist korean-learn-dev`
- [x] 确认生成物：`AGENTS.md`、`CLAUDE.md`、`.github/*`、`ci/*`、`.agents`/`.claude` skill 双副本、`docs/designs/_template`
- [x] 填写 `AGENTS.md` §1（职责边界）、§2（技术栈与目录映射）
- [x] 填写 `AGENTS.md` §4（编码规范 + Element Plus 约定）
- [x] 填写 `AGENTS.md` §5（验证门禁：`npm run build`、`npm run check`、Edge 无头验证）
- [x] 填写 `AGENTS.md` §6（架构总览 + 数据流）
- [x] 填写 `AGENTS.md` §9（关键约束与易踩的坑）
- [x] 启用 `PATH-CHECK: src/ scripts/ docs/ ci/`
- [x] `package.json` 增加 `check`（聚合四项校验）与 `verify`（build + check）

## 2. 基础层

- [x] `vite.config.js`：`@` 别名、`__APP_VERSION__` 注入、保留 sql.js alias、`chunkSizeWarningLimit`
- [x] `src/styles/tokens.css`：设计令牌（品牌色 / 语义色 / 尺度 / 字体 / 布局）
- [x] `src/styles/app.css`：Element 变量映射 + 布局骨架 + 组件微调
- [x] `src/main.js`：注册 Pinia / 路由 / Element Plus（`zhCn`）+ 三层样式

## 3. 数据与工具层

- [x] `src/data/engines.js`：引擎注册表（3 个内置引擎 + `SUPPORTED_LANGS` + `getEngineById`）
- [x] `src/data/labels.js`：词源 / 词性 / 复核 / 册次映射 + `originTagType`
- [x] `src/data/appMeta.js`：名称与构建时注入的版本号
- [x] `src/data/copyright.js`：数据集与项目版权署名单一来源
- [x] `src/utils/storage.js`：`readJSON` / `writeJSON` / `removeJSON` / `createDebouncedSaver` / `downloadJSON`
- [x] `src/utils/speech/webSpeech.js`：内置引擎（语音列表等待、播放态、cancel 竞态处理）
- [x] `src/utils/speech/urlSpeech.js`：URL 模板引擎（`buildUrl` / `isTemplateReady` / `<audio>` 播放）
- [x] `src/utils/speech/index.js`：调度 + `checkEngine`

## 4. 状态与访问层

- [x] `src/stores/progress.js`：标记（`known`/`learning`/`starred`）、`countMarks`、`reset`、导出
- [x] `src/stores/settings.js`：引擎参数与显示偏好，含范围校验的容错迁移
- [x] `src/api/vocabulary.js`：sql.js 初始化（三种导出形态兼容）+ 业务查询 + `getCorpusStats`
- [x] `src/composables/useVocabulary.js`：`useDbData` / `useVolumeOverview` / `useChapterOverview` / `useChapterEntries`
- [x] `src/composables/useSpeech.js`：朗读、播放态、错误、卸载时停止

## 5. UI 层

- [x] `src/router/index.js`：hash 路由 + 懒加载 + `afterEach` 设置标题
- [x] `src/App.vue` + `src/components/AppShell.vue` + `AppFooter.vue`
- [x] `src/components/SpeakIcon.vue`：内联 SVG 图标
- [x] `src/components/WordCard.vue`：精简版单词卡（自测遮罩、可选英文、折叠词源）
- [x] `src/views/HomeView.vue`：册次网格（`el-card` + `el-progress`）
- [x] `src/views/VolumeView.vue`：课次列表
- [x] `src/views/StudyView.vue`：浏览/自测、键盘导航、标记、自动发音
- [x] `src/views/SettingsView.vue`：引擎选择与参数、显示偏好、进度管理、关于
- [x] 删除被取代的旧文件（`db.js`/`tts.js`/`progress.js`/`meta.js`/`main.css`/`ChapterView.vue`/`ProgressBar.vue`）

## 6. 文档

- [x] `docs/knowledge/README.md`（入口 + 可机检事实标注规范）
- [x] `docs/knowledge/architecture.md`（分层、数据流、关键约束）
- [x] `docs/knowledge/data-model.md`（表结构、字段、查询入口、限制）
- [x] `docs/knowledge/speech-engines.md`（引擎协议与扩展步骤）
- [x] `docs/knowledge/sources-and-license.md`（双许可与合规红线）
- [x] 本方案三件套（spec / plan / checklist）
- [x] `README.md` 重写（技术栈、结构、引擎、步骤、许可）
- [x] `.gitignore` 更新

## 7. 验证

- [x] `npm run build` 通过
- [x] `npm run check` 四项校验通过
- [x] Edge 无头验证：首页 / 册次页 / 学习页 / 设置页，控制台 0 错误
- [x] 交互验证：引擎切换持久化、进度标记持久化、自测遮罩与揭示、键盘翻词
- [x] 结果记录到 `checklist.md`
