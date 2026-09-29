# Changelog

本文件记录本项目的版本变更。版本号由 `npm version` 管理（发版规范见 `AGENTS.md` §8）：
仅 fix/perf/style → patch，含 feat/refactor → minor，破坏性变更 → major。

## 1.0.0 — 2026-09-29

首个正式版本。

### 新增

- 《延世韩国语》1–6 册、60 课、4,445 条词条，按「册 → 课 → 单元」顺序学习
- 韩语 / 中文 / English 三语对照；英文释义与词源信息可按需显示或隐藏
- 发音使用**浏览器内置语音包**（Web Speech API），可调语速、音高，并可从系统韩语语音中选择音色
- 浏览 / 自测两种模式（自测先遮住释义，回忆后再揭示）
- 键盘快捷键：`←` / `→` 翻词，`空格` 重播或切换答案
- 学习进度标记（已掌握 / 学习中 / 收藏）与三级统计（课 / 册 / 全站），
  存于浏览器本地并支持导出 JSON 备份
- 词库以静态 SQLite 随站分发，前端用 sql.js（WebAssembly）查询，纯前端、可静态部署

### 说明

- 词汇数据来自 [Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary)
  v0.1.0，按 **CC BY-SA 3.0** 发布
- 本项目原创代码按 **MIT** 发布
- 与延世大学及其韩国语学堂无隶属、赞助或背书关系
