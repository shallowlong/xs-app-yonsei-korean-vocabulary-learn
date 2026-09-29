# 韩语词汇发音学习 — workbuddy agent 规范（项目规范合并副本）

> 本文件是 **韩语词汇发音学习 项目规范（AGENTS.md）** 与 **workbuddy agent 自身规范** 的合并副本。
> 权威来源仍是仓库根 `AGENTS.md`；本副本用于让 agent 在启动时直接加载完整规范，
> 避免 agent 自身默认规范与项目规范冲突或遗漏。两者冲突时以 `AGENTS.md` 为准。
> 修改请改根 `AGENTS.md` 并重新运行 `init.js`（或 `node ci/check-skill-sync.cjs` 思路同步）。

---

# AGENTS.md — 韩语词汇发音学习 AI 协作规范

> 本文件是本仓库的 **AI 协作唯一权威规范**，供所有 AI 编码工具（Codex、Claude Code、Cursor、Copilot、Trae 等）与开发者共同遵守；`CLAUDE.md` 与 `.github/copilot-instructions.md` 是兼容入口，冲突以本文件为准。
> `$korean-learn-dev`（执行清单，内部文件 `SKILL.md`；Codex 在 `.agents/skills/`、Claude Code 在 `.claude/skills/`，两份逐字一致，CI 强制同步）是本流程的**执行清单**——它固化「方案→开发→验证→提交→发版」的步骤与完成条件，**不是**「项目用到的各种 skills 集合**。涉及开发、验证或发版时先调用它，其他环境直接按本文件门禁执行。

> 本文件由 `ai-dev-conventions-scaffold` 的 `init.js` 生成，并已按本项目实际情况填写（§1/§2/§4/§6/§9）。修改规范请只改本文件，再重跑 `init.js` 同步各 agent 副本。

## 0. 第零准则：需求确认门禁（最高优先级）

> 本门禁解决「一句话需求直接开干、结果与预期不符」的问题。任何开发、改动、修复任务，**在动手写代码之前必须先与用户就目标达成共识**。

**触发**：用户提出需求/任务（无论多简短）时即进入本门禁，而非直接进入开发。

**必须确认清楚的事（用最少的问题清单向用户澄清，不要凭空假设）：**

1. **目标与验收标准**：做成什么样算完成？可观测的结果是什么？（如「页面能显示 X」「接口返回 Y」）
2. **范围边界**：只改 A，还是连带 B 也要动？是否涉及破坏性变更？
3. **约束与偏好**：有无必须遵循的现有规范、性能/兼容性/样式约束、不希望动的文件？
4. **复用优先**：在动代码前，先按 §2/§3 查「有没有可复用的配置/组件/helper」，避免重复造轮子——这点也要在确认时一并告诉用户。

**执行方式**：

- 用一份**简洁的目标确认清单**（不要长篇大论）向用户复述理解，并明确列出「我将要做 / 我不会做」。
- **用户明确确认（说 OK / 可以 / 同意 或等价表述）后，才进入 §5 开发流程**。
- 若需求已足够明确（如明确的 bug 复现步骤 + 期望行为），可缩短确认，但仍须复述验收标准并等确认。
- 禁止在用户未确认目标前创建/修改业务代码或提交。

## 1. 仓库职责与协作边界

**本仓库负责：**

- 延世韩国语词汇发音练习站的前端实现：视图、组件、状态管理、语音合成、样式与构建配置
- 词汇数据到 SQLite 的转换脚本（`scripts/build-db.py`）与数据访问层（`src/api/`）
- 项目文档：`docs/knowledge/`（知识库）、`docs/designs/`（方案）、`README.md`、`SOURCES.md`
- 许可合规：保留数据集署名与协议声明（见 `src/data/copyright.js`、`LICENSES/`）

**本仓库不负责：**

- 词汇数据的原始采集与校对（归上游 [Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary)）
- 后端服务、账号体系、跨设备同步（本项目无后端，进度仅存浏览器）
- 教材正文、例句、音频、扫描页等受版权保护内容（刻意不收录）
- 语音服务的服务器实现（仅提供 URL 模板接入点，服务由使用者自备）

**协作边界：**

- 词汇数据为**只读输入**：本仓库不改写数据内容，只做格式转换（JSON → SQLite）
- 数据与代码**双许可**：代码 MIT、数据集 CC BY-SA 3.0；改数据分发方式时须同步更新 `SOURCES.md`
- 上游变化（新增册次/字段）时，先改 `scripts/build-db.py` 与 `docs/knowledge/data-model.md`，再动页面

## 2. 技术栈与代码定位

> 用表格列出「想做什么 → 去哪个目录改」，让 AI 不瞎找文件。本表由 `init.js` 探测后按本项目真实结构人工补全。

**技术栈**：Vue 3（`<script setup>`）+ Vite 5 + Element Plus 2（全量引入，中文语言包）+ Pinia 3 + Vue Router 4（hash 模式）+ JavaScript（未启用 TypeScript）+ sql.js（WebAssembly SQLite）。无后端、无 ESLint/Prettier 配置（风格靠约定，见 §4）。

| 想做什么                   | 去哪里改                                                                         |
| -------------------------- | -------------------------------------------------------------------------------- |
| 改样式 / 设计令牌          | `src/styles/tokens.css`（令牌）、`src/styles/app.css`（Element 覆盖 + 布局骨架） |
| 页面 / 视图                | `src/views/`，路由表 `src/router/index.js`                                       |
| UI 组件（跨页面复用）      | `src/components/`                                                                |
| 状态管理 / 学习进度 / 设置 | `src/stores/`（`progress.js`、`settings.js`）                                    |
| 词汇数据查询               | `src/api/vocabulary.js`（SQL 只在此层）                                          |
| 页面级数据加载 composable  | `src/composables/`（`useVocabulary.js`、`useSpeech.js`）                         |
| 静态数据 / 配置 / 标签映射 | `src/data/`（`labels.js`、`appMeta.js`、`copyright.js`）                         |
| 语音合成（内置语音包）     | `src/utils/speech.js`，视图侧经 `src/composables/useSpeech.js` 调用              |
| 本地存储 / 防抖 / 导出     | `src/utils/storage.js`                                                           |
| SQLite 生成脚本            | `scripts/build-db.py`（数据来源见 `docs/knowledge/data-model.md`）               |
| 应用外壳（顶栏 / 页脚）    | `src/components/AppShell.vue`、`src/components/AppFooter.vue`                    |
| 注册 UI 库 / 全局插件      | `src/main.js`                                                                    |

## 3. 知识库与文档归档

> 可选但强烈建议：为 AI 贡献者维护一份「以代码为唯一事实来源」的知识库。

- 知识库目录：`docs/knowledge/`，按主题域组织，入口 `docs/knowledge/README.md`
- 维护原则：**知识库与代码不一致时以代码为准**，发现不一致时修正知识库
- 硬事实核查：改动知识库后运行核查脚本（见 `ci/check-knowledge-facts.py` 或你项目的等价物）
- 设计前置检查：动代码前先查「有没有可复用的配置/令牌/helper/组件」，避免重复造轮子
- 方案文档：`docs/designs/{YYYY-MM-DD}-{功能简称}/`（`spec.md` / `plan.md` / `checklist.md`）

## 4. 编码规范

**语言与框架**

- Vue 3 Composition API，统一使用 `<script setup>`；不启用 TypeScript（保持与生态模板一致，见 §9）
- 模块系统：ESM（`import` / `export`）；路径别名统一用 `@/`（映射到 `src/`，配置在 `vite.config.js`）
- 状态管理用 Pinia（setup store 风格）；路由用 Vue Router hash 模式

**代码风格**

- 格式化由 **Prettier** 统一强制：配置 `.prettierrc`、忽略清单 `.prettierignore`；编辑器行为由 `.editorconfig` 约束（`indent_style = tab` / `indent_size = 4` / `end_of_line = lf`）
- 缩进使用 **Tab**（显示宽度 4）；双引号；语句末尾分号；多行结构尾随逗号；箭头函数参数始终带括号
- 换行符统一 LF；不主动删除行尾空白
- 组件文件 PascalCase（如 `WordCard.vue`）；组合式函数 `useXxx`（如 `useSpeech.js`）；工具模块小驼峰（如 `storage.js`）
- 常量与枚举用 `UPPER_SNAKE_CASE`（如 `MARK.KNOWN`、`DEFAULT_ENGINE_ID`）
- 注释用中文，重点解释**为什么**这么做（尤其是绕过浏览器怪癖、兼容性处理处），不复述代码字面含义
- 每个模块文件头部用块注释说明职责与关键约定
- 改动代码后必须跑 `npm run format`；`npm run verify` 已包含 `format:check`，格式不一致会阻断验证

**Element Plus 约定**

- 全量引入：`app.use(ElementPlus, { locale: zhCn })` + `element-plus/dist/index.css`（在 `src/main.js`）
- **优先使用 Element 组件，不手写等价控件**：卡片用 `el-card`、标签用 `el-tag`、进度用 `el-progress`、单选用 `el-radio-group`、开关用 `el-switch`、滑块用 `el-slider`、空态用 `el-empty`、加载用 `el-skeleton`、提示用 `el-alert`
- 覆盖 Element 默认样式集中写在 `src/styles/app.css`，优先改 CSS 变量（如 `.nav-menu.el-menu { --el-menu-horizontal-height: ... }`）而非逐组件选择器；**禁止在业务组件散落 `!important`**；`:deep()` 仅用于局部尺寸微调
- 不引入 `@element-plus/icons-vue`：图标用内联 SVG 组件（如 `src/components/SpeakIcon.vue`），避免为一个图标新增运行时依赖

**颜色与样式**

- 颜色只允许引用 `src/styles/tokens.css` 中的 CSS 变量，组件内不写死色值
- 语义色映射放在 `src/data/labels.js`，组件不硬编码标签文案与配色

**新增依赖**

- 新增运行时依赖前必须先与用户确认；优先用现有依赖或平台能力（如 Web Speech API 替代 TTS SDK）

## 5. 工作流程

流程总览：**方案 → 开发 → 验证 → 提交 → 发版**。任何任务开始前，必须先满足 **§0 需求确认门禁**（与用户就目标/验收标准达成共识后才动手）。涉及开发、验证或发版时，先调用 `$korean-learn-dev` skill，按其中的执行顺序与完成条件推进；其他环境按下述门禁执行。

**方案门禁**：涉及行为、结构或多文件改动的任务，先在 `docs/designs/{YYYY-MM-DD}-{功能简称}/` 写方案文档（模板 `docs/designs/_template/`），写明：要解决的问题、技术方案、影响范围、需同步的文档。

**验证门禁**：

- 任何改动 `src/`、`scripts/`、构建配置的提交 → 必须跑 `npm run build` 确认可构建
- 提交前跑 `npm run check`（规范引用 + 执行清单同步 + 幽灵依赖 + 知识库事实核查）
- 涉及页面交互的改动 → 用 Edge 无头模式实际打开页面验证（启动 `npm run dev` 后检查控制台 0 错误与关键交互）
- 知识库有改动 → 必须跑 `npm run check:kb`（硬事实核查脚本）
- UI 改动量不大时无需自检流程，除非用户明确要求
- 验证结果记录在方案目录 `checklist.md`

**提交门禁**：

- 遵循 §7 Git 规范；一次提交对应一个需求点
- **不自动提交**，改动保留在工作区供审查，仅在用户明确要求时提交与 push

**文档同步门禁**：

- 行为或结构变化 → 同步 `docs/knowledge/` 的对应文档（架构 / 数据模型 / 引擎 / 许可）
- 数据分发方式或许可相关变更 → 同步 `SOURCES.md` 与 `src/data/copyright.js`
- 需求方案与验证记录 → 归档在 `docs/designs/{YYYY-MM-DD}-{功能简称}/`

**新增功能 Checklist**（必须覆盖全部相关维度）：

1. 核心代码目录
2. 样式目录（如需）
3. 前端脚本（如需）
4. `docs/` — 方案 + 执行计划 + 测试记录
5. 国际化文案（如需）
6. 知识库（涉及代码/配置/行为变化时）

## 6. 架构总览

> 动代码前先读知识库建立整体认知：`docs/knowledge/README.md`（入口）、`docs/knowledge/architecture.md`（分层与数据流）。

一句话数据流：

```
上游 JSON 数据集（只读）
  └─ scripts/build-db.py ──▶ public/data/vocabulary.sqlite
        └─ src/api/vocabulary.js（sql.js 查询，全站 SQL 只在此层）
              └─ src/composables/useVocabulary.js（loading/error/data）
                    └─ src/views/*（只消费数据，不写 SQL）

用户操作（标记 / 设置）
  └─ src/stores/{progress,settings}.js（Pinia）
        └─ src/utils/storage.js（localStorage，schema 版本 + 防抖 + 容错）

朗读请求
  └─ src/composables/useSpeech.js（播放态 / 错误 / 打断）
        └─ src/utils/speech.js（浏览器内置语音包；设置页只列韩语语音）
```

语音合成、许可、数据字段的权威说明见 `docs/knowledge/speech.md`、`docs/knowledge/sources-and-license.md`、`docs/knowledge/data-model.md`。

## 7. Git 规范

使用 Conventional Commits：`<type>(<scope>): <description>`

| Type       | 说明            |
| ---------- | --------------- |
| `feat`     | 新功能          |
| `fix`      | Bug 修复        |
| `refactor` | 重构            |
| `perf`     | 性能优化        |
| `style`    | 样式修改        |
| `docs`     | 文档更新        |
| `chore`    | 构建/依赖等杂项 |
| `content`  | 内容维护        |
| `release`  | 发版提交        |

- 一次提交对应一个需求点；逻辑相似可合并
- 合并代码时把 PR 标题改为 Conventional Commits 格式，不保留默认 `Merge ...` 标题
- 每个需求完成后不自动提交，改动保留在工作区供审查

## 8. 发版规范

> 按需启用。自动化发版：先在 `CHANGELOG.md` 准备非空章节 → 脚本校验并更新版本号 → CI 自动发布。

- **版本号推导**（自上一 tag）：仅 fix/perf/style → patch；含 feat/refactor → minor；大型重构/ Breaking → major
- **CHANGELOG**：先写入 `## <version>` 非空章节
- **提交登记**：自上一 tag 起涉及行为变化的提交须在 `VERIFICATION.md` 登记短 SHA
- **确认**：向用户列出版本号和变更摘要，等待确认
- **执行**：`npm run release:dry` 预演通过后正式发版

## 9. 关键约束

**架构边界**

- **无后端假设**：词库以静态 SQLite 文件随站分发；学习进度与设置只存 localStorage，禁止引入任何服务端调用、账号体系或云同步
- **数据只读**：不改写词条内容或复核状态，只做 JSON → SQLite 的格式转换；数据缺失要如实展示，不臆造释义
- 不引入新的构建系统或框架：Vite + Vue 3 + Element Plus + Pinia 的组合不再叠加（如 Nuxt、Vuex、Tailwind 等）
- 不启用 TypeScript：现有代码为纯 JavaScript，避免部分迁移造成两套风格

**易踩的坑（改这些位置前务必先读）**

- `vite.config.js` 中 `sql.js` 的 alias **不可删除**：该包 `exports.browser` 指向 UMD 构建（无 default 导出），会让 Vite 的 ESM interop 报错；指向 `dist/sql-wasm.js` 才能正常加载
- `src/api/vocabulary.js` 的 `resolveSqlJsInit()` 兼容 default / 具名 `Module` / 命名空间三种导出形态，不要简化成 `import initSqlJs from "sql.js"`
- `postinstall` 脚本 `scripts/copy-wasm.mjs` 负责把 `sql-wasm.wasm` 复制到 `public/data/`；删除它会导致运行时找不到 wasm
- `public/data/vocabulary.sqlite` 与 `public/data/sql-wasm.wasm` 是构建期生成物（已 gitignore），新克隆仓库须先跑 `npm install`（触发 wasm 复制）与 `python scripts/build-db.py`

**发音实现**

- 固定使用浏览器内置语音包（Web Speech API），实现在 `src/utils/speech.js` 单模块内；**不引入**任何 TTS SDK 或在线语音接口
- 设置页只列「支持韩语」的系统语音（`listKoreanVoices()` 按 `lang` 前缀 `ko` 过滤）；中文 / 英文释义复用系统对应语言的语音包
- 发音参数（语速 / 音高 / 音色）由 `src/stores/settings.js` 持有，视图不得直接调用 `speechSynthesis`

**许可与版权**

- 版权、署名字符串的**单一来源**是 `src/data/copyright.js`，页面不得硬编码许可文案
- **页脚只放版权与版本**（`© {years} {holder} · v{version}`，版权人显示名为「奚叔2099」，
  名称指向其主页 `PROJECT.homepage`）；
  数据集署名与许可说明集中在设置页「关于」、`LICENSE`、`SOURCES.md` 与 `LICENSES/`（满足 CC BY-SA 3.0 署名要求）
- 不得加入教材课文、例句、练习、音频、扫描页等受版权保护内容

**兼容性**

- 目标浏览器：Chrome / Edge ≥ 90、Firefox ≥ 90、Safari ≥ 15；使用 `-webkit-` 前缀覆盖 Safari 缺失的 `backdrop-filter`、`user-select` 等
- 发音依赖操作系统语音包：未装韩语语音包或浏览器不支持 Web Speech API 时，须给出可操作提示（安装语音包 / 更换浏览器），不静默失败

**验证方式**

- 浏览器验证统一使用 Edge 无头模式（`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`），不引入 Playwright / Puppeteer 等测试依赖
- 每次涉及代码的改动后至少跑一次 `npm run build`，并在方案目录的 `checklist.md` 记录结果

## 10. Issue 处理

- 调查 issue 后先询问用户是否回复，确认后再发出
- 修复的 issue 打 `resolved` 标签由 CI 自动关闭，agent 不直接 close

---

<!-- PATH-CHECK: src/ scripts/ docs/ ci/ -->
<!-- 上面一行用于 ci/check-spec-refs.cjs 的路径存在性检查：列出本项目真实存在的目录前缀（空格分隔），
     脚本会校验这些目录下的反引号路径是否真实存在。默认留空（不检查），
     待你填好 §2 目录映射后，把对应前缀填进来即可启用，例如：src/ lib/ scripts/ docs/ -->
