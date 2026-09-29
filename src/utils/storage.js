/**
 * localStorage 持久化封装。
 *
 * 本项目无后端，学习进度与设置全部留在浏览器本地（见 AGENTS.md §9）。
 * 统一提供：key 前缀 + schema 版本、容错读取（损坏即回退默认值）、
 * 防抖写入（连续标记单词时合并落盘）。任何情况下不抛异常。
 */

export const STORAGE_PREFIX = "korean-learn";

/** 存储 schema 版本；结构变更时递增，旧数据由各 store 的 migrate 兜底 */
export const SCHEMA_VERSION = 1;

/** 生成带版本号的存储键 */
export function storageKey(name, version = SCHEMA_VERSION) {
	return `${STORAGE_PREFIX}:${name}:v${version}`;
}

/**
 * 读取并解析 JSON 对象。
 * 无数据、JSON 损坏、隐私模式禁用存储时一律返回 fallback。
 */
export function readJSON(name, fallback) {
	try {
		const raw = window.localStorage.getItem(storageKey(name));
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : fallback;
	} catch (error) {
		console.warn(
			`[korean-learn] 读取本地数据失败（${name}），已使用默认值：`,
			error,
		);
		return fallback;
	}
}

/** 写入 JSON；失败（配额不足/无权限）返回 false 而不抛出 */
export function writeJSON(name, value) {
	try {
		window.localStorage.setItem(storageKey(name), JSON.stringify(value));
		return true;
	} catch (error) {
		console.warn(`[korean-learn] 保存本地数据失败（${name}）：`, error);
		return false;
	}
}

/** 删除某一项存储（用于"重置进度"） */
export function removeJSON(name) {
	try {
		window.localStorage.removeItem(storageKey(name));
	} catch {
		/* 无存储权限时无需处理 */
	}
}

/**
 * 防抖保存器：把高频变更合并为一次落盘。
 * @param {(value: any) => void} save 实际写入函数
 * @param {number} delay 防抖毫秒数
 */
export function createDebouncedSaver(save, delay = 200) {
	let timer = null;
	return {
		schedule(value) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				save(value);
			}, delay);
		},
		/** 立即写入并取消待执行的防抖任务（页面卸载时使用） */
		flush(value) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			save(value);
		},
	};
}

/** 触发浏览器下载 JSON 文件（用于导出学习进度） */
export function downloadJSON(filename, data) {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
