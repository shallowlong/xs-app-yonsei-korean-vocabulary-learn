# 方案：版本管理、页脚瘦身、语音配置收敛与标题更名

日期：2026-09-29
状态：已实施

## 背景与问题

首版（v0.1.0）交付后，用户提出五项调整，集中在「版本可管理、页面更聚焦、配置更简单」：

1. 缺少正式的版本管理机制（版本号停在 `0.1.0`，无 CHANGELOG）
2. 页脚信息过杂（版本 + 代码许可 + 数据集许可 + 数据来源链接），喧宾夺主
3. 设置页把「发音引擎」与「引擎参数」拆成两张卡片，且暴露了三个引擎（在线 TTS、自定义服务）
   与全部系统语音——实际只需要浏览器内置语音包，且应只列支持韩语的音色
4. 站名 `韩语词汇发音学习` 未体现教材系列，与数据来源不一致
5. **布局缺陷**：首页内容不足一屏时页脚不贴底

## 技术方案

### 1. 版本管理（`npm version`）

- `package.json` 版本号 `0.1.0` → **`1.0.0`**
- 新增 `CHANGELOG.md`（记录 1.0.0 首个正式版本的完整能力清单）
- 复用既有机制：`preversion` → `npm run verify`（format:check + build + 四项规范校验），
  发版规则见 `AGENTS.md` §8；版本号在构建时经 `__APP_VERSION__` 注入，页面**不硬编码**
- 升级流程：`npm version patch|minor|major`（自动跑 verify、改版本号、打 tag）

### 2. 页脚瘦身

`AppFooter.vue` 从「版本 + 双许可 + 数据来源链接」改为**仅版权与版本**：

```
© 2025-2026 奚叔2099 · v1.0.0
```

- 版权人显示名「奚叔2099」与年份区间写入 `src/data/copyright.js` 的 `PROJECT.holder` / `PROJECT.years`
  （`LICENSE` 中的法定主体仍是 XISHU）
- 样式改为 `text-align: center`，移除不再使用的 `.footer .row` 规则
- **合规性**：CC BY-SA 3.0 要求署名，但不限定位置。数据集署名与许可说明仍保留在
  **设置页「关于」**、`LICENSE`、`SOURCES.md`、`LICENSES/`、`README.md`、`package.json`、
  `index.html` meta、`src/data/copyright.js` 等 9 处，满足署名要求（见
  `docs/knowledge/sources-and-license.md`）

### 3. 语音引擎配置收敛为「浏览器内置语音包」

设置页原先的「发音引擎」（三选一）+「引擎参数」两张卡片 → **合并为一张「语音引擎配置」**，
内含语速、音高、韩语语音、试听四项。

代码层面的收敛（同步拆除已无用的抽象）：

| 变化                                 | 说明                                                             |
| ------------------------------------ | ---------------------------------------------------------------- |
| 删除 `src/data/engines.js`           | 单引擎后不再需要引擎注册表                                       |
| 删除 `src/utils/speech/`（3 文件）   | 合并为单模块 `src/utils/speech.js`                               |
| 删除 `src/utils/speech/urlSpeech.js` | 在线 URL 模板引擎整体移除                                        |
| `stores/settings.js`                 | 移除 `engineId`、`customUrlTemplate`；`migrate()` 自然丢弃旧字段 |
| `composables/useSpeech.js`           | `engineStatus` → `supported`（环境能力判定）                     |
| `views/StudyView.vue`                | 不可用提示改为"浏览器不支持语音合成"，去掉"前往设置更换引擎"     |
| `styles/app.css`                     | 删除 `.engine-option` / `.engine-name` / `.engine-desc` 样式     |

**韩语语音过滤**：新增 `listKoreanVoices()`，以 `voice.lang.toLowerCase().startsWith("ko")` 判定，
覆盖 `ko-KR` / `ko-KP` 等变体；设置页下拉只列这些语音，未检测到时禁用下拉并给出安装指引
（Windows 为 Microsoft Heami，macOS 为 Yuna）。中文 / 英文释义仍复用系统对应语言的语音包。

### 4. 网站更名

统一为 **「延世韩国语词汇发音练习」**：

- `src/data/appMeta.js` 的 `APP_NAME`（顶栏品牌 + `document.title` 前缀）
- `APP_TAGLINE` → `1–6 册 · 韩 / 中 / 英 · 4,445 条词条`
- `index.html` 的 `<title>`

### 5. 页脚贴底修复（根因 + 修法）

**根因**：重构时 `app.css` 丢失了 `#app` 的 flex 布局，`.main` 改用硬编码
`min-height: calc(100vh - var(--appbar-h) - 92px)` 估算撑高；`92px` 是页脚高度的猜测值，
页脚内容变短后该值失准，内容不足一屏时页脚便浮在中间。

**修法**（标准 sticky footer）：恢复根容器纵向 flex，让内容区吃掉剩余空间：

```css
#app {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

.main {
	flex: 1;
	padding: 22px 0 56px;
}
```

## 影响范围

- **新增**：`CHANGELOG.md`、`docs/knowledge/speech.md`（替代 `speech-engines.md`）、本方案目录
- **删除**：`src/data/engines.js`、`src/utils/speech/`（`index.js` / `webSpeech.js` / `urlSpeech.js`）、
  `docs/knowledge/speech-engines.md`
- **新增/改写**：`src/utils/speech.js`、`src/views/SettingsView.vue`（重写）、
  `src/components/AppFooter.vue`、`src/stores/settings.js`、`src/composables/useSpeech.js`
- **局部修改**：`package.json`、`src/data/{appMeta,copyright}.js`、`src/views/StudyView.vue`、
  `src/styles/app.css`、`index.html`、`vite.config.js`（补 `strictPort`）
- **文档同步**：`AGENTS.md`（§1/§2/§6/§9）、`.codebuddy|.trae|.cursor|.claude` 副本、
  `docs/knowledge/{README,architecture,data-model,sources-and-license}.md`、`README.md`
- **破坏性变更**：`settings` 存储结构去掉两个字段（`migrate()` 容错，不影响既有用户）；
  在线 TTS 能力移除（不再可能选择该引擎）

## 可复用资源

- 既有 `npm run verify` 与 `preversion` 钩子（版本管理直接复用，无需新脚本）
- `src/data/copyright.js` 作为版权文案单一来源（新增 `holder` / `years` 字段即可）
- `AGENTS.md` §8 的发版规范、§5 的验证门禁

## 需同步文档

- [x] `AGENTS.md`（§1 职责、§2 目录映射、§6 数据流、§9 发音实现与页脚署名条款）
- [x] `docs/knowledge/speech.md`（重写）+ `README.md` 索引
- [x] `docs/knowledge/architecture.md`（目录树、数据流、SYMBOL、引用）
- [x] `docs/knowledge/{data-model,sources-and-license}.md`（措辞）
- [x] `README.md`（站名、特性、技术栈、结构、语音合成章节、兼容性、页脚说明）
- [x] `CHANGELOG.md`（新增）
- [x] 本方案三件套
