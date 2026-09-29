# 语音合成

## 设计目标

发音是本站核心能力，实现上**只使用浏览器内置语音包**（Web Speech API）：

- 完全离线，无请求配额、无密钥、零外部依赖
- 音色与可用语言取决于操作系统已安装的语音包
- 站点以韩语发音为主，设置页只列出**支持韩语**的语音供挑选；中文 / 英文释义复用系统对应语言的语音包

## 实现

单模块 `src/utils/speech.js`，对外只暴露少量函数：

| 导出                         | 作用                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| `PRIMARY_LANG`               | 站点主体语言（`ko-KR`）                                         |
| `isSupported()`              | 当前环境是否支持内置语音合成                                    |
| `waitForVoices(timeout)`     | 等待语音列表就绪（Chrome 首次返回空数组，需等 `voiceschanged`） |
| `listKoreanVoices()`         | 列出系统语音中支持韩语的选项（设置页用）                        |
| `hasKoreanVoice()`           | 是否装有可用的韩语语音                                          |
| `speak(text, lang, options)` | 朗读，返回 `Promise<void>`                                      |
| `stop()`                     | 停止当前朗读                                                    |

调用链：

```
视图 / WordCard
  → src/composables/useSpeech.js   speakText()：维护播放态、错误、切换时打断
  → src/utils/speech.js            speak()：挑选语音并朗读
```

```text
FILE: src/utils/speech.js
FILE: src/composables/useSpeech.js
SYMBOL: src/utils/speech.js::PRIMARY_LANG
SYMBOL: src/utils/speech.js::isSupported
SYMBOL: src/utils/speech.js::waitForVoices
SYMBOL: src/utils/speech.js::listKoreanVoices
SYMBOL: src/utils/speech.js::speak
SYMBOL: src/utils/speech.js::pickVoice
SYMBOL: src/composables/useSpeech.js::useSpeech
```

## 语音挑选规则

`pickVoice(lang, voiceURI)` 的优先级依次为：

1. 用户在设置页选定的 `voiceURI`（候选只来自韩语语音）
2. 语言精确匹配（如 `zh-CN`）
3. 语言前缀匹配（如 `zh-*` 兜底）

## 韩语语音过滤

`listKoreanVoices()` 以 `voice.lang.toLowerCase().startsWith("ko")` 判定，
可覆盖 `ko-KR`、`ko-KP` 等变体。设置页据此：

- 有韩语语音 → 下拉可选，留空表示由系统默认挑选
- 无韩语语音 → 下拉禁用，并提示在操作系统安装韩语语音包

## 设置项

存于 `src/stores/settings.js`（localStorage `korean-learn:settings:v1`）：

| 字段            | 默认    | 说明                                 |
| --------------- | ------- | ------------------------------------ |
| `rate`          | `0.9`   | 语速（学习场景默认放慢，便于跟读）   |
| `pitch`         | `1`     | 音高                                 |
| `voiceURI`      | `""`    | 选定的韩语语音；空串=系统默认挑选    |
| `autoSpeak`     | `true`  | 切词后自动朗读韩语                   |
| `showEnglish`   | `true`  | 是否显示英文释义                     |
| `showEtymology` | `false` | 是否显示词源（默认关，专注词汇本身） |

> 早期版本曾支持「在线 TTS（URL 模板）」与「自定义服务」，对应 `engineId` /
> `customUrlTemplate` 两个设置字段。现固定为内置语音包，`migrate()` 会自然丢弃这两个字段。

```text
SYMBOL: src/stores/settings.js::useSettingsStore
SYMBOL: src/stores/settings.js::createInitialSettings
```

## 已知限制与排查

| 现象               | 原因                           | 处理                                                                          |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------- |
| 完全没有发音       | 浏览器不支持 Web Speech API    | 学习页与设置页给出提示，建议改用 Chrome / Edge / Safari 较新版本              |
| 韩语无声但中英正常 | 系统未安装韩语语音包           | 设置页「韩语语音」处提示安装（Windows 通常为 Microsoft Heami，macOS 为 Yuna） |
| 首次进入不自动发音 | 浏览器自动播放策略要求用户手势 | 设计如此：仅在用户切词后自动朗读                                              |
| Chrome 首帧无声    | `getVoices()` 首次返回空数组   | `waitForVoices()` 等 `voiceschanged` 事件并设超时兜底                         |
| 切词后仍有旧音     | 上一段朗读尚未结束             | `speak()` 前先 `cancel()`；`useSpeech` 切词时主动 `stop()`                    |
