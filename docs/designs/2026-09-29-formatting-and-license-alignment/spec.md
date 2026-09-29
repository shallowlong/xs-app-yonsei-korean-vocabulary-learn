# 方案：对齐团队格式化与许可规范 + 标注数据来源

日期：2026-09-29
状态：已实施

## 背景与问题

项目此前只有编码风格的**文字约定**（`AGENTS.md` §4 写"2 空格缩进"），缺少机器强制的格式化配置，
与团队既有的公共配置约定也不一致：

1. 无 Prettier / EditorConfig，风格只能靠人工自觉，跨项目协作时缩进与换行各行其是
2. `LICENSE` 的版权主体是占位性质的 "xs-app-korean-learn contributors"，未对齐组织（XISHU）
3. `package.json` 缺 `author` / `license` / `description` 字段
4. 核心韩语数据来自第三方开源项目，虽然多处已提及，但**缺少集中、显式的标注**（尤其 LICENSE 未说明适用范围）

## 技术方案

### 1. 引入格式化规范（照搬团队公共配置）

| 文件              | 内容                                                                                                                                                                                            | 关键点                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `.editorconfig`   | `indent_style = tab`、`indent_size = 4`、`end_of_line = lf`、`insert_final_newline = false`、`trim_trailing_whitespace = false`                                                                 | 与团队公共配置逐字节一致                       |
| `.prettierrc`     | `trailingComma: "all"`、`semi: true`、`singleQuote: false`、`bracketSpacing: true`、`objectWrap: "preserve"`、`bracketSameLine: true`、`arrowParens: "always"`、`vueIndentScriptAndStyle: true` | 与团队公共配置逐字节一致                       |
| `.prettierignore` | `build/`、`logs/`、`coverage/`、`dist/`                                                                                                                                                         | 沿用团队公共配置，**补充** `package-lock.json` |

**缩进为何是 Tab 而非空格**：`.prettierrc` 刻意不设 `useTabs` / `tabWidth`，Prettier 会读取
`.editorconfig` 的 `indent_style` 与 `indent_size`，最终得到 **Tab 缩进、显示宽度 4**。
这样未来改缩进风格只需改 `.editorconfig` 一处。

**为何忽略 `package-lock.json`**：它由 npm 以 2 空格缩进写入，若纳入格式化会与
`npm install` 互相覆盖，产生无意义的 diff。

### 2. 全项目格式化

新增 devDependency `prettier@^3.6.2`（`objectWrap` 需 ≥ 3.5），跑 `npm run format`
格式化 59 个文件（`src/` 源码、`ci/` 脚本、`index.html`、Markdown 文档等）。

新增脚本：

| 脚本           | 作用                                                              |
| -------------- | ----------------------------------------------------------------- |
| `format`       | `prettier --write .`                                              |
| `format:check` | `prettier --check .`                                              |
| `verify`       | 在原有 `build && check` 前插入 `format:check`（格式不合规即阻断） |

### 3. LICENSE 对齐组织规范并标注数据来源

`LICENSE` 改为团队公共配置的 MIT 原文（`Copyright (c) 2025-2026 XISHU (shallowlong@gmail.com)`），
并追加「适用范围与第三方内容 / Scope and third-party content」章节，明确：

- MIT 仅覆盖本仓库**原创源代码**
- 内嵌的 `public/data/vocabulary.sqlite` **核心内容来自
  [Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary)**
  （v0.1.0，4,445 条词条），按 **CC BY-SA 3.0** 发布，**不适用** MIT
- 再分发须保留署名并以相同协议共享，附推荐署名文本
- 与延世大学无隶属关系；不收录教材课文、例句、练习、答案、音频、扫描页

### 4. package.json 元数据补全

- `author: "XISHU <shallowlong@gmail.com>"`、`license: "MIT"`（对齐团队公共配置写法）
- `description` 显式写出数据来源与其许可：
  `核心韩语内容来自 Open Yonsei Korean Vocabulary — https://github.com/... （CC BY-SA 3.0）`

### 5. 数据来源标注的全覆盖

| 位置                                    | 形式                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| `LICENSE`                               | 「适用范围与第三方内容」章节（含 URL、许可、署名模板） |
| `package.json`                          | `description` 字段含来源 URL 与许可                    |
| `index.html`                            | `meta[name=description]` 提及来源（分享/SEO 可见）     |
| `README.md`                             | 顶部徽章 + 「数据来源与许可」章节                      |
| `SOURCES.md`                            | 上游版本、许可、修改说明、署名模板                     |
| `LICENSES/THIRD_PARTY_NOTICES.md`       | 第三方内容清单                                         |
| `docs/knowledge/sources-and-license.md` | 合规红线（知识库）                                     |
| `src/data/copyright.js`                 | 代码中的单一事实来源（`DATASET.repo` / `attribution`） |
| 页面页脚                                | `词汇数据来自 Open Yonsei Korean Vocabulary`（带外链） |
| 设置页「关于」                          | 数据来源 + 许可说明 + 免责声明                         |

### 6. 同步规范文档

- `AGENTS.md` §4「代码风格」改写：由「2 空格缩进」改为 Prettier + EditorConfig 驱动
  （Tab / 宽 4 / LF），并加"改代码后必须跑 `npm run format`"
- 各 agent 规范副本（`.codebuddy` / `.trae` / `.cursor` / `.claude`）重新拼接并格式化
- `docs/knowledge/architecture.md` 新增「代码风格」章节（含表格与命令）

## 影响范围

- **新增**：`.editorconfig`、`.prettierrc`、`.prettierignore`、本方案目录
- **改写**：`LICENSE`（版权主体与适用范围）、`package.json`（字段 + 脚本 + devDependency）、
  `AGENTS.md` §4、`README.md`（规范章节）、`docs/knowledge/architecture.md`、`index.html`（meta）
- **格式化波及**：59 个文件（含 `src/**`、`ci/*.cjs`、全部 Markdown、agent 副本）
- **行为变化**：`verify` 现在含 `format:check`；缩进由 2 空格改为 Tab（宽 4）
- **不改**：业务逻辑、组件结构、数据语义、存储键、许可结构（仍为代码 MIT + 数据 CC BY-SA 3.0）

## 可复用资源

-团队公共配置的三个配置文件（直接照搬，保证组织内一致）

- 已有的 agent 副本同步脚本思路（保留 `\n---\n` 之前的 header，正文替换为根 `AGENTS.md`）
- 现有 `ci/` 门禁脚本与 `npm run verify` 流程，仅插入 `format:check`

## 需同步文档

- [x] `AGENTS.md` §4 + 各 agent 副本
- [x] `docs/knowledge/architecture.md`（新增代码风格章节）
- [x] `README.md`（开发规范章节）
- [x] 本方案三件套（spec / plan / checklist）

## 已知注意点

- 同步 agent 副本后必须再跑一次 `npm run format`，否则拼接出的 header 会让 `format:check` 失败
  （已写入 `docs/knowledge/architecture.md` 的提示）
- Prettier 对深层嵌套的 Vue 模板存在一次收敛过程：首次 `--write` 后个别文件仍需再跑一次
- `src/api/vocabulary.js` 中的 SQL 模板字符串保留 4 空格对齐，属 Prettier 正常行为（不改模板字符串内容）
