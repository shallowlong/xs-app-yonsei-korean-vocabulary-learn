/**
 * 学习偏好设置 store（语音参数 + 页面显示偏好）。
 * 持久化到 localStorage，结构变更请递增 storage 的 SCHEMA_VERSION 并补 migrate。
 *
 * 发音固定使用浏览器内置语音包（见 docs/knowledge/speech.md），
 * 因此不再有「引擎选择」项，只保留语速、音高与韩语音色。
 */

import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { createDebouncedSaver, readJSON, writeJSON } from "@/utils/storage";

const STORAGE_NAME = "settings";

function clampNumber(value, min, max, fallback) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(max, Math.max(min, parsed));
}

/** 默认设置：稍慢语速，优先保证开箱可用于跟读 */
export function createInitialSettings() {
	return {
		/** 语速（学习场景默认放慢，便于跟读模仿） */
		rate: 0.9,
		/** 音高 */
		pitch: 1,
		/** 选定的韩语语音 voiceURI；空串表示由系统默认挑选 */
		voiceURI: "",
		/** 切换单词后自动朗读韩语 */
		autoSpeak: true,
		/** 页面是否显示英文释义 */
		showEnglish: true,
		/** 页面是否显示词源信息（默认关闭，专注词汇本身） */
		showEtymology: false,
	};
}

/**
 * 容错迁移：字段缺失或类型异常一律回退默认值。
 * 旧版本遗留的 engineId / customUrlTemplate 会被自然丢弃（发音已固定为内置语音）。
 */
function migrate(raw) {
	const base = createInitialSettings();
	if (!raw || typeof raw !== "object") return base;
	return {
		rate: clampNumber(raw.rate, 0.5, 1.5, base.rate),
		pitch: clampNumber(raw.pitch, 0.5, 2, base.pitch),
		voiceURI:
			typeof raw.voiceURI === "string" ? raw.voiceURI : base.voiceURI,
		autoSpeak:
			typeof raw.autoSpeak === "boolean" ? raw.autoSpeak : base.autoSpeak,
		showEnglish:
			typeof raw.showEnglish === "boolean"
				? raw.showEnglish
				: base.showEnglish,
		showEtymology:
			typeof raw.showEtymology === "boolean"
				? raw.showEtymology
				: base.showEtymology,
	};
}

export const useSettingsStore = defineStore("settings", () => {
	const state = ref(migrate(readJSON(STORAGE_NAME, null)));

	const saver = createDebouncedSaver(
		(value) => writeJSON(STORAGE_NAME, value),
		200,
	);
	watch(state, (value) => saver.schedule(value), { deep: true });

	function patch(partial) {
		state.value = { ...state.value, ...partial };
	}

	/** 恢复默认设置（语音参数与显示偏好一起重置） */
	function reset() {
		state.value = createInitialSettings();
	}

	return { state, patch, reset };
});
