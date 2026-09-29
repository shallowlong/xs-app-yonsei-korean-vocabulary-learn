# 架构

## 技术栈

| 层   | 选型                                | 说明                                                    |
| ---- | ----------------------------------- | ------------------------------------------------------- |
| 构建 | Vite 5                              | `base: "./"` 相对路径产物，可静态托管到任意子目录       |
| 框架 | Vue 3（`<script setup>`）           | 纯 JavaScript，未启用 TypeScript                        |
| UI   | Element Plus 2（全量引入 + `zhCn`） | 样式分三层：Element 主题 → 设计令牌 → 项目覆盖          |
| 状态 | Pinia（setup store）                | `progress`（学习进度）、`settings`（引擎与显示偏好）    |
| 路由 | Vue Router 4（hash 模式）           | 视图懒加载；hash 模式免服务端重写配置                   |
| 数据 | sql.js（WebAssembly SQLite）        | 读取随站分发的 `vocabulary.sqlite`，查询全在 `src/api/` |
| 风格 | Prettier 3 + EditorConfig           | Tab 缩进（宽 4）、LF、双引号、分号；见下「代码风格」    |

```text
FILE: vite.config.js
FILE: src/main.js
FILE: src/router/index.js
FILE: src/styles/tokens.css
FILE: src/styles/app.css
SYMBOL: src/main.js::createPinia
SYMBOL: src/main.js::ElementPlus
SYMBOL: src/router/index.js::createWebHashHistory
```

## 目录结构与职责

```text
src/
├── main.js                 # 应用入口：注册 Pinia / 路由 / Element Plus（含中文语言包）与三层样式
├── App.vue                 # 仅做布局包裹：<AppShell><RouterView /></AppShell>
├── router/index.js         # 路由表（懒加载 + afterEach 维护 document.title）
├── api/vocabulary.js       # 数据访问层：唯一写 SQL 的地方
├── data/                   # 静态配置与映射（无副作用）
│   ├── labels.js           # 词源 / 词性 / 复核状态 / 册次 的中文映射
│   ├── appMeta.js          # 名称与版本（版本来自构建时注入）
│   └── copyright.js        # 版权与署名单一来源
├── stores/                 # Pinia 状态（持久化到 localStorage）
│   ├── progress.js         # 学习标记与统计
│   └── settings.js         # 语音参数与页面显示偏好
├── utils/
│   ├── storage.js          # localStorage 封装（schema 版本 / 容错 / 防抖 / 导出）
│   └── speech.js           # 语音合成（浏览器内置语音包 + 韩语语音过滤）
├── composables/            # 视图复用的组合式函数
│   ├── useVocabulary.js    # 数据加载 + loading/error + 进度统计
│   └── useSpeech.js        # 朗读调用 + 播放态 + 错误
├── components/             # 跨页面复用组件
│   ├── AppShell.vue        # 顶栏 + 内容区 + 页脚
│   ├── AppFooter.vue       # 版权与版本（数据集署名在设置页「关于」）
│   ├── WordCard.vue        # 单词卡（学习页核心）
│   └── SpeakIcon.vue       # 内联 SVG 喇叭图标（不引入图标库）
├── views/                  # 页面级组件
│   ├── HomeView.vue        # 册次选择 + 总进度
│   ├── VolumeView.vue      # 课次列表 + 每课进度
│   ├── StudyView.vue       # 单词学习（浏览 / 自测）
│   └── SettingsView.vue    # 语音引擎配置 / 显示偏好 / 进度管理 / 关于
└── styles/
    ├── tokens.css          # 设计令牌（颜色/尺度/字体的唯一来源）
    └── app.css             # Element 变量映射 + 布局骨架 + 组件微调
```

```text
FILE: src/api/vocabulary.js
FILE: src/utils/speech.js
FILE: src/data/labels.js
FILE: src/data/copyright.js
FILE: src/composables/useVocabulary.js
FILE: src/composables/useSpeech.js
FILE: src/components/AppShell.vue
FILE: src/components/WordCard.vue
FILE: src/views/HomeView.vue
FILE: src/views/StudyView.vue
FILE: src/views/SettingsView.vue
```

## 数据流

### 1. 词库（只读）

```
上游 JSON（data/json/vol-*.json）
  → scripts/build-db.py            生成三张表（volumes / chapters / entries）
  → public/data/vocabulary.sqlite  随站分发的静态资源
  → src/api/vocabulary.js          sql.js 打开并查询
  → src/composables/useVocabulary.js  包装 loading / error / data
  → src/views/*                    只消费，不写 SQL
```

### 2. 学习进度（本地）

```
用户点击标记
  → src/stores/progress.js  toggleMark()
  → state.marks 更新（Vue reactive，界面自动刷新）
  → watch(deep) → createDebouncedSaver（200ms 防抖）
  → localStorage["korean-learn:progress:v1"]
```

统计通过 `progress.countMarks(entryIds)` 在 `computed` 中调用获得，因此标记后
册次页 / 首页的进度条会立即同步。

### 3. 朗读

```
视图 / WordCard 触发 speak
  → src/composables/useSpeech.js  speakText()：播放态、错误、切词时打断
  → src/utils/speech.js           speak()：挑选语音（韩语优先）并朗读
```

```text
SYMBOL: src/api/vocabulary.js::initDatabase
SYMBOL: src/api/vocabulary.js::getEntries
SYMBOL: src/composables/useVocabulary.js::useChapterEntries
SYMBOL: src/composables/useSpeech.js::useSpeech
SYMBOL: src/utils/speech.js::speak
SYMBOL: src/stores/progress.js::useProgressStore
SYMBOL: src/stores/settings.js::useSettingsStore
```

## 代码风格

格式化由 **Prettier** 强制，编辑器行为由 **EditorConfig** 约束，二者共同决定缩进与换行：

| 项           | 值                                             | 来源                                                        |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| 缩进         | Tab（显示宽度 4）                              | `.editorconfig` 的 `indent_style = tab` + `indent_size = 4` |
| 换行符       | LF                                             | `.editorconfig` 的 `end_of_line = lf`                       |
| 引号 / 分号  | 双引号、保留分号                               | `.prettierrc`                                               |
| 尾随逗号     | 多行结构全部保留                               | `.prettierrc` 的 `trailingComma: "all"`                     |
| 箭头函数参数 | 始终带括号                                     | `.prettierrc` 的 `arrowParens: "always"`                    |
| Vue SFC      | 标签 `>` 不换行、`<script>`/`<style>` 内容缩进 | `bracketSameLine` + `vueIndentScriptAndStyle`               |

```bash
npm run format        # 写入
npm run format:check  # 校验（npm run verify 已包含，失败即阻断）
```

```text
FILE: .prettierrc
FILE: .prettierignore
FILE: .editorconfig
```

> `.prettierrc` 刻意不设置 `useTabs` / `tabWidth`，Prettier 遂采用 `.editorconfig`
> 的值——要改缩进风格，只改 `.editorconfig` 一处即可。
>
> 注意：同步各 agent 规范副本后需再跑一次 `npm run format`，否则拼接出的副本
> 会因 header 格式不合规而让 `format:check` 失败。

## 关键实现约束

| 约束                                      | 原因                                                              | 位置                    |
| ----------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| `sql.js` 必须 alias 到 `dist/sql-wasm.js` | 该包 browser 入口是 UMD，无 default 导出，Vite ESM interop 会失败 | `vite.config.js`        |
| `resolveSqlJsInit()` 兼容三种导出形态     | 依赖预构建产物形态随版本变化                                      | `src/api/vocabulary.js` |
| `postinstall` 复制 wasm 到 `public/data/` | sql.js 运行时按 URL 加载 `sql-wasm.wasm`                          | `scripts/copy-wasm.mjs` |
| `vocabulary.sqlite` 与 wasm 不进版本库    | 属构建期生成物，避免大文件入库                                    | `.gitignore`            |
| 设计令牌是唯一颜色来源                    | 保证主题一致、便于整体换色                                        | `src/styles/tokens.css` |

细节见 `AGENTS.md` §9 与 [data-model.md](data-model.md)、[speech.md](speech.md)。
