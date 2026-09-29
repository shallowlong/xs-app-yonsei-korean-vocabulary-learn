/**
 * 路由表 —— 采用 hash 模式，保证构建产物可直接静态托管（无需服务端重写）。
 */

import { createRouter, createWebHashHistory } from "vue-router";
import { APP_NAME } from "@/data/appMeta";

const routes = [
	{
		path: "/",
		name: "home",
		component: () => import("@/views/HomeView.vue"),
		meta: { title: "选择册次" },
	},
	{
		path: "/volume/:volume",
		name: "volume",
		component: () => import("@/views/VolumeView.vue"),
		props: true,
		meta: { title: "课次列表" },
	},
	{
		path: "/volume/:volume/chapter/:chapter",
		name: "study",
		component: () => import("@/views/StudyView.vue"),
		props: true,
		meta: { title: "单词学习" },
	},
	{
		path: "/settings",
		name: "settings",
		component: () => import("@/views/SettingsView.vue"),
		meta: { title: "设置" },
	},
	{ path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
	scrollBehavior: () => ({ top: 0 }),
});

// 统一维护页面标题
router.afterEach((to) => {
	document.title = to.meta?.title
		? `${to.meta.title} · ${APP_NAME}`
		: APP_NAME;
});

export default router;
