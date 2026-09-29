# Third-party notices / 第三方内容说明

本项目运行时分发的内容中，第三方资料仅包括以下：

- 通过 npm 安装的开源库（`vue`, `vue-router`, `sql.js`, `vite` 等），许可见 `node_modules/*/LICENSE` 与各项目官网
- 词条数据（`public/data/vocabulary.sqlite`），来源为 [Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary)，CC BY-SA 3.0

上游项目所引用的以下第三方词典资料，**本项目未直接嵌入**，仅为来源说明：

- 韩国语基础词典 — <https://krdict.korean.go.kr/>（国立国语院版权政策）
- NIKL Korean-English Dictionary dataset mirror — <https://huggingface.co/datasets/binjang/NIKL-korean-english-dictionary>（dataset-card 标识 MIT）
- Multilingual Korean Basic Dictionary dataset mirror — <https://huggingface.co/datasets/hac541309/basic_korean_dict>（metadata 标识 CC BY-SA 3.0；原始政策 CC BY-SA 2.0）

如果你对本项目数据集中具体词条的来源有疑问，请参阅
[`SOURCES.md`](../SOURCES.md) 与上游项目
[`SOURCES.md`](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary/blob/main/SOURCES.md) / [`LICENSE.md`](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary/blob/main/LICENSE.md)。

## 鸣谢

- 数据整理与发布：[Amulopapa67](https://github.com/Amulopapa67) 与所有贡献者
- 词典原始提供方：韩国国立国语院、NIKL、HuggingFace 镜像维护者
- 浏览器内置：Web Speech API（无外部依赖）
