/**
 * 学习进度 store。
 *
 * 每条词条可有三种标记：已掌握 / 学习中 / 收藏。
 * 数据仅保存在浏览器 localStorage（无后端），结构：
 *   { marks: { [entryId]: { m: "known"|"learning"|"starred", t: 时间戳 } } }
 */

import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import {
	createDebouncedSaver,
	downloadJSON,
	readJSON,
	removeJSON,
	writeJSON,
} from "@/utils/storage";

const STORAGE_NAME = "progress";

/** 学习标记枚举 */
export const MARK = {
	KNOWN: "known",
	LEARNING: "learning",
	STARRED: "starred",
};

const VALID_MARKS = new Set(Object.values(MARK));

function createInitialProgress() {
	return { marks: {}, updatedAt: Date.now() };
}

/** 容错迁移：剔除非法标记，避免脏数据导致统计错乱 */
function migrate(raw) {
	const base = createInitialProgress();
	if (!raw || typeof raw !== "object") return base;
	const marks = {};
	if (raw.marks && typeof raw.marks === "object") {
		for (const [entryId, record] of Object.entries(raw.marks)) {
			const mark = record?.m;
			if (typeof entryId === "string" && VALID_MARKS.has(mark)) {
				marks[entryId] = {
					m: mark,
					t: Number(record?.t) || Date.now(),
				};
			}
		}
	}
	return { marks, updatedAt: Date.now() };
}

export const useProgressStore = defineStore("progress", () => {
	const state = ref(migrate(readJSON(STORAGE_NAME, null)));

	const saver = createDebouncedSaver(
		(value) => writeJSON(STORAGE_NAME, value),
		200,
	);
	watch(state, (value) => saver.schedule(value), { deep: true });

	const marks = computed(() => state.value.marks);
	const totalMarked = computed(() => Object.keys(state.value.marks).length);

	function getMark(entryId) {
		return state.value.marks[entryId]?.m ?? null;
	}

	function setMark(entryId, mark) {
		if (!entryId) return;
		if (mark === null) delete state.value.marks[entryId];
		else if (VALID_MARKS.has(mark)) {
			state.value.marks[entryId] = { m: mark, t: Date.now() };
		}
	}

	/** 再次点击同一标记即取消（符合学习打卡的心智模型） */
	function toggleMark(entryId, mark) {
		setMark(entryId, getMark(entryId) === mark ? null : mark);
	}

	/**
	 * 统计一组词条的标记情况。
	 * 在 computed 中调用即可获得响应式统计。
	 */
	function countMarks(entryIds = []) {
		let known = 0;
		let learning = 0;
		let starred = 0;
		let touched = 0;
		for (const entryId of entryIds) {
			const mark = state.value.marks[entryId]?.m;
			if (!mark) continue;
			touched += 1;
			if (mark === MARK.KNOWN) known += 1;
			else if (mark === MARK.LEARNING) learning += 1;
			else if (mark === MARK.STARRED) starred += 1;
		}
		return { known, learning, starred, touched };
	}

	/** 清空全部进度（设置页"重置"按钮） */
	function reset() {
		state.value = createInitialProgress();
		removeJSON(STORAGE_NAME);
	}

	/** 导出进度为 JSON 文件，便于手动备份或迁移 */
	function exportToFile(filename = "korean-learn-progress.json") {
		downloadJSON(filename, {
			exportedAt: new Date().toISOString(),
			marks: state.value.marks,
		});
	}

	return {
		state,
		marks,
		totalMarked,
		getMark,
		setMark,
		toggleMark,
		countMarks,
		reset,
		exportToFile,
	};
});
