/**
 * 版权与数据署名 —— 页面统一从这里读取，避免各处散落文案（见 AGENTS.md §9）。
 *
 * 许可要点（双许可结构，详见 SOURCES.md 与 LICENSES/）：
 *   - 本仓库原创前端代码：MIT
 *   - 嵌入的词汇数据集（vocabulary.sqlite）：CC BY-SA 3.0
 *     （来自 Open Yonsei Korean Vocabulary，再分发需保留署名 + 同协议共享）
 */

export const DATASET = {
	name: "Open Yonsei Korean Vocabulary",
	/** 数据集版本，随上游发布更新 */
	version: "0.1.0",
	license: "CC BY-SA 3.0",
	/** 记录数，用于页脚与关于信息 */
	entryCount: 4445,
	volumeCount: 6,
	/** 上游仓库 */
	repo: "https://github.com/Amulopapa67/open-yonsei-korean-vocabulary",
	/** 建议署名文本（再分发时使用） */
	attribution:
		'Open Yonsei Korean Vocabulary contributors, "Open Yonsei Korean Vocabulary dataset", version 0.1.0, CC BY-SA 3.0.',
};

export const PROJECT = {
	name: "xs-app-korean-learn",
	license: "MIT",
	/** 页面上展示的版权人名称（LICENSE 中的法定主体为 XISHU） */
	holder: "奚叔2099",
	/** 版权年份区间，与 LICENSE 保持一致 */
	years: "2025-2026",
	/** 版权人主页（页脚版权名指向此处） */
	homepage: "https://xishu2099.top",
	/** 与教材出版方的关系声明：非官方，仅索引词表 */
	disclaimer:
		"本项目与延世大学及其韩国语学堂无隶属、赞助或背书关系；名称仅用于说明所索引的教材系列。",
};
