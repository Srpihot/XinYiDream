# 心易梦 (XinYiMeng)

<div align="center">

![心易梦](https://img.shields.io/badge/心易梦-梅花易数-black?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-gold?style=for-the-badge)

**以心起卦 · 以易入梦**

移动端梅花易数占卜应用，纯前端实现，无需服务器。

[在线体验](https://srpihot.github.io/XinYiDream) · [下载 APK](#打包说明)

</div>

---

## 功能特性

### 梅花易数起卦
- **时间起卦**：根据农历时间自动计算卦象
- **数字起卦**：输入两个数字即可起卦
- **五种卦象**：本卦、变卦、互卦、错卦、综卦
- **体用分析**：自动判断体用关系及五行生克
- **六爻展示**：带五行颜色的爻象图，动爻标注

### 八字批盘
- **四柱八字**：年柱、月柱、日柱、时柱
- **十神分析**：日主、正官、七杀、正印等
- **五行统计**：金木水火土数量及占比
- **大运流年**：排出大运及未来流年
- **神煞查询**：天乙贵人、文昌、桃花等

### AI 解卦
- 支持 DeepSeek API
- 支持自定义 OpenAI 格式 API
- 流式输出，实时显示
- 问答历史保存

### 其他功能
- PWA 支持，可添加到主屏幕
- 本地存储历史记录
- 响应式设计，适配手机/平板
- 折叠屏适配

---

## 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JavaScript
- **移动框架**：Capacitor
- **构建工具**：无，纯静态网站
- **依赖**：无第三方运行时依赖

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/Srpihot/XinYiDream.git
cd XinYiDream

# 启动本地服务器
python3 -m http.server 8080
# 或
npx http-server -p 8080

# 访问 http://localhost:8080
```

---

## 打包说明

### 方法一：本地打包 APK

```bash
# 安装依赖
npm install

# 添加 Android 平台
npx cap add android

# 同步项目
npx cap sync

# 打开 Android Studio
npx cap open android

# 在 Android Studio 中 Build → Build APK
```

### 方法二：云打包平台

- [WebIntoApp](https://webintoapp.com) - 上传 ZIP 即可生成 APK
- [AppsGeyser](https://appsgeyser.com) - 免费在线打包
- [GoNative](https://gonative.io) - 输入网址即可

---

## 项目结构

```
XinYiDream/
├── index.html              # 主入口
├── manifest.json           # PWA 配置
├── package.json            # 项目配置
├── capacitor.config.ts     # Capacitor 配置
├── css/
│   ├── base.css           # 基础样式
│   ├── components.css     # 组件样式
│   ├── meihua.css         # 梅花易数样式
│   └── responsive.css     # 响应式适配
├── js/
│   ├── core/
│   │   ├── app.js         # 主应用逻辑
│   │   ├── meihua.js      # 梅花易数算法
│   │   ├── storage.js     # 本地存储
│   │   └── fortune-analyzer.js  # 八字分析
│   ├── utils/
│   │   ├── date.js        # 日期工具
│   │   └── ui.js          # UI 交互
│   └── data/
│       ├── guadata.js     # 64卦数据
│       └── bazi-data.js   # 农历数据
└── assets/                 # 资源文件
```

---

## 梅花易数算法

### 时间起卦法

```
上卦 = (年支数 + 农历月 + 农历日) % 8
下卦 = (年支数 + 农历月 + 农历日 + 时辰数) % 8
动爻 = (年支数 + 农历月 + 农历日 + 时辰数) % 6
```

### 数字起卦法

```
上卦 = 第一个数 % 8
下卦 = 第二个数 % 8
动爻 = (两数之和) % 6
```

### 先天八卦数

| 数 | 卦 | 符号 | 五行 |
|---|---|---|---|
| 1 | 乾 | ☰ | 金 |
| 2 | 兑 | ☱ | 金 |
| 3 | 离 | ☲ | 火 |
| 4 | 震 | ☳ | 木 |
| 5 | 巽 | ☴ | 木 |
| 6 | 坎 | ☵ | 水 |
| 7 | 艮 | ☶ | 土 |
| 8 | 坤 | ☷ | 土 |

---

## 截图

> 待添加

---

## 许可证

MIT License

---

## 致谢

- [php-fortune-analyzer](https://github.com/...) - 八字算法参考
- 64卦数据整理
- Kimi AI 协助开发

---

<div align="center">

**本程序仅供学习研究，请勿迷信**

Made with ❤️ by Srpihot

</div>
