/**
 * 词汇数据加载 composables —— 统一处理「初始化数据库 → 查询 → loading/error」，
 * 视图只消费结果，不重复写加载样板代码。
 */

import { computed, onMounted, ref } from "vue";
import {
	getChapter,
	getChapters,
	getCorpusStats,
	getEntries,
	getEntryIdsByChapter,
	getEntryIdsByVolume,
	getVolume,
	getVolumes,
	initDatabase,
} from "@/api/vocabulary";
import { useProgressStore } from "@/stores/progress";

/**
 * 通用加载器：挂载时初始化数据库并执行 loader。
 * @param {() => any} loader 同步查询函数
 */
export function useDbData(loader) {
	const loading = ref(true);
	const error = ref("");
	const data = ref(null);

	onMounted(async () => {
		try {
			await initDatabase();
			data.value = loader();
		} catch (e) {
			error.value = e?.message ?? String(e);
		} finally {
			loading.value = false;
		}
	});

	return { loading, error, data };
}

/** 首页：全部册次 + 每册学习进度 */
export function useVolumeOverview() {
	const progress = useProgressStore();
	const { loading, error, data } = useDbData(() => ({
		volumes: getVolumes(),
		stats: getCorpusStats(),
		idsByVolume: getEntryIdsByVolume(),
	}));

	/** 每册进度统计，随进度变化自动更新 */
	const progressByVolume = computed(() => {
		const idsByVolume = data.value?.idsByVolume ?? {};
		const result = {};
		for (const [volume, ids] of Object.entries(idsByVolume)) {
			result[volume] = progress.countMarks(ids);
		}
		return result;
	});

	return {
		loading,
		error,
		volumes: computed(() => data.value?.volumes ?? []),
		stats: computed(() => data.value?.stats ?? null),
		progressByVolume,
	};
}

/** 册次页：课次列表 + 每课学习进度 */
export function useChapterOverview(volume) {
	const progress = useProgressStore();
	const { loading, error, data } = useDbData(() => ({
		volume: getVolume(volume),
		chapters: getChapters(volume),
		idsByChapter: getEntryIdsByChapter(volume),
	}));

	const progressByChapter = computed(() => {
		const idsByChapter = data.value?.idsByChapter ?? {};
		const result = {};
		for (const [chapter, ids] of Object.entries(idsByChapter)) {
			result[chapter] = progress.countMarks(ids);
		}
		return result;
	});

	return {
		loading,
		error,
		volumeMeta: computed(() => data.value?.volume ?? null),
		chapters: computed(() => data.value?.chapters ?? []),
		progressByChapter,
	};
}

/** 学习页：一课的词条 + 课次信息 + 本课进度 */
export function useChapterEntries(volume, chapter) {
	const progress = useProgressStore();
	const { loading, error, data } = useDbData(() => ({
		chapter: getChapter(volume, chapter),
		entries: getEntries(volume, chapter),
	}));

	const entryIds = computed(() =>
		(data.value?.entries ?? []).map((e) => e.entry_id),
	);
	const counts = computed(() => progress.countMarks(entryIds.value));

	return {
		loading,
		error,
		chapterMeta: computed(() => data.value?.chapter ?? null),
		entries: computed(() => data.value?.entries ?? []),
		entryIds,
		counts,
	};
}
