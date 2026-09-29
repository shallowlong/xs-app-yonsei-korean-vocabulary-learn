<script setup>
	/**
	 * 首页：直接进入册次选择，不做过场与宣传文案，减少进入学习的路径长度。
	 */
	import { computed } from "vue";
	import { useRouter } from "vue-router";
	import { useVolumeOverview } from "@/composables/useVocabulary";
	import { VOLUME_NAMES_KO, VOLUME_NAMES_ZH } from "@/data/labels";

	const router = useRouter();
	const { loading, error, volumes, stats, progressByVolume } =
		useVolumeOverview();

	const totalTouched = computed(() =>
		Object.values(progressByVolume.value).reduce(
			(sum, item) => sum + item.touched,
			0,
		),
	);

	/** 册次进度 = 已学（有任何标记）词条数 / 总词条数 */
	function progressPercent(volume) {
		if (!volume.row_count) return 0;
		const touched = progressByVolume.value[volume.volume]?.touched ?? 0;
		return Math.round((touched / volume.row_count) * 100);
	}

	function openVolume(volume) {
		router.push(`/volume/${volume}`);
	}
</script>

<template>
	<div class="stack-lg">
		<div class="page-head">
			<h1 class="page-title">选择册次</h1>
			<p class="page-desc">
				{{ stats?.entries ?? 0 }} 条词条 · {{ stats?.volumes ?? 0 }} 册
				· {{ stats?.chapters ?? 0 }} 课 · 已学 {{ totalTouched }} 条
			</p>
		</div>

		<el-skeleton v-if="loading" :rows="6" animated />

		<el-alert
			v-else-if="error"
			type="error"
			:title="'词库加载失败'"
			:description="error"
			:closable="false"
			show-icon />

		<div v-else class="vol-grid">
			<el-card
				v-for="vol in volumes"
				:key="vol.volume"
				class="vol-card"
				shadow="never"
				@click="openVolume(vol.volume)">
				<div
					class="vol-cover"
					:style="{
						background: `linear-gradient(135deg, ${vol.accent} 0%, #173b57 92%)`,
					}">
					<div class="no">
						VOL. {{ String(vol.volume).padStart(2, "0") }}
					</div>
					<div class="zh">{{ VOLUME_NAMES_ZH[vol.volume] }}</div>
					<div class="ko">{{ VOLUME_NAMES_KO[vol.volume] }}</div>
				</div>

				<div class="vol-meta">
					<span
						><b>{{ vol.row_count }}</b> 条</span
					>
					<span
						>已学
						<b>{{
							progressByVolume[vol.volume]?.touched ?? 0
						}}</b></span
					>
				</div>
				<el-progress
					:percentage="progressPercent(vol)"
					:stroke-width="6"
					:show-text="false"
					:color="vol.accent" />
			</el-card>
		</div>
	</div>
</template>
