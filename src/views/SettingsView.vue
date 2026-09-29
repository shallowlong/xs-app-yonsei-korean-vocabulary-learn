<script setup>
	/**
	 * 设置页：语音引擎配置（浏览器内置语音包）、页面显示偏好、学习进度管理、许可与关于。
	 *
	 * 发音固定使用内置语音包，因此不再提供引擎切换；音色只列出支持韩语的系统语音。
	 */
	import { onMounted, ref } from "vue";
	import { ElMessage, ElMessageBox } from "element-plus";
	import { useSettingsStore } from "@/stores/settings";
	import { useProgressStore } from "@/stores/progress";
	import { isSupported, listKoreanVoices } from "@/utils/speech";
	import { useSpeech } from "@/composables/useSpeech";
	import { APP_VERSION } from "@/data/appMeta";
	import { DATASET, PROJECT } from "@/data/copyright";
	import SpeakIcon from "@/components/SpeakIcon.vue";

	const prefs = useSettingsStore();
	const progress = useProgressStore();
	const { speakText, playing } = useSpeech();

	/** 环境是否支持内置语音合成（运行期不变） */
	const supported = isSupported();

	/** 系统语音中支持韩语的选项 */
	const koreanVoices = ref([]);
	const voicesLoading = ref(false);

	async function loadVoices() {
		voicesLoading.value = true;
		try {
			koreanVoices.value = await listKoreanVoices();
		} finally {
			voicesLoading.value = false;
		}
	}

	onMounted(loadVoices);

	/** 试听：朗读一句韩语示例 */
	async function preview() {
		await speakText("안녕하세요", "ko-KR");
	}

	async function resetProgress() {
		try {
			await ElMessageBox.confirm(
				"将清空本浏览器中记录的全部学习标记（已掌握 / 学习中 / 收藏），且无法恢复。是否继续？",
				"重置学习进度",
				{
					type: "warning",
					confirmButtonText: "确认重置",
					cancelButtonText: "取消",
				},
			);
		} catch {
			return; // 用户取消
		}
		progress.reset();
		ElMessage.success("学习进度已重置");
	}

	function exportProgress() {
		progress.exportToFile();
		ElMessage.success("进度文件已开始下载");
	}

	function resetSettings() {
		prefs.reset();
		ElMessage.success("已恢复默认设置");
	}
</script>

<template>
	<div class="stack-lg">
		<div class="page-head">
			<h1 class="page-title">设置</h1>
			<p class="page-desc">
				语音参数与显示偏好，全部设置与学习进度仅保存在本浏览器。
			</p>
		</div>

		<!-- 语音引擎配置 -->
		<el-card shadow="never">
			<template #header>
				<div class="row">
					<span>语音引擎配置</span>
					<span class="spacer" />
					<el-tag
						:type="supported ? 'success' : 'warning'"
						size="small"
						effect="plain">
						{{
							supported ? "浏览器内置语音包" : "当前浏览器不支持"
						}}
					</el-tag>
				</div>
			</template>

			<el-alert
				v-if="!supported"
				type="warning"
				title="当前浏览器不支持语音合成（Web Speech API）"
				description="建议改用 Chrome、Edge 或 Safari 的较新版本打开本站。"
				:closable="false"
				show-icon
				style="margin-bottom: 12px" />

			<div class="setting-item">
				<div class="setting-label">语速</div>
				<div class="setting-body">
					<el-slider
						:model-value="prefs.state.rate"
						:min="0.5"
						:max="1.5"
						:step="0.05"
						:format-tooltip="(value) => `${value.toFixed(2)}x`"
						@update:model-value="
							(value) => prefs.patch({ rate: value })
						" />
					<div class="setting-hint">
						学习发音建议 0.7–0.9 倍速，便于跟读模仿；0.9 为默认值。
					</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">音高</div>
				<div class="setting-body">
					<el-slider
						:model-value="prefs.state.pitch"
						:min="0.5"
						:max="2"
						:step="0.1"
						:format-tooltip="(value) => value.toFixed(1)"
						@update:model-value="
							(value) => prefs.patch({ pitch: value })
						" />
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">韩语语音</div>
				<div class="setting-body">
					<el-select
						:model-value="prefs.state.voiceURI"
						placeholder="自动选择（推荐）"
						clearable
						filterable
						:loading="voicesLoading"
						:disabled="!koreanVoices.length"
						style="width: 100%; max-width: 420px"
						@update:model-value="
							(value) => prefs.patch({ voiceURI: value ?? '' })
						">
						<el-option
							v-for="voice in koreanVoices"
							:key="voice.uri"
							:label="`${voice.name}（${voice.lang}）`"
							:value="voice.uri" />
					</el-select>
					<div class="setting-hint">
						<template v-if="koreanVoices.length">
							已检测到
							{{ koreanVoices.length }}
							个支持韩语的系统语音；留空则由系统默认挑选。
						</template>
						<template v-else>
							未检测到韩语语音。请先在操作系统的「语音 /
							语言」设置中安装韩语语音包（Windows 通常为 Microsoft
							Heami，macOS 为 Yuna 等），安装后刷新本页。
						</template>
					</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">试听</div>
				<div class="setting-body">
					<el-button
						type="primary"
						:loading="playing"
						:disabled="!supported"
						@click="preview">
						<SpeakIcon :size="15" style="margin-right: 6px" />
						朗读「안녕하세요」
					</el-button>
					<div class="setting-hint">
						中文与英文释义的发音同样使用系统对应语言的语音包。
					</div>
				</div>
			</div>
		</el-card>

		<!-- 页面显示 -->
		<el-card shadow="never">
			<template #header>页面显示</template>

			<div class="setting-item">
				<div class="setting-label">自动发音</div>
				<div class="setting-body">
					<el-switch
						:model-value="prefs.state.autoSpeak"
						@update:model-value="
							(value) => prefs.patch({ autoSpeak: value })
						" />
					<div class="setting-hint">切换单词时自动朗读韩语。</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">英文释义</div>
				<div class="setting-body">
					<el-switch
						:model-value="prefs.state.showEnglish"
						@update:model-value="
							(value) => prefs.patch({ showEnglish: value })
						" />
					<div class="setting-hint">
						关闭后学习页只显示中文，减少干扰。
					</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">词源信息</div>
				<div class="setting-body">
					<el-switch
						:model-value="prefs.state.showEtymology"
						@update:model-value="
							(value) => prefs.patch({ showEtymology: value })
						" />
					<div class="setting-hint">
						开启后学习页可展开查看词源、词典依据与复核状态；默认关闭以专注词汇本身。
					</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">恢复默认</div>
				<div class="setting-body">
					<el-button @click="resetSettings">恢复默认设置</el-button>
				</div>
			</div>
		</el-card>

		<!-- 学习进度 -->
		<el-card shadow="never">
			<template #header>学习进度</template>

			<div class="setting-item">
				<div class="setting-label">本地记录</div>
				<div class="setting-body">
					已标记
					<b>{{ progress.totalMarked }}</b>
					条词条，数据保存在本浏览器（localStorage），
					不会上传到任何服务器。
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">备份与重置</div>
				<div class="setting-body">
					<div class="row-wrap">
						<el-button @click="exportProgress">导出进度</el-button>
						<el-button type="danger" plain @click="resetProgress"
							>重置进度</el-button
						>
					</div>
					<div class="setting-hint">
						清除浏览器数据或更换设备会导致进度丢失，可定期导出备份。
					</div>
				</div>
			</div>
		</el-card>

		<!-- 关于 -->
		<el-card shadow="never">
			<template #header>关于</template>

			<div class="setting-item">
				<div class="setting-label">版本</div>
				<div class="setting-body">
					v{{ APP_VERSION }}（{{ PROJECT.name }}）
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">版权</div>
				<div class="setting-body">
					© {{ PROJECT.years }} {{ PROJECT.holder }} ·
					{{ PROJECT.license }}
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">数据来源</div>
				<div class="setting-body">
					<div>
						词汇数据来自
						<a
							:href="DATASET.repo"
							target="_blank"
							rel="noopener"
							>{{ DATASET.name }}</a
						>
						v{{ DATASET.version }}，共
						{{ DATASET.entryCount }} 条词条。
					</div>
					<div class="setting-hint">
						数据集按
						{{ DATASET.license }}
						发布，再分发需保留署名并以相同协议共享； 本项目代码按
						{{ PROJECT.license }} 发布。
					</div>
				</div>
			</div>

			<div class="setting-item">
				<div class="setting-label">免责声明</div>
				<div class="setting-body">
					<div class="setting-hint">{{ PROJECT.disclaimer }}</div>
					<div class="setting-hint">
						站点不收录教材课文、例句、练习、音频或扫描页；发音由浏览器内置语音包实时合成。
					</div>
				</div>
			</div>
		</el-card>
	</div>
</template>
