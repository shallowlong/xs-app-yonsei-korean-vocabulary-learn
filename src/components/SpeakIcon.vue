<script setup>
	/**
	 * 喇叭图标（内联 SVG）。
	 * 说明：项目刻意不引入 @element-plus/icons-vue，避免为一个图标新增运行时依赖（见 AGENTS.md §9）。
	 */
	defineProps({
		size: { type: [Number, String], default: 16 },
	});
</script>

<template>
	<svg
		:width="size"
		:height="size"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true">
		<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
		<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
		<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
	</svg>
</template>
