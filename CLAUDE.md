# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 生产环境运行
npm run start

# Lint
npm run lint
```

## 架构概述

这是一个使用 **Next.js 16 + React 19 + TypeScript** 构建的儿童数学教育 Web 应用，部署在 Vercel 上。

### 技术栈
- **框架**: Next.js 16 (App Router)
- **UI**: Tailwind CSS 4
- **字体**: Fredoka (英文数字) + Noto Sans SC (中文)

### 项目结构

```
src/app/
├── layout.tsx          # 根布局，配置字体和 metadata
├── page.tsx            # 首页 - 游戏选择菜单，支持键盘导航
├── globals.css         # 全局样式
└── game/
    ├── 1-grid/
    │   └── page.tsx    # 乘法方块游戏：10×10 网格拖拽选择
    └── 2-division/
        └── page.tsx    # 除法装盒游戏：拖拽苹果学习有余数除法
```

### 代码模式

- 所有游戏页面使用 `"use client"` 指令，因为需要交互和状态管理
- 游戏逻辑使用 React hooks (`useState`, `useCallback`, `useRef`, `useEffect`)
- 答对音效使用 Web Audio API 动态生成
- 移动端支持触摸事件 (`onTouchStart`, `onTouchMove`, `onTouchEnd`)
- 路径别名 `@/*` 指向 `./src/*`

## Git 提交

提交代码时使用 Claude 身份：
```bash
git commit --author="Claude <claude@anthropic.com>" -m "提交信息"
```
