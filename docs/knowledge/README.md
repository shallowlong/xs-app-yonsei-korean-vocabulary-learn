# 知识库

本目录是**项目的技术与领域知识库**，供 AI 与开发者快速建立正确认知。

> **最高原则：与代码不一致时以代码为准。** 发现不一致时请修正本目录，而不是绕过它。

## 维护规则

- 硬事实用**机器可检标注**书写，由 `python ci/check-knowledge-facts.py` 校验（`npm run check:kb`）
- 标注语法（写在 `.md` 代码块内、独立成行）：
    - `FILE: path/to/file` — 文件必须存在
    - `VERSION: key=value` — `package.json` 中必须有该键且含该值
    - `SYMBOL: path/to/file::symbolName` — 文件中必须出现该标识符
    - `LINE: path/to/file#N` — 文件至少有 N 行
- 改动代码涉及行为/结构变化时，同步更新对应文档（见 `AGENTS.md` §5 文档同步门禁）
- 不要在本目录写"计划中"的能力；只写**当前代码真实具备**的事实

## 文档索引

| 文档                                             | 内容                                           |
| ------------------------------------------------ | ---------------------------------------------- |
| [architecture.md](architecture.md)               | 技术栈、目录分层、数据流、关键模块职责         |
| [data-model.md](data-model.md)                   | SQLite 数据结构、生成脚本、字段含义、数据来源  |
| [speech.md](speech.md)                           | 语音合成：内置语音包、韩语语音过滤、发音设置项 |
| [sources-and-license.md](sources-and-license.md) | 双许可结构、署名要求、合规红线                 |

## 项目一句话

**延世韩国语词汇发音练习**：把上游开源词表（《延世韩国语》1–6 册 4,445 条词条）转成静态 SQLite，
用 Vue 3 单页应用提供**韩语发音练习 + 三语对照 + 本地学习进度**；无后端，
发音由浏览器内置语音包实时合成。

## 快速事实

```text
FILE: src/main.js
FILE: src/api/vocabulary.js
FILE: src/utils/speech.js
FILE: src/stores/progress.js
FILE: scripts/build-db.py
FILE: docs/knowledge/architecture.md
FILE: docs/knowledge/data-model.md
FILE: docs/knowledge/speech.md
FILE: docs/knowledge/sources-and-license.md
VERSION: name=xs-app-korean-learn
VERSION: version=1.0.0
```
