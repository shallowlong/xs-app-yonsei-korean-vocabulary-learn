import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "@/styles/tokens.css";
import "@/styles/app.css";
import App from "./App.vue";
import router from "@/router";

// 样式加载顺序：element-plus 默认主题 → 设计令牌 → 项目覆盖（见 styles/app.css 头部注释）
createApp(App)
	.use(createPinia())
	.use(router)
	.use(ElementPlus, { locale: zhCn })
	.mount("#app");
