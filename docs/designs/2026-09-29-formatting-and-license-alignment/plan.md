# 执行计划：对齐团队格式化与许可规范 + 标注数据来源

日期：2026-09-29

## 1. 格式化规范

- [x] 读取 `团队公共配置` 的 `.prettierrc`、`.prettierignore`、`.editorconfig`、`LICENSE`、`package.json`
- [x] 确认缩进实际形态（`cat -A` 验证团队公共配置用 Tab）
- [x] 创建 `.editorconfig`（与团队公共配置逐字节一致）
- [x] 创建 `.prettierrc`（与团队公共配置逐字节一致）
- [x] 创建 `.prettierignore`（沿用团队公共配置+ 补充 `package-lock.json`）
- [x] `package.json` 增加 devDependency `prettier@^3.6.2` 与 `format` / `format:check` 脚本
- [x] `verify` 前置 `format:check`
- [x] 安装依赖并确认 Prettier 版本（3.9.9，支持 `objectWrap`）
- [x] `npm run format` 格式化 59 个文件
- [x] 复查 `format:check` 幂等（对深层嵌套的 Vue 模板需二次写入才收敛）

## 2. 许可与元数据

- [x] `LICENSE` 改为团队公共配置的 MIT（`Copyright (c) 2025-2026 XISHU (shallowlong@gmail.com)`）
- [x] `LICENSE` 追加「适用范围与第三方内容」章节，标注数据集来源与 CC BY-SA 3.0
- [x] `package.json` 补 `author`（`XISHU <shallowlong@gmail.com>`）与 `license`（`MIT`）
- [x] `package.json` 的 `description` 写入数据来源 URL 与许可

## 3. 数据来源标注

- [x] `LICENSE`（新增章节）
- [x] `package.json` `description`
- [x] `index.html` 的 `meta[name=description]`
- [x] 核对既有标注位（`README.md` / `SOURCES.md` / `LICENSES/THIRD_PARTY_NOTICES.md` /
      `docs/knowledge/sources-and-license.md` / `src/data/copyright.js` / 页脚 / 设置页「关于」）

## 4. 规范文档同步

- [x] `AGENTS.md` §4「代码风格」改写为 Prettier + EditorConfig 驱动（Tab / 宽 4 / LF）
- [x] 重新同步各 agent 规范副本（`.codebuddy` / `.trae` / `.cursor` / `.claude`）
- [x] 对副本再跑 Prettier 使其通过 `format:check`
- [x] `docs/knowledge/architecture.md` 新增「代码风格」章节
- [x] `README.md` 开发规范章节补充 `format` 与新的 `verify` 组成
- [x] 本方案三件套

## 5. 验证

- [x] `npm run format:check` 全通过且幂等
- [x] `npm run build` 通过
- [x] `npm run check` 四项校验通过
- [x] `npm run verify`（format + build + check）整体通过
- [x] Edge 无头回归：首页 / 学习页 / 设置页渲染与交互正常，控制台 0 错误
- [x] 确认页脚与设置页「关于」正确标注数据来源
- [x] 确认缩进已落地为 Tab（`grep -P "^\t"` 统计 26 个文件；余下 1 处为 SQL 模板字符串对齐）
