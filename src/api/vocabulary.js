/**
 * 词汇数据访问层 —— 用 sql.js（WebAssembly SQLite）读取 `public/data/vocabulary.sqlite`。
 *
 * 数据库由 `scripts/build-db.py` 从上游 JSON 数据集生成（见 docs/knowledge/data-model.md）。
 * 全站数据在此层集中查询，视图不直接写 SQL。
 */

import * as sqlJsModule from "sql.js";

/**
 * sql.js 以 UMD/CJS 形式发布，经 Vite 依赖预构建后导出形态可能是
 * default / 具名 Module / 命名空间三者之一，这里统一解析。
 */
function resolveSqlJsInit() {
	if (typeof sqlJsModule.default === "function") return sqlJsModule.default;
	if (typeof sqlJsModule.Module === "function") return sqlJsModule.Module;
	if (typeof sqlJsModule === "function") return sqlJsModule;
	throw new Error("无法解析 sql.js 初始化函数");
}

const BASE = import.meta.env.BASE_URL; // "./" 或 "/"

let db = null;
let initPromise = null;

/** 初始化数据库（幂等，多次调用共享同一个 Promise） */
export function initDatabase() {
	if (!initPromise) {
		initPromise = (async () => {
			const initSqlJs = resolveSqlJsInit();
			const SQL = await initSqlJs({
				locateFile: (file) => `${BASE}data/${file}`,
			});
			const response = await fetch(`${BASE}data/vocabulary.sqlite`);
			if (!response.ok) {
				throw new Error(`词库加载失败（HTTP ${response.status}）`);
			}
			const buffer = await response.arrayBuffer();
			db = new SQL.Database(new Uint8Array(buffer));
			return db;
		})();
	}
	return initPromise;
}

export function isReady() {
	return db !== null;
}

/** 执行查询并返回对象数组 */
export function query(sql, params = []) {
	if (!db) throw new Error("数据库尚未初始化，请先调用 initDatabase()");
	const statement = db.prepare(sql);
	try {
		statement.bind(params);
		const rows = [];
		while (statement.step()) rows.push(statement.getAsObject());
		return rows;
	} finally {
		statement.free();
	}
}

/** 执行查询并返回首行（无结果返回 null） */
export function queryOne(sql, params = []) {
	return query(sql, params)[0] ?? null;
}

/* === 面向业务的查询 === */

/** 全部册次（含词条数、主题色、每章单元数） */
export function getVolumes() {
	return query("SELECT * FROM volumes ORDER BY volume");
}

export function getVolume(volume) {
	return queryOne("SELECT * FROM volumes WHERE volume = ?", [Number(volume)]);
}

/** 某一册的全部课次（含每课词条数） */
export function getChapters(volume) {
	return query(
		`SELECT c.*,
            (SELECT COUNT(*) FROM entries e
              WHERE e.volume = c.volume AND e.chapter = c.chapter) AS entry_count
       FROM chapters c
      WHERE c.volume = ?
      ORDER BY c.chapter`,
		[Number(volume)],
	);
}

export function getChapter(volume, chapter) {
	return queryOne("SELECT * FROM chapters WHERE volume = ? AND chapter = ?", [
		Number(volume),
		Number(chapter),
	]);
}

/** 某一课的词条，按单元与原始顺序排列 */
export function getEntries(volume, chapter) {
	return query(
		`SELECT * FROM entries
      WHERE volume = ? AND chapter = ?
      ORDER BY unit, sequence, source_order`,
		[Number(volume), Number(chapter)],
	);
}

/**
 * 全库 entry_id 按册次分组：{ [volume]: string[] }
 * 首页需要为每册计算学习进度，一次查询比逐册查询更省开销。
 */
export function getEntryIdsByVolume() {
	const rows = query(
		"SELECT volume, entry_id FROM entries ORDER BY volume, chapter, unit, sequence",
	);
	const grouped = {};
	for (const row of rows) {
		(grouped[row.volume] ??= []).push(row.entry_id);
	}
	return grouped;
}

/** 一册内 entry_id 按课次分组：{ [chapter]: string[] } */
export function getEntryIdsByChapter(volume) {
	const rows = query(
		`SELECT chapter, entry_id FROM entries
      WHERE volume = ?
      ORDER BY chapter, unit, sequence`,
		[Number(volume)],
	);
	const grouped = {};
	for (const row of rows) {
		(grouped[row.chapter] ??= []).push(row.entry_id);
	}
	return grouped;
}

/** 全库统计（首页概览用） */
export function getCorpusStats() {
	const row = queryOne(
		`SELECT COUNT(*) AS entries,
            COUNT(DISTINCT volume) AS volumes,
            COUNT(DISTINCT volume || '-' || chapter) AS chapters,
            SUM(CASE WHEN pronunciation IS NOT NULL AND pronunciation <> '' THEN 1 ELSE 0 END) AS with_pronunciation
       FROM entries`,
	);
	return {
		entries: row?.entries ?? 0,
		volumes: row?.volumes ?? 0,
		chapters: row?.chapters ?? 0,
		withPronunciation: row?.with_pronunciation ?? 0,
	};
}
