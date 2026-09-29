/**
 * 发音 composable —— 视图通过它朗读文本。
 * 统一处理：播放中状态、错误提示、切换时打断上一次朗读。
 * 底层固定为浏览器内置语音包（见 utils/speech.js）。
 */

import { onUnmounted, ref } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { isSupported, speak, stop } from "@/utils/speech";

export function useSpeech() {
	const settings = useSettingsStore();

	/** 环境能力：运行期不会变化，一次性求值即可 */
	const supported = isSupported();

	/** 是否正在播放 */
	const playing = ref(false);
	/** 正在播放的语言（用于给对应按钮加播放态，空串表示无） */
	const playingLang = ref("");
	/** 最近一次朗读的错误信息（供页面提示） */
	const error = ref("");

	/**
	 * 朗读文本。
	 * @param {string} text
	 * @param {string} lang BCP-47 语言标签（ko-KR / zh-CN / en-US）
	 */
	async function speakText(text, lang) {
		const content = (text ?? "").trim();
		if (!content) return;

		error.value = "";
		try {
			stop();
			playing.value = true;
			playingLang.value = lang;
			await speak(content, lang, {
				rate: settings.state.rate,
				pitch: settings.state.pitch,
				voiceURI: settings.state.voiceURI,
			});
		} catch (e) {
			error.value = e?.message ?? String(e);
		} finally {
			playing.value = false;
			playingLang.value = "";
		}
	}

	function stopSpeaking() {
		stop();
		playing.value = false;
		playingLang.value = "";
	}

	// 离开页面时停止播放，避免路由切换后继续发声
	onUnmounted(stopSpeaking);

	return {
		settings,
		supported,
		playing,
		playingLang,
		error,
		speakText,
		stopSpeaking,
	};
}
