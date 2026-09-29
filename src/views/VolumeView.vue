<script setup>
	/**
	 * 册次页：列出该册全部课次及其学习进度。
	 */
	import { computed } from "vue";
	import { useRouter } from "vue-router";
	import { useChapterOverview } from "@/composables/useVocabulary";
	import { VOLUME_NAMES_KO, VOLUME_NAMES_ZH } from "@/data/labels";

	const props = defineProps({ volume: { type: String, required: true } });
	const router = useRouter();

	const volumeNumber = Number(props.volume);
	const { loading, error, volumeMeta, chapters, progressByChapter } =
		useChapterOverview(volumeNumber);

	const totalEntries = computed(() =>
		chapters.value.reduce((sum, item) => sum + item.entry_count, 0),
	);
	const totalTouched = computed(() =>
		chapters.value.reduce(
			(sum, item) =>
				sum + (progressByChapter.value[item.chapter]?.touched ?? 0),
			0,
		),
	);

	function chapterPercent(chapter) {
		if (!chapter.entry_count) return 0;
		const touched = progressByChapter.value[chapter.chapter]?.touched ?? 0;
		return Math.round((touched / chapter.entry_count) * 100);
	}

	function openChapter(chapter) {
		router.push(`/volume/${volumeNumber}/chapter/${chapter}`);
	}
</script>

<template>
	<div class="stack-lg">
		<div class="page-head">
			<el-button link type="primary" @click="router.push('/')">
				← 全部册次
			</el-button>
			<h1 class="page-title">
				{{ VOLUME_NAMES_ZH[volumeNumber] ?? `第 ${volumeNumber} 册` }}
				<span class="ko sub">{{ VOLUME_NAMES_KO[volumeNumber] }}</span>
			</h1>
			<p v-if="!loading && !error" class="page-desc">
				{{ chapters.length }} 课 · {{ totalEntries }} 条词条 · 已学
				{{ totalTouched }} 条
				<template v-if="volumeMeta">
					· 每课 {{ volumeMeta.units_per_chapter }} 个单元
				</template>
			</p>
		</div>

		<el-skeleton v-if="loading" :rows="8" animated />

		<el-alert
			v-else-if="error"
			type="error"
			title="加载失败"
			:description="error"
			:closable="false"
			show-icon />

		<el-empty
			v-else-if="!chapters.length"
			description="该册次暂无课次数据" />

		<div v-else class="stack">
			<div
				v-for="chapter in chapters"
				:key="chapter.chapter"
				class="chapter-row"
				@click="openChapter(chapter.chapter)">
				<div
					class="chapter-no"
					:style="{ background: volumeMeta?.accent ?? '#2f8f83' }">
					{{ String(chapter.chapter).padStart(2, "0") }}
				</div>
				<div class="chapter-info">
					<div class="chapter-ko">{{ chapter.ko }}</div>
					<div class="chapter-zh">
						{{ chapter.zh }} · {{ chapter.en }}
					</div>
				</div>
				<div class="chapter-side">
					<div>
						{{ chapter.entry_count }} 条 · 已学
						{{ progressByChapter[chapter.chapter]?.touched ?? 0 }}
					</div>
					<el-progress
						:percentage="chapterPercent(chapter)"
						:stroke-width="4"
						:show-text="false"
						:color="volumeMeta?.accent ?? '#2f8f83'"
						style="margin-top: 6px" />
				</div>
			</div>
		</div>
	</div>
</template>
