<script setup>
	/**
	 * 全站布局骨架：顶栏（品牌 + 导航）+ 内容区 + 页脚。
	 * 所有视图经 App.vue 包在本组件内，页面只负责自身内容。
	 */
	import { computed } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { APP_NAME, APP_TAGLINE } from "@/data/appMeta";
	import AppFooter from "@/components/AppFooter.vue";

	const route = useRoute();
	const router = useRouter();

	/** 根路径与册次/学习页共用「学习」这一项菜单高亮 */
	const activeMenu = computed(() =>
		route.path.startsWith("/settings") ? "/settings" : "/",
	);

	function handleSelect(index) {
		if (index !== route.path) router.push(index);
	}
</script>

<template>
	<header class="appbar">
		<div class="wrap">
			<a class="brand" href="#/" @click.prevent="handleSelect('/')">
				<span class="brand-mark">한</span>
				<span>
					{{ APP_NAME }}
					<small class="brand-sub">{{ APP_TAGLINE }}</small>
				</span>
			</a>
			<el-menu
				class="nav-menu"
				mode="horizontal"
				:default-active="activeMenu"
				:ellipsis="false"
				@select="handleSelect">
				<el-menu-item index="/">学习</el-menu-item>
				<el-menu-item index="/settings">设置</el-menu-item>
			</el-menu>
		</div>
	</header>

	<main class="main">
		<div class="wrap">
			<slot />
		</div>
	</main>

	<AppFooter />
</template>
