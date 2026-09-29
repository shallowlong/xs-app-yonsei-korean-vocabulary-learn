# 验证清单：对齐团队格式化与许可规范 + 标注数据来源

日期：2026-09-29

## 门禁校验

| 项             | 状态 | 命令/证据                                                                                       |
| -------------- | ---- | ----------------------------------------------------------------------------------------------- |
| 格式校验       | ✅   | `npm run format:check` → `All matched files use Prettier code style!`，且二次运行无变化（幂等） |
| 全量构建       | ✅   | `npm run build` → `✓ built in 5.46s`（1639 modules，无体积告警）                                |
| 规范引用检查   | ✅   | `npm run check:spec` → 章节引用 / 门禁措辞 / 路径存在性全部通过                                 |
| 执行清单同步   | ✅   | `npm run check:skill` → `.agents` 与 `.claude` 双副本逐字节一致                                 |
| 幽灵依赖检查   | ✅   | `npm run check:deps` → 未找到测试文件，跳过                                                     |
| 知识库事实核查 | ✅   | `npm run check:kb` → 知识库事实核查通过                                                         |
| 完整验证       | ✅   | `npm run verify`（format:check → build → check）整体通过                                        |
| 提交规范       | ⏳   | 未提交（遵循 §5 提交门禁：不自动提交）                                                          |

## 规范落地核验

| 项                                 | 状态 | 证据                                                                                                                            |
| ---------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `.editorconfig` 与团队公共配置一致 | ✅   | `indent_style = tab`、`indent_size = 4`、`end_of_line = lf`、`insert_final_newline = false`、`trim_trailing_whitespace = false` |
| `.prettierrc` 与团队公共配置一致   | ✅   | 8 项配置逐项一致（含 `objectWrap: "preserve"`，需 Prettier ≥ 3.5，实装 3.9.9）                                                  |
| `.prettierignore`                  | ✅   | 沿用团队公共配置的 `build/ logs/ coverage/ dist/`，补充 `package-lock.json`                                                     |
| 缩进已改为 Tab                     | ✅   | `sed -n '1,12p' src/views/HomeView.vue \| cat -A` 显示 `^I`；`grep -rlP "^\t" src/` 命中 26 个文件                              |
| 唯一的 4 空格缩进                  | ✅   | 仅 `src/api/vocabulary.js` 的 SQL 模板字符串内部对齐段落（Prettier 正常行为，不改模板字符串）                                   |
| 格式化覆盖范围                     | ✅   | 59 个文件（`src/**`、`ci/*.cjs`、`index.html`、Markdown 文档、各 agent 副本）                                                   |

## 许可与标注核验

| 项                   | 状态 | 证据                                                                                                                                                                 |
| -------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LICENSE 版权主体     | ✅   | `Copyright (c) 2025-2026 XISHU (shallowlong@gmail.com)`（与团队公共配置一致）                                                                                        |
| LICENSE 适用范围说明 | ✅   | 新增「适用范围与第三方内容 / Scope and third-party content」章节，含上游 URL、CC BY-SA 3.0、推荐署名                                                                 |
| package.json 元数据  | ✅   | `author: "XISHU <shallowlong@gmail.com>"`、`license: "MIT"`、`description` 含来源 URL 与许可                                                                         |
| index.html 标注      | ✅   | `meta[name=description]` 含「核心韩语内容来自 Open Yonsei Korean Vocabulary（CC BY-SA 3.0）」                                                                        |
| 页面页脚标注         | ✅   | 实测文本：`v0.1.0 · 代码 MIT · 数据集 CC BY-SA 3.0` + `词汇数据来自 Open Yonsei Korean Vocabulary`（带外链）                                                         |
| 设置页「关于」标注   | ✅   | 实测文本：`词汇数据来自 Open Yonsei Korean Vocabulary v0.1.0，共 4445 条词条。数据集按 CC BY-SA 3.0 发布，再分发需保留署名并以相同协议共享；本项目代码按 MIT 发布。` |
| 代码内单一来源       | ✅   | `src/data/copyright.js` 的 `DATASET.repo` / `DATASET.attribution`                                                                                                    |

## 浏览器回归（Edge 无头，`http://localhost:5173/`）

| 项             | 状态 | 证据                                                                                                                           |
| -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| 控制台         | ✅   | 0 errors / 0 warnings                                                                                                          |
| 首页           | ✅   | 标题 `选择册次 · 韩语词汇发音学习`；`4445 条词条 · 6 册 · 60 课 · 已学 0 条`；6 张册卡                                         |
| 品牌副标题     | ✅   | `延世韩国语 1-6 册 · 词汇与发音`                                                                                               |
| 学习页         | ✅   | 词条 `안녕하십니까`；释义 `中文:你好` / `EN:hello; how do you do?`（格式化未引入多余空白）；标签 `搭配表达 / 表达 / 第 1 单元` |
| 学习页统计行   | ✅   | `65 条 · 已掌握 0 · 学习中 0 · 收藏 0 （← → 翻词，空格重播）`                                                                  |
| 设置页引擎列表 | ✅   | 3 项：`浏览器内置语音 离线` / `Google 翻译语音 需联网` / `自定义语音服务 需联网`                                               |

## 已知注意事项（如实记录）

| 项             | 说明                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Prettier 收敛  | 首次 `--write` 后 `src/views/SettingsView.vue` 仍需再写一次才稳定（深层嵌套 Vue 模板中的 `{{ }}` 插值），现为幂等             |
| 副本同步顺序   | 拼接 agent 副本后须再跑 `npm run format`，否则 header 格式会让 `format:check` 失败（已记入 `docs/knowledge/architecture.md`） |
| 缩进变更的影响 | 全部源码缩进由 2 空格改为 Tab（宽 4），属纯格式变更；`git diff` 会显示大量行变动，但逻辑零改动（构建 + 浏览器回归均已验证）   |
