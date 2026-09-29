<script setup>
	/**
	 * 页脚：仅显示版权与版本信息，版权人名称指向其主页。
	 * 数据来源署名、许可说明与免责声明集中在设置页「关于」
	 * （署名合规性见 docs/knowledge/sources-and-license.md）。
	 */
	import { APP_VERSION } from "@/data/appMeta";
	import { PROJECT } from "@/data/copyright";
</script>

<template>
	<footer class="footer">
		<div class="wrap">
			© {{ PROJECT.years }}
			<a :href="PROJECT.homepage" target="_blank" rel="noopener">
				{{ PROJECT.holder }}
			</a>
			· v{{ APP_VERSION }}
		</div>
	</footer>
</template>
