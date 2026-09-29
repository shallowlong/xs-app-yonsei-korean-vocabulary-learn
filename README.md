# xs-app-korean-learn

> **延世韩国语词汇发音练习**
> 《延世韩国语》1–6 册 · 韩 / 中 / English 三语 · 浏览器内置语音包 · 进度存本地

![license](https://img.shields.io/badge/code-MIT-blue) ![dataset](https://img.shields.io/badge/dataset-CC_BY--SA_3.0-orange) ![vue](https://img.shields.io/badge/Vue-3-42b883) ![element](https://img.shields.io/badge/Element_Plus-2-409eff) ![vite](https://img.shields.io/badge/Vite-5-646cff)

## 这是什么

一个**纯前端、无后端**的单页应用，把开源词表
[Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary)
的 4,445 条《延世韩国语》词条，做成可"听、记、练、查"的浏览器学习站。

- **6 册 60 课** 完整收录，按 `册 → 课 → 单元` 顺序学习
- **韩 / 中 / English 三语** 对照，附词性与词源（可选显示）
- **浏览器内置语音包发音**：完全离线、零依赖，可调语速与音高，并可从系统韩语语音中挑选音色
- **浏览 + 自测** 双模式，自测可先遮住释义回忆再揭示
- **学习进度存浏览器**：已掌握 / 学习中 / 收藏三种标记，可导出备份
- **静态托管友好**：`npm run build` 产物可直接放到任意静态空间

## 快速开始

```bash
# 1. 安装依赖（postinstall 会自动把 sql.js 的 wasm 复制到 public/data/）
npm install

# 2. 生成词库 SQLite（从上游 JSON 数据转换，只需跑一次）
npm run db
#   默认读取 ../open-yonsei-korean-vocabulary/data/json
#   自定路径：python scripts/build-db.py --data <上游数据目录>

# 3. 启动开发服务器
npm run dev          # → http://localhost:8100/

# 4. 构建
npm run build        # → dist/
```

## 技术栈

| 领域 | 选型                                                      |
| ---- | --------------------------------------------------------- |
| 构建 | Vite 5（`base: "./"` 相对路径产物）                       |
| 框架 | Vue 3（`<script setup>`，纯 JavaScript）                  |
| UI   | Element Plus 2（全量引入 + 中文语言包）                   |
| 状态 | Pinia 3（`progress` / `settings`，持久化到 localStorage） |
| 路由 | Vue Router 4（hash 模式，免服务端重写）                   |
| 数据 | sql.js（WebAssembly SQLite）读取静态 `vocabulary.sqlite`  |
| 发音 | Web Speech API（浏览器内置语音包，完全离线）              |

## 项目结构

```
src/
├── api/vocabulary.js        # 数据访问层（唯一写 SQL 的地方）
├── data/                    # 静态配置：标签映射、版本与版权
├── stores/                  # Pinia：学习进度、语音与显示设置
├── utils/                   # localStorage 封装、语音合成
├── composables/             # useVocabulary（数据加载）、useSpeech（朗读）
├── components/              # AppShell / AppFooter / WordCard / SpeakIcon
├── views/                   # 首页 / 册次 / 学习 / 设置
└── styles/                  # tokens.css（设计令牌）+ app.css（Element 覆盖）
```

完整分层与数据流见 [docs/knowledge/architecture.md](docs/knowledge/architecture.md)。

## 语音合成

发音使用**浏览器内置语音包**（Web Speech API）：完全离线、无请求配额、零外部依赖，
不引入任何 TTS SDK 或在线语音接口。

- 设置页可调**语速**与**音高**，并从**系统语音中挑选支持韩语的音色**（留空则由系统默认挑选）
- 中文 / 英文释义的发音复用系统对应语言的语音包
- 若系统未安装韩语语音包，设置页会给出安装指引（Windows 通常为 Microsoft Heami，macOS 为 Yuna）

实现细节与排查见 [docs/knowledge/speech.md](docs/knowledge/speech.md)。

## 学习进度

- 三种标记：**已掌握 / 学习中 / 收藏**，按课、册、全站三级统计
- 数据保存在浏览器 `localStorage`（键 `korean-learn:progress:v1`），**不上传任何服务器**
- 设置页可**导出 JSON 备份**或重置；清除浏览器数据会丢失进度

## 键盘快捷键

| 键        | 作用                                   |
| --------- | -------------------------------------- |
| `←` / `→` | 上一个 / 下一个词                      |
| `空格`    | 浏览模式重播韩语；自测模式切换答案显隐 |

## 开发规范

本项目接入了 [ai-dev-conventions-scaffold](https://github.com/Amulopapa67/ai-dev-conventions-scaffold)
的 AI 协作规范：

- **`AGENTS.md` 是唯一权威规范**（`CLAUDE.md`、`.github/copilot-instructions.md`
  与各 agent 的 `.codebuddy` / `.trae` / `.cursor` / `.claude` rules 均为其副本）
- 工作流：**§0 需求确认门禁 → 方案 → 开发 → 验证 → 提交 → 发版**
- 提交信息遵循 Conventional Commits；一次提交对应一个需求点
- 代码风格由 **Prettier** 强制（配置 `.prettierrc`、忽略 `.prettierignore`），
  编辑器行为由 **`.editorconfig`** 约束：**Tab 缩进（宽 4）**、LF、双引号、分号、多行尾随逗号
- 校验命令：

```bash
npm run format       # 按规范格式化（提交前必跑）
npm run check        # 规范引用 + 清单同步 + 幽灵依赖 + 知识库事实
npm run verify       # format:check + build + check（发版前 preversion 自动执行）
```

方案文档模板位于 `docs/designs/_template/`，知识库入口 `docs/knowledge/README.md`。

## 数据来源与许可

| 内容             | 许可                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 本项目原创代码   | **MIT**（见 [LICENSE](LICENSE)）                                            |
| 嵌入的词汇数据集 | **CC BY-SA 3.0**（见 [LICENSES/CC-BY-SA-3.0.md](LICENSES/CC-BY-SA-3.0.md)） |
| 第三方 npm 依赖  | 各自许可（均为 MIT）                                                        |

再分发数据集时需**保留署名并以相同协议共享**，建议署名：

```text
Open Yonsei Korean Vocabulary contributors,
"Open Yonsei Korean Vocabulary dataset", version 0.1.0,
CC BY-SA 3.0.
```

详细来源见 [SOURCES.md](SOURCES.md) 与
[docs/knowledge/sources-and-license.md](docs/knowledge/sources-and-license.md)。

页脚仅显示版权与版本（`© 2025-2026 奚叔2099 · v1.0.0`，版权人名称指向
[xishu2099.top](https://xishu2099.top)）；数据集署名与许可说明位于
**设置页「关于」**及 `LICENSE`、`SOURCES.md`、`LICENSES/` 中。

### 与出版方的关系

本项目与延世大学及其韩国语学堂**无隶属、赞助或背书**关系；名称仅用于说明所索引的教材系列。
站点**不收录**教材课文、例句、练习、答案、音频或扫描页——所有发音均由浏览器内置语音包实时合成。

## 浏览器兼容性

| 能力                | Chrome / Edge    | Firefox      | Safari       |
| ------------------- | ---------------- | ------------ | ------------ |
| 应用本体            | ≥ 90             | ≥ 90         | ≥ 15         |
| 韩语发音（`ko-KR`） | 需系统装韩语语音 | 受语言包影响 | 受语言包影响 |

若无法发声，请为操作系统安装韩语语音包（设置页会给出安装指引），或改用支持该能力的浏览器。

## 已知限制

- `pronunciation` 字段覆盖率约 40%（1,804/4,445，且为罗马音标注），发音完全依赖浏览器内置语音包合成
- 部分词条复核状态为 `low`，词义或词源可能仍有疏漏（上游已如实标注）
- 进度仅存当前浏览器，换设备或清缓存会丢失（可导出备份）
