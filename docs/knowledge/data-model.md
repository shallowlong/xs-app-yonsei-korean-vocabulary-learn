# 数据模型

## 来源与生成

词库是**只读派生数据**：上游 JSON 只做格式转换，不改写任何词条内容。

```
上游：open-yonsei-korean-vocabulary v0.1.0 的 data/json/vol-01..06.json
  ↓  scripts/build-db.py（仅用 Python 标准库 sqlite3）
产物：public/data/vocabulary.sqlite（约 1.2 MB，4,445 条词条）
```

```text
FILE: scripts/build-db.py
SYMBOL: scripts/build-db.py::ENTRY_FIELDS
SYMBOL: scripts/build-db.py::build_db
```

生成命令：

```bash
python scripts/build-db.py                    # 默认读取 ../open-yonsei-korean-vocabulary/data/json
python scripts/build-db.py --data <路径>      # 指定上游数据目录
python scripts/build-db.py --output <路径>    # 指定产物位置
```

`public/data/vocabulary.sqlite` 已列入 `.gitignore`（构建期生成物），
新克隆仓库需先执行 `npm run db`。

## 表结构

### `volumes` — 册次元数据（6 行）

| 列                  | 类型       | 含义                               |
| ------------------- | ---------- | ---------------------------------- |
| `volume`            | INTEGER PK | 册次（1–6）                        |
| `units_per_chapter` | INTEGER    | 每课的单元数（学习页按单元分组）   |
| `accent`            | TEXT       | 该册主题色（首页卡片渐变起始色）   |
| `row_count`         | INTEGER    | 该册词条数                         |
| `custom_wordbook`   | INTEGER    | 是否为用户自制词表（本项目恒为 0） |
| `title`             | TEXT       | 自制词表标题（本项目为 NULL）      |

### `chapters` — 课次标题（每册 10 课，共 60 行）

| 列                  | 含义                                               |
| ------------------- | -------------------------------------------------- |
| `volume`, `chapter` | 联合主键                                           |
| `ko` / `zh` / `en`  | 课次的三语标题（如 `인사` / `问候` / `Greetings`） |

### `entries` — 词条（4,445 行）

| 列                                | 含义                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `entry_id`                        | 稳定主键，格式 `v01-c01-u01-001`（册-课-单元-序号）                                         |
| `volume` / `chapter` / `unit`     | 所属册、课、单元                                                                            |
| `sequence` / `source_order`       | 学习顺序 / 原始顺序                                                                         |
| `korean`                          | 韩语词形（页面主展示对象）                                                                  |
| `chinese`                         | 简体中文释义                                                                                |
| `english`                         | 英文义项（分号分隔多义）                                                                    |
| `entry_kind`                      | 条目类型：`lexeme` / `expression` / `grammar`                                               |
| `pos` / `pos_zh`                  | 词性（韩文 / 中文）                                                                         |
| `origin_type`                     | 词源类型：`hanja` / `native` / `loanword` / `hybrid` / `expression` / `grammar` / `unknown` |
| `origin_detail`                   | 词源细节（如「安寧 + 하다 + 敬语终结」）                                                    |
| `pronunciation`                   | 罗马音或必要发音标注，**覆盖率约 40%**，可能为空串                                          |
| `dictionary_source`               | 词典依据来源                                                                                |
| `dictionary_candidate_count`      | 词典候选数量                                                                                |
| `match_method` / `english_method` | 匹配方式（数据生产链路信息）                                                                |
| `match_confidence`                | 匹配置信度（0–1）                                                                           |
| `review_status`                   | 复核状态：`verified` / `high` / `medium` / `low` / `needs_review`                           |
| `revision_note`                   | 编辑备注                                                                                    |

索引：`(volume, chapter, unit, sequence)`、`(chapter)`。

## 查询入口

**所有 SQL 只写在 `src/api/vocabulary.js`**，视图不得直接拼 SQL。

| 函数                                  | 用途                                                 |
| ------------------------------------- | ---------------------------------------------------- |
| `initDatabase()`                      | 加载 wasm 与 sqlite（幂等，缓存 Promise）            |
| `getVolumes()` / `getVolume(v)`       | 册次元数据                                           |
| `getChapters(v)` / `getChapter(v, c)` | 课次（含每课 `entry_count`）                         |
| `getEntries(v, c)`                    | 一课词条（按单元与顺序）                             |
| `getEntryIdsByVolume()`               | 全库 entry_id 按册分组（首页算进度用，避免逐册查询） |
| `getEntryIdsByChapter(v)`             | 一册 entry_id 按课分组                               |
| `getCorpusStats()`                    | 总词条数 / 册数 / 课数 / 有发音记录数                |

```text
SYMBOL: src/api/vocabulary.js::getVolumes
SYMBOL: src/api/vocabulary.js::getChapters
SYMBOL: src/api/vocabulary.js::getEntryIdsByVolume
SYMBOL: src/api/vocabulary.js::getCorpusStats
SYMBOL: src/api/vocabulary.js::resolveSqlJsInit
```

## 显示映射（不改变数据）

字段到中文标签的映射集中在 `src/data/labels.js`：`ORIGIN_LABELS`、`ORIGIN_TIPS`、
`KIND_LABELS`、`REVIEW_LABELS`、`VOLUME_NAMES_ZH`、`VOLUME_NAMES_KO`。

```text
SYMBOL: src/data/labels.js::ORIGIN_LABELS
SYMBOL: src/data/labels.js::REVIEW_LABELS
SYMBOL: src/data/labels.js::VOLUME_NAMES_ZH
```

## 数据可信度

上游对每条记录带 `review_status`：`verified` 153 条、`high` 2,694 条、
`medium` 18 条、`low` 1,580 条。**`low` 仅表示待进一步核对，不等于已知错误。**

设置页开启「词源信息」后，学习页可展开查看该词条的复核状态与编辑备注，
用于诚实标注数据可信度。

## 已知限制

- `pronunciation` 字段覆盖率约 40%，其余词条的发音**完全依赖浏览器内置语音包实时合成**
- 上游未提供词频信息，无法按频率排序
- 无音频文件：站点不收藏任何录音，全部即时合成
