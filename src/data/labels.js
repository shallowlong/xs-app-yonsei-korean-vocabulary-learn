/**
 * 数据字段的展示映射 —— 词源、词性、复核状态、册次名称。
 * 页面只引用本文件，不硬编码中文标签（见 AGENTS.md §4）。
 */

/** 词源类型（对应 SQLite entries.origin_type） */
export const ORIGIN_LABELS = {
	hanja: "汉字词",
	native: "固有词",
	loanword: "外来词",
	hybrid: "混合词",
	expression: "搭配表达",
	grammar: "语法形式",
	unknown: "待核",
};

/** 词源说明（设置页可开启"显示词源"后展示） */
export const ORIGIN_TIPS = {
	hanja: "源自汉字的韩语词汇，可借助汉字音义记忆",
	native: "韩语固有词，通常没有对应汉字",
	loanword: "源自外语（多为英语）的词汇",
	hybrid: "由不同来源构件组成的词",
	expression: "固定搭配、句型或完整表达",
	grammar: "助词、词尾等语法成分",
	unknown: "词源仍待核对",
};

/** 词源标签类型 → Element Plus el-tag 的 type（控制配色语义） */
export const ORIGIN_TAG_TYPE = {
	hanja: "primary",
	native: "success",
	loanword: "warning",
	hybrid: "info",
	expression: "info",
	grammar: "info",
	unknown: "danger",
};

/** 条目类型（对应 entries.entry_kind） */
export const KIND_LABELS = {
	lexeme: "单词",
	expression: "表达",
	grammar: "语法",
};

/** 复核状态（对应 entries.review_status），用于诚实标注数据可信度 */
export const REVIEW_LABELS = {
	verified: "已复核",
	high: "高置信",
	medium: "中置信",
	low: "低置信",
	needs_review: "待复核",
};

export const REVIEW_TAG_TYPE = {
	verified: "success",
	high: "success",
	medium: "warning",
	low: "info",
	needs_review: "danger",
};

/** 学习标记状态（对应 stores/progress.js 的 MARK） */
export const MARK_LABELS = {
	known: "已掌握",
	learning: "学习中",
	starred: "收藏",
};

/** 册次中文名 */
export const VOLUME_NAMES_ZH = {
	1: "第一册",
	2: "第二册",
	3: "第三册",
	4: "第四册",
	5: "第五册",
	6: "第六册",
};

/** 册次韩文名 */
export const VOLUME_NAMES_KO = {
	1: "제1권",
	2: "제2권",
	3: "제3권",
	4: "제4권",
	5: "제5권",
	6: "제6권",
};

/** 取词源标签，未知类型回退安全值 */
export function originLabel(type) {
	return ORIGIN_LABELS[type] ?? ORIGIN_LABELS.unknown;
}

export function originTagType(type) {
	return ORIGIN_TAG_TYPE[type] ?? ORIGIN_TAG_TYPE.unknown;
}
