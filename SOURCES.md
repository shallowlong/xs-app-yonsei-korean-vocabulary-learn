# Sources / 数据来源与许可

本项目通过嵌入 SQLite 数据库的方式，分发了来自以下上游项目的词汇数据。
使用本项目时，请同时遵守各上游条款。

## 1. Open Yonsei Korean Vocabulary

- 仓库：<https://github.com/Amulopapa67/open-yonsei-korean-vocabulary>
- 释放版本：`v0.1.0`（4,445 条词条，6 册）
- 许可：项目代码 MIT；**数据及由数据生成的 PDF = CC BY-SA 3.0**；文档/Logo = CC BY 4.0
- 完整说明：<https://github.com/Amulopapa67/open-yonsei-korean-vocabulary/blob/main/LICENSE.md>

本项目的 `public/data/vocabulary.sqlite` 是上述数据集的派生生成物。再次分发时：

1. 保留对原作者及贡献者的署名
2. 沿用 CC BY-SA 3.0 协议（ShareAlike 条款）
3. 在显著位置说明所作的修改（本项目的主要修改：从 JSON 转为 SQLite 单一文件、
   重命名字段英文为同义英文、保留所有原始字段值）

推荐署名文本：

```text
Open Yonsei Korean Vocabulary contributors,
"Open Yonsei Korean Vocabulary dataset", version 0.1.0,
CC BY-SA 3.0.
```

完整许可文本见 [`LICENSES/CC-BY-SA-3.0.md`](LICENSES/CC-BY-SA-3.0.md) 与
上游协议 <https://creativecommons.org/licenses/by-sa/3.0/>。

## 2. 上游词典参考

上游 `Open Yonsei Korean Vocabulary` 在其 `SOURCES.md` 中声明主要参考：

- 韩国语基础词典 — <https://krdict.korean.go.kr/>（国立国语院版权政策）
- NIKL Korean-English Dictionary（数据集镜像，dataset-card license = MIT）
- Multilingual Korean Basic Dictionary（数据集镜像，CC BY-SA 3.0；原始政策为 CC BY-SA 2.0）

我们未直接下载或嵌入这些原始数据；这些仅作为上游数据整理时的参考来源。
如需引用具体词条，请同时查阅上游项目与原始词典的版权政策。

## 3. 第三方 npm 依赖

| 包                 | 许可 | 用途               |
| ------------------ | ---- | ------------------ |
| vue                | MIT  | UI 框架            |
| vue-router         | MIT  | 路由               |
| sql.js             | MIT  | WebAssembly SQLite |
| vite               | MIT  | 构建工具           |
| @vitejs/plugin-vue | MIT  | Vue 单文件组件     |

完整文本见 `node_modules/*/LICENSE`。

## 4. 字体

本项目在 CSS 中通过 `font-family` 链声明字体但**不嵌入字体文件**。浏览器根据
用户系统的回退字体显示。Noto Sans KR / Noto Sans SC 等以 SIL OFL 1.1
发布于 Google Fonts，若你的部署环境需要，可自行引入。

## 5. 不包含的内容

- 《延世韩国语》教材原文、例句、练习、答案、扫描页、音频或官方视觉素材
- 商标或机构 Logo
