<script setup>
	/**
	 * 单词卡 —— 学习页的核心信息载体。
	 *
	 * 设计取舍：只呈现"学词"必需的信息（韩语、发音、中文、可选英文/词源），
	 * 词源默认折叠，避免次要信息分流注意力（见 docs/designs 中的方案说明）。
	 */
	import { computed } from "vue";
	import {
		KIND_LABELS,
		ORIGIN_TIPS,
		REVIEW_LABELS,
		REVIEW_TAG_TYPE,
		originLabel,
		originTagType,
	} from "@/data/labels";
	import SpeakIcon from "@/components/SpeakIcon.vue";

	const props = defineProps({
		/** 词条对象（来自 api/vocabulary.js 的 entries 行） */
		entry: { type: Object, required: true },
		/** 自测模式下遮住释义 */
		masked: { type: Boolean, default: false },
		/** 当前正在播放的语言（用于给对应按钮加播放态） */
		playingLang: { type: String, default: "" },
		/** 是否显示英文释义 */
		showEnglish: { type: Boolean, default: true },
		/** 是否显示词源区块 */
		showEtymology: { type: Boolean, default: false },
	});

	const emit = defineEmits(["speak"]);

	const posLabel = computed(
		() => props.entry.pos_zh || props.entry.pos || "",
	);
	const kindLabel = computed(
		() =>
			KIND_LABELS[props.entry.entry_kind] ?? props.entry.entry_kind ?? "",
	);
	const etymologyTip = computed(
		() => ORIGIN_TIPS[props.entry.origin_type] ?? "",
	);
	const reviewLabel = computed(
		() => REVIEW_LABELS[props.entry.review_status] ?? "",
	);
	const reviewType = computed(
		() => REVIEW_TAG_TYPE[props.entry.review_status] ?? "info",
	);
	/** 词源区块是否有可展示内容 */
	const hasEtymology = computed(
		() =>
			Boolean(props.entry.origin_detail) ||
			Boolean(props.entry.dictionary_source),
	);

	function speak(text, lang) {
		emit("speak", { text, lang });
	}
</script>

<template>
	<el-card class="study-card" shadow="never">
		<button
			class="speak-main"
			:class="{ 'is-playing': playingLang === 'ko-KR' }"
			type="button"
			title="朗读韩语（空格键可重播）"
			@click="speak(entry.korean, 'ko-KR')">
			<SpeakIcon :size="26" />
		</button>

		<div class="word-ko">{{ entry.korean }}</div>
		<div v-if="entry.pronunciation" class="word-pron">
			[{{ entry.pronunciation }}]
		</div>

		<div class="word-tags">
			<el-tag
				size="small"
				effect="light"
				:type="originTagType(entry.origin_type)"
				:title="etymologyTip">
				{{ originLabel(entry.origin_type) }}
			</el-tag>
			<el-tag
				v-if="posLabel && posLabel !== kindLabel"
				size="small"
				type="info"
				effect="plain">
				{{ posLabel }}
			</el-tag>
			<el-tag v-if="kindLabel" size="small" type="info" effect="plain">
				{{ kindLabel }}
			</el-tag>
			<el-tag size="small" type="info" effect="plain">
				第 {{ entry.unit }} 单元
			</el-tag>
		</div>

		<div class="meaning" :class="{ 'is-masked': masked }">
			<div class="meaning-line">
				<span class="meaning-lang">中文</span>
				<span class="meaning-text">{{ entry.chinese }}</span>
				<button
					class="mini-speak"
					type="button"
					title="朗读中文"
					@click="speak(entry.chinese, 'zh-CN')">
					<SpeakIcon :size="15" />
				</button>
			</div>
			<div v-if="showEnglish" class="meaning-line">
				<span class="meaning-lang">EN</span>
				<span class="meaning-text">{{ entry.english }}</span>
				<button
					class="mini-speak"
					type="button"
					title="朗读英文"
					@click="speak(entry.english, 'en-US')">
					<SpeakIcon :size="15" />
				</button>
			</div>
		</div>

		<el-collapse v-if="showEtymology && hasEtymology" class="word-etym">
			<el-collapse-item title="词源与数据来源" name="etym">
				<div v-if="entry.origin_detail">
					<b>词源</b>：{{ entry.origin_detail }}
				</div>
				<div v-if="entry.dictionary_source" class="muted">
					<b>词典依据</b>：{{ entry.dictionary_source }}
				</div>
				<div v-if="entry.revision_note" class="muted">
					<b>编辑备注</b>：{{ entry.revision_note }}
				</div>
				<div v-if="reviewLabel" class="muted">
					<b>复核状态</b>：
					<el-tag size="small" :type="reviewType" effect="plain">
						{{ reviewLabel }}
					</el-tag>
				</div>
			</el-collapse-item>
		</el-collapse>
	</el-card>
</template>
