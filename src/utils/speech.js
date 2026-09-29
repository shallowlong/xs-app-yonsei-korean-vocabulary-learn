/**
 * 语音合成模块 —— 仅使用浏览器内置语音包（Web Speech API）。
 *
 * 特点：完全离线、无请求配额、零外部依赖。音色与可用语言取决于操作系统
 * 已安装的语音包；本站以**韩语**发音为主，设置页只列出支持韩语的语音，
 * 中文 / 英文释义仍复用系统对应的语音包朗读。
 */

/** 站点朗读的主体语言（韩语） */
export const PRIMARY_LANG = "ko-KR";

let voicesCache = [];
let voicePromise = null;

/** 当前环境是否支持内置语音合成 */
export function isSupported() {
	return (
		typeof window !== "undefined" &&
		"speechSynthesis" in window &&
		"SpeechSynthesisUtterance" in window
	);
}

function refreshVoices() {
	if (!isSupported()) return [];
	voicesCache = window.speechSynthesis.getVoices() ?? [];
	return voicesCache;
}

/**
 * 等待语音列表就绪。
 * Chrome 的 getVoices() 首次调用常返回空数组，须等待 voiceschanged 事件；
 * 加超时兜底，避免在未安装语音包的环境下永久挂起。
 */
export function waitForVoices(timeout = 1200) {
	if (!isSupported()) return Promise.resolve([]);
	const immediate = refreshVoices();
	if (immediate.length) return Promise.resolve(immediate);
	if (voicePromise) return voicePromise;

	voicePromise = new Promise((resolve) => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			window.speechSynthesis.removeEventListener?.(
				"voiceschanged",
				finish,
			);
			resolve(refreshVoices());
		};
		window.speechSynthesis.addEventListener?.("voiceschanged", finish);
		setTimeout(finish, timeout);
	});
	return voicePromise;
}

/**
 * 列出系统语音中「支持韩语」的选项（设置页挑选音色用）。
 * 判定依据为 lang 以 ko 开头，可覆盖 ko-KR / ko-KP 等变体。
 */
export async function listKoreanVoices() {
	const voices = await waitForVoices();
	return voices
		.filter((voice) => voice.lang.toLowerCase().startsWith("ko"))
		.map((voice) => ({
			uri: voice.voiceURI,
			name: voice.name,
			lang: voice.lang,
			local: voice.localService,
		}));
}

/** 系统是否装有可用的韩语语音（用于给出可操作的提示） */
export async function hasKoreanVoice() {
	return (await listKoreanVoices()).length > 0;
}

/**
 * 挑选朗读语音：优先用户选定的韩语语音，其次精确匹配语言，最后按语言前缀匹配
 * （例如 zh-CN 缺失时回退到任意 zh-* 语音）。
 */
function pickVoice(lang, voiceURI) {
	const voices = voicesCache.length ? voicesCache : refreshVoices();
	if (voiceURI) {
		const selected = voices.find((voice) => voice.voiceURI === voiceURI);
		if (selected) return selected;
	}
	const lower = lang.toLowerCase();
	const prefix = lower.split("-")[0];
	return (
		voices.find((voice) => voice.lang.toLowerCase() === lower) ??
		voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ??
		null
	);
}

/**
 * 朗读文本。
 * @param {string} text 要朗读的内容
 * @param {string} lang BCP-47 语言标签（ko-KR / zh-CN / en-US）
 * @param {{rate?: number, pitch?: number, voiceURI?: string}} options
 * @returns {Promise<void>} 朗读结束时 resolve
 */
export function speak(
	text,
	lang,
	{ rate = 0.9, pitch = 1, voiceURI = "" } = {},
) {
	return new Promise((resolve, reject) => {
		if (!isSupported()) {
			reject(new Error("当前浏览器不支持内置语音合成（Web Speech API）"));
			return;
		}
		const content = (text ?? "").trim();
		if (!content) {
			resolve();
			return;
		}

		const synth = window.speechSynthesis;
		// Chrome 需要先 cancel 才能可靠触发新的朗读
		synth.cancel();

		const utterance = new SpeechSynthesisUtterance(content);
		utterance.lang = lang;
		utterance.rate = rate;
		utterance.pitch = pitch;
		const voice = pickVoice(lang, voiceURI);
		if (voice) utterance.voice = voice;

		utterance.onend = () => resolve();
		utterance.onerror = (event) => {
			// 主动 stop() 会触发 canceled/interrupted，不算错误
			if (event.error === "canceled" || event.error === "interrupted") {
				resolve();
			} else {
				reject(new Error(`语音朗读失败：${event.error || "unknown"}`));
			}
		};

		// 轻微延迟规避部分浏览器 cancel() 后立即 speak() 的竞态
		setTimeout(() => synth.speak(utterance), 60);
	});
}

/** 停止当前朗读 */
export function stop() {
	if (isSupported()) window.speechSynthesis.cancel();
}
