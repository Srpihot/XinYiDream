# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**心易梦 (XinYiMeng)** - 移动端网页版易经占卜应用
- 目标设备：折叠屏手机、iPhone 15/17
- 核心功能：梅花易数起卦解卦（优先）、八字解析（后续）
- 设计理念：独特沉浸式设计，非传统按钮式导航

## Tech Stack

- **纯前端方案**: HTML5 + CSS3 + Vanilla JavaScript
- **移动端优先**: 响应式设计，支持折叠屏适配
- **PWA**: 支持添加到主屏幕，类原生体验
- **无需构建工具**: 直接运行，无npm依赖

## Project Structure

```
/
├── index.html          # 主入口，动态加载功能模块
├── css/
│   ├── base.css       # 基础样式、变量、字体
│   ├── components.css # 可复用组件
│   ├── meihua.css     # 梅花易数专用样式
│   └── responsive.css # 折叠屏/设备适配
├── js/
│   ├── core/
│   │   ├── app.js              # 应用主逻辑、路由
│   │   ├── meihua.js           # 梅花易数算法（使用FortuneAnalyzer）
│   │   ├── storage.js          # 本地存储管理
│   │   └── fortune-analyzer.js # 八字/命理分析核心（从PHP转换，唯一数据源）
│   ├── utils/
│   │   ├── date.js    # 日期工具（基于FortuneAnalyzer）
│   │   └── ui.js      # UI动画、交互辅助
│   └── data/
│       └── guadata.js # 64卦数据
├── assets/
│   ├── fonts/         # 中文字体（如需要）
│   └── images/        # 图标、背景
└── manifest.json      # PWA配置
```

### FortuneAnalyzer 模块（js/core/fortune-analyzer.js）

基于 php-fortune-analyzer 项目转换的 JavaScript 八字命理分析库。**这是唯一的命理计算数据源。**

**主要功能：**
- `convertSolarToLunar(date)` - 阳历转农历
- `getGanZhi(date)` - 获取完整干支历（四柱）
- `analyzeFourPillars(date)` - 获取八字四柱数组
- `getYearPillar(date)` / `getMonthPillar(date)` / `getDayPillar(date)` / `getHourPillar(date)` - 获取各柱
- `getShiShen(dayGan, target)` - 计算十神
- `analyzeWuXingSimple(pillars)` / `analyzeWuXingFull(pillars)` - 五行统计
- `detectWuXingJu(pillars)` - 检测五行局（三会/三合/六合）
- `calculateStartAge(birthDate, gender)` - 计算起运年龄
- `getLuckCycles(birthDate, gender, count)` - 排出大运列表

**使用示例：**
```javascript
const now = new Date();
const ganZhi = FortuneAnalyzer.getGanZhi(now);
console.log(ganZhi.pillars); // ['丙午', '辛卯', '丙申', '丁酉']
console.log(ganZhi.lunar);   // 农历信息
console.log(ganZhi.year);    // {tiangan: '丙', dizhi: '午', name: '丙午'}
console.log(ganZhi.month);   // {tiangan: '辛', dizhi: '卯', name: '辛卯'}
```

## Development Commands

由于采用无构建工具方案，无需npm命令：

```bash
# 本地开发（使用Python简单服务器）
python3 -m http.server 8080

# 或使用Node.js http-server（如已安装）
npx http-server -p 8080

# 部署前验证
# 检查index.html能正常加载所有资源
# 验证PWA manifest.json有效
```

访问 http://localhost:8080 进行开发调试

## 梅花易数核心算法

### 起卦方法（js/core/meihua.js）

1. **时间起卦**（默认，使用农历）
   - 上卦：(年支数+农历月+农历日) % 8 → 对应先天八卦
   - 下卦：(年支数+农历月+农历日+时辰数) % 8 → 对应先天八卦
   - 动爻：(年支数+农历月+农历日+时辰数) % 6 + 1
   - 年支数：子=1, 丑=2, 寅=3, ... 亥=12
   - 时辰数：子=1, 丑=2, 寅=3, ... 亥=12

2. **数字起卦**（用户输入）
   - 上卦：第一个数 % 8
   - 下卦：第二个数 % 8
   - 动爻：(两数之和) % 6 + 1

3. **农历转换** (`js/utils/date.js`)
   - 支持1900-2100年农历转换
   - `solarToLunar(date)` 公历转农历
   - 自动处理闰月

3. **先天八卦对应**
   - 1: 乾 ☰  2: 兑 ☱  3: 离 ☲  4: 震 ☳
   - 5: 巽 ☴  6: 坎 ☵  7: 艮 ☶  8: 坤 ☷

### 卦象数据结构

```javascript
{
  upperGua: { num: 1, name: '乾', symbol: '☰', wuxing: '金' },
  lowerGua: { num: 8, name: '坤', symbol: '☷', wuxing: '土' },
  mainGua: { name: '天地否', type: '八纯卦/ etc' },
  dongYao: 3, // 动爻位置 1-6
  bianGua: { /* 变卦信息 */ },
  huGua: { /* 互卦信息 */ },
  timestamp: Date,
  method: 'time' // 或 'number'
}
```

## UI/UX Design Guidelines

### 设计理念
- **沉浸式体验**：避免传统按钮列表，采用手势/滑动导航
- **东方美学**：水墨、留白、渐变，现代与传统结合
- **无干扰**：全屏模式，隐藏浏览器UI

### 主要界面
1. **启动页**：动态太极/八卦动画 → 自动进入起卦
2. **起卦页**：
   - 默认展示当前时间卦象
   - 上下滑动切换起卦方式（时间/数字）
   - 长按/重按重新起卦
3. **卦象展示页**：
   - 主卦居中，变卦/互卦环绕或滑动切换
   - 卦辞爻辞可展开查看
   - 保存/分享功能

### 设备适配要点
- **折叠屏**：监听resize事件，展开状态重新计算布局
- **iPhone 15/17**：适配Dynamic Island、底部安全区
- **全面屏**：使用env(safe-area-inset-*)处理刘海/圆角

## Common Development Tasks

### 添加新的起卦方式
1. 在 `js/core/meihua.js` 中添加新的calculate函数
2. 在 `js/core/app.js` 路由中添加对应视图
3. 更新UI交互（滑动/按钮）

### 修改卦象展示
1. 主卦展示在 `css/meihua.css` 中定义
2. 动画效果在 `js/utils/ui.js` 中管理
3. 卦辞数据直接写在JS对象中或fetch JSON

### 添加保存历史功能
- 使用 `js/core/storage.js` 封装localStorage
- 键名：`xinyimeng_history`
- 最多保存100条，本地存储

## File Conventions

- **CSS变量**：使用 `--xym-` 前缀，定义在 `:root`
- **JS模块**：使用ES6 modules，`<script type="module">`
- **事件命名**：使用 `xym:` 前缀自定义事件
- **类名**：BEM命名法，如 `.meihua__gua--active`

## 64卦数据

64卦信息存储在 `js/data/guadata.js`（需创建）：
- 卦名、卦象、卦辞
- 六爻爻辞
- 五行属性
- 象征意义

## Performance Notes

- 避免大型框架，保持轻量
- 图片使用SVG或CSS绘制
- 动画使用CSS transform，启用GPU加速
- 懒加载卦辞数据（如数据量大）
