# 数据来源与许可

> 本节是**合规红线**，修改页脚、数据分发方式或引入新数据前必读。

## 双许可结构

| 内容                                                | 许可                 | 文件                       |
| --------------------------------------------------- | -------------------- | -------------------------- |
| 本仓库原创前端代码（`src/`、`scripts/`、构建配置）  | **MIT**              | `LICENSE`                  |
| 嵌入的词汇数据集（`public/data/vocabulary.sqlite`） | **CC BY-SA 3.0**     | `LICENSES/CC-BY-SA-3.0.md` |
| 第三方 npm 依赖                                     | 各自许可（均为 MIT） | `node_modules/*/LICENSE`   |

关键理解：**ShareAlike 只约束数据及其派生生成物，不传染前端代码。**
因此本项目代码可为 MIT，而数据集保持 CC BY-SA 3.0。

```text
FILE: LICENSE
FILE: LICENSES/CC-BY-SA-3.0.md
FILE: LICENSES/THIRD_PARTY_NOTICES.md
FILE: SOURCES.md
SYMBOL: src/data/copyright.js::DATASET
SYMBOL: src/data/copyright.js::PROJECT
```

## 上游来源

- 数据集：[Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary) `v0.1.0`（4,445 条词条，6 册）
- 该上游整理时参考的词典（本项目**未直接嵌入**，仅作来源说明）：
    - 韩国语基础词典 <https://krdict.korean.go.kr/>
    - NIKL Korean-English Dictionary（dataset-card 标识 MIT）
    - Multilingual Korean Basic Dictionary（CC BY-SA 3.0）

## 再分发的三项义务

1. **署名**：保留对上游贡献者的署名（推荐文本见下）
2. **同协议**：修改后的数据集仍以 CC BY-SA 3.0 发布
3. **说明修改**：注明所做的事（本项目为：JSON → SQLite、合并为单一库、保留全部原始字段值）

推荐署名文本（已固化在 `src/data/copyright.js` 的 `DATASET.attribution`）：

```text
Open Yonsei Korean Vocabulary contributors,
"Open Yonsei Korean Vocabulary dataset", version 0.1.0,
CC BY-SA 3.0.
```

## 代码中的单一来源

许可与版权文案**只在 `src/data/copyright.js` 维护**：

- 页脚（`src/components/AppFooter.vue`）展示版本、代码许可、数据集许可与数据来源链接
- 设置页「关于」展示版本、数据来源、许可说明与免责声明
- 组件**禁止**硬编码许可字符串或上游仓库地址

## 不收录的内容（红线）

- 《延世韩国语》教材课文、例句、练习、答案
- 教材音频、扫描页、封面或官方视觉素材
- 商标与机构 Logo
- 任何录音文件：本站发音全部由浏览器内置语音包**实时合成**

## 与出版方的关系

```text
PROJECT.disclaimer = "本项目与延世大学及其韩国语学堂无隶属、赞助或背书关系；
名称仅用于说明所索引的教材系列。"
```

该声明保留在设置页「关于」中；页脚保持最简，仅留许可署名，避免干扰学习动线。
