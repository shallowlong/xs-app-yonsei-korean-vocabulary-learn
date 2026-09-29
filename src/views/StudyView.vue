<script setup>
	/**
	 * 单词学习页 —— 全站核心。
	 *
	 * 交互约定：
	 *   ← / →      上一个 / 下一个词
	 *   空格        浏览模式重播韩语；自测模式切换答案显隐
	 *   切词时若开启「自动发音」，自动朗读韩语
	 */
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";
	import { useRouter } from "vue-router";
	import { useChapterEntries } from "@/composables/useVocabulary";
	import { useSpeech } from "@/composables/useSpeech";
	import { MARK, useProgressStore } from "@/stores/progress";
	import { useSettingsStore } from "@/stores/settings";
	import WordCard from "@/components/WordCard.vue";
	import { VOLUME_NAMES_ZH } from "@/data/labels";

	const props = defineProps({
		volume: { type: String, required: true },
		chapter: { type: String, required: true },
	});

	const router = useRouter();
	const progress = useProgressStore();
	const prefs = useSettingsStore();
	const {
		playingLang,
		error: speechError,
		supported,
		speakText,
	} = useSpeech();

	const volumeNumber = Number(props.volume);
	const chapterNumber = Number(props.chapter);

	const { loading, error, chapterMeta, entries, counts } = useChapterEntries(
		volumeNumber,
		chapterNumber,
	);

	const index = ref(0);
	/** browse：直接显示释义；quiz：先遮住，回忆后再揭示 */
	const mode = ref("browse");
	const revealed = ref(true);

	const current = computed(() => entries.value[index.value] ?? null);
	const currentMark = computed(() =>
		current.value ? progress.getMark(current.value.entry_id) : null,
	);
	/** 自测模式下尚未揭示答案 */
	const masked = computed(() => mode.value === "quiz" && !revealed.value);
	const volumeTitle = computed(
		() => VOLUME_NAMES_ZH[volumeNumber] ?? `第 ${volumeNumber} 册`,
	);

	function setMode(next) {
		mode.value = next;
		revealed.value = next !== "quiz";
	}

	function goTo(nextIndex) {
		if (nextIndex < 0 || nextIndex >= entries.value.length) return;
		index.value = nextIndex;
		revealed.value = mode.value !== "quiz";
	}

	function onSpeak({ text, lang }) {
		speakText(text, lang);
	}

	function toggleMark(mark) {
		if (current.value) progress.toggleMark(current.value.entry_id, mark);
	}

	function onKeydown(event) {
		const target = event.target;
		if (
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement
		)
			return;

		if (event.key === "ArrowLeft") {
			goTo(index.value - 1);
		} else if (event.key === "ArrowRight") {
			goTo(index.value + 1);
		} else if (event.key === " ") {
			event.preventDefault();
			if (mode.value === "quiz") revealed.value = !revealed.value;
			else if (current.value) speakText(current.value.korean, "ko-KR");
		}
	}

	// 切词后自动朗读（首次进入不触发，避免被浏览器的自动播放策略拦截）
	watch(index, () => {
		if (!prefs.state.autoSpeak) return;
		const entry = current.value;
		if (entry) speakText(entry.korean, "ko-KR");
	});

	onMounted(() => window.addEventListener("keydown", onKeydown));
	onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
	<div class="stack-lg">
		<div class="page-head">
			<el-button
				link
				type="primary"
				@click="router.push(`/volume/${volumeNumber}`)">
				← {{ volumeTitle }}
			</el-button>

			<div class="row-wrap" style="margin-top: 4px">
				<h1 v-if="chapterMeta" class="page-title">
					<span class="ko">{{ chapterMeta.ko }}</span>
					· {{ chapterMeta.zh }}
					<span class="sub">{{ chapterMeta.en }}</span>
				</h1>
				<span class="spacer" />
				<el-radio-group
					:model-value="mode"
					size="small"
					@change="setMode">
					<el-radio-button value="browse">浏览</el-radio-button>
					<el-radio-button value="quiz">自测</el-radio-button>
				</el-radio-group>
			</div>

			<p v-if="!loading && !error" class="page-desc">
				{{ entries.length }} 条 · 已掌握 {{ counts.known }} · 学习中
				{{ counts.learning }} · 收藏 {{ counts.starred }}
				<span class="muted">（← → 翻词，空格重播）</span>
			</p>
		</div>

		<el-skeleton v-if="loading" :rows="6" animated />

		<el-alert
			v-else-if="error"
			type="error"
			title="加载失败"
			:description="error"
			:closable="false"
			show-icon />

		<el-empty v-else-if="!entries.length" description="本课暂无词条" />

		<template v-else>
			<el-alert
				v-if="!supported"
				type="warning"
				title="当前浏览器不支持语音合成，无法播放发音"
				description="建议改用 Chrome、Edge 或 Safari 的较新版本打开本站。"
				:closable="false"
				show-icon />

			<el-alert
				v-if="speechError"
				type="warning"
				:title="speechError"
				:closable="false"
				show-icon />

			<WordCard
				v-if="current"
				:entry="current"
				:masked="masked"
				:playing-lang="playingLang"
				:show-english="prefs.state.showEnglish"
				:show-etymology="prefs.state.showEtymology"
				@speak="onSpeak" />

			<div v-if="masked" style="text-align: center">
				<el-button type="primary" size="large" @click="revealed = true">
					显示答案
				</el-button>
			</div>

			<div class="study-controls">
				<el-button-group>
					<el-button
						:type="
							currentMark === MARK.KNOWN ? 'primary' : 'default'
						"
						@click="toggleMark(MARK.KNOWN)">
						已掌握
					</el-button>
					<el-button
						:type="
							currentMark === MARK.LEARNING
								? 'warning'
								: 'default'
						"
						@click="toggleMark(MARK.LEARNING)">
						学习中
					</el-button>
					<el-button
						:type="
							currentMark === MARK.STARRED ? 'warning' : 'default'
						"
						@click="toggleMark(MARK.STARRED)">
						收藏
					</el-button>
				</el-button-group>

				<div class="row">
					<el-button :disabled="index === 0" @click="goTo(index - 1)">
						上一词
					</el-button>
					<span class="muted nowrap"
						>{{ index + 1 }} / {{ entries.length }}</span
					>
					<el-button
						:disabled="index >= entries.length - 1"
						@click="goTo(index + 1)">
						下一词
					</el-button>
				</div>
			</div>
		</template>
	</div>
</template>
