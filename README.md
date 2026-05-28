# MemoryBench 评测平台

基于 MemoryBench 论文构建的可持续学习评测平台，包含 ELO 排分机制与多维度数据展示。

## 功能概述

### 首页（Home）

1. **Hero 区域**：
   - 标题：MemoryBench
   - ICML 2026 SpotLight 标识
   - GitHub / HuggingFace / Paper 链接

2. **Intro 区域**：
   - 三个 Tab：Paper / GitHub / HuggingFace
   - 代码展示框（terminal 风格动画）
   - 固定高度，切换 Tab 时内容稳定不抖动

3. **Leaderboard 预览**：
   - 筛选：Base Model / Memory System
   - 星级评分 + ELO 进度条

4. **Tags 分类**：
   - 4 categories: Models / Memory / Domain / Task
   - 不同颜色区分标签类型
   - 点击标签跳转到 Leaderboard 对应筛选视图
   - 从 Leaderboard 返回时标签会高亮闪烁 2 秒

5. **Chart 区域**：
   - 模型性能柱状图展示

### Page 1 - Leaderboard（排行榜）

1. **Overall Rankings（总排行榜）**：
   - 表格列：Rank、Model、Memory、ELO Rating、Cases、Details
   - Model 列粗体突出显示
   - ELO 值显示一位小数（如 1053.9）
   - 下拉筛选菜单（Base Model / Memory System），带"Clear All Filters"按钮
   - 星级评价 + ELO 进度条
   - 点击标签跳转后该区域会高亮闪烁 2 秒

2. **Benchmark Rankings（分榜排行榜）**：
   - 默认选中 "Academic & Knowledge"
   - 独立显示，不受 Overall Rankings 筛选影响
   - 可切换不同 case 查看排名
   - 每个 section 右上角有"← Back to Tags"返回按钮

3. **Benchmark Performance Heatmaps（热力图）**：
   - 按 Model 分组展示（Qwen3-8B / Qwen3-32B）
   - 行为 benchmark，列为 memory 系统
   - 颜色深浅表示分数高低

4. **页面样式**：
   - 页面宽度：padding 40px 160px，最大宽度 1600px
   - 热力图无横向滚动，完整显示 8 个 memory 系统
   - 响应式设计，支持 1024px / 768px / 480px 断点

### Page 2 - Case 详情

1. **Case 头部信息**：
   - 显示 Case 名称、类型标签（Domain/Task）
   - 统计：Samples（参与评估样本数）、Systems（系统数）

2. **Systems Ranking for This Case**：
   - 固定高度滚动列表（最大高度 400px）
   - 显示模型全称（Qwen3-32B / Qwen3-8B）
   - 模型名粗体突出，Memory 名次之

3. **Sample Evaluations（样本评估列表）**：
   - 标题在筛选栏上方
   - 筛选栏：Memory System、Model、Score（高/中/低）、清除按钮
   - 分页显示，每页 10 条
   - 支持页码跳转输入框

4. **Modal 弹窗**：
   - 点击任意样本展开详情弹窗
   - 按 ESC 或点击 ✕ 关闭

5. **页面样式**：
   - 响应式设计，手机端自适应

### Page 3 - 系统详情

1. **头部信息**：系统名称、模型名称
2. **指标卡片**：Overall ELO、Cases Participated、Best Case、Avg Rank
3. **Case 列表**：可按 case 筛选，显示各 case 下的 ELO 和排名

## 项目结构

```
memorybench/
├── src/
│   ├── data/
│   │   ├── eloData.js          # ELO 评分数据（用于排行榜+热力图）
│   │   └── samples/             # 7个 case 的样本数据
│   │       ├── domain_Academic_Knowledge.json
│   │       ├── domain_Legal.json
│   │       ├── domain_Open-Domain.json
│   │       ├── task_Long-Long.json
│   │       ├── task_Long-Short.json
│   │       ├── task_Short-Long.json
│   │       └── task_Short-Short.json
│   ├── pages/
│   │   ├── Home.jsx             # 首页（Hero + Intro + Leaderboard预览 + Tags）
│   │   ├── Leaderboard.jsx      # Page1 - 排行榜
│   │   ├── Cases.jsx            # Case 卡片列表
│   │   ├── CaseSamples.jsx      # Page2 - 样本详情
│   │   └── Detail.jsx           # Page3 - 系统详情页
│   ├── components/
│   │   └── Layout.jsx           # 布局组件
│   └── App.jsx                  # 路由配置
├── public/
├── package.json
├── vite.config.js
└── combine_data.py              # 数据处理脚本
```

## 数据说明

| 文件 | 大小 | 说明 |
|------|------|------|
| `eloData.js` | ~10KB | 16个系统的 ELO 评分（综合 + 7个case细分） |
| `samples/*.json` | ~53MB | 7个 case 的样本详情数据 |

**Memory Systems（共8个）：**
- A-Mem、BM25-Dialog、BM25-Message、Embedder-Dialog、Embedder-Message、Mem0、MemoryOS、No Memory

**Base Models（共2个）：**
- Qwen3-8B、Qwen3-32B

**Cases（共7个）：**
- Domain: Academic & Knowledge、Legal、Open-Domain
- Task: Long-Long、Long-Short、Short-Long、Short-Short

## 视觉规范

**颜色主题（Gold/Caramel）：**
- `--accent-golden`: #c9a962（金色）
- `--accent-honey`: #d4b896（蜂蜜色）
- `--accent-caramel`: #b8860b（焦糖色）
- `--accent-warm-brown`: #8b7355（暖棕色）
- `--accent-deep`: #5c4a3a（深棕色）

**字体：**
- IBM Plex Sans（正文）
- IBM Plex Serif（标题）

## 导航交互

### 标签跳转
- Models 标签 → Overall Rankings（按 Model 筛选）
- Memory Systems 标签 → Overall Rankings（按 Memory 筛选）
- Domain Benchmarks 标签 → Benchmark Rankings（按 Benchmark 筛选）
- Task Benchmarks 标签 → Benchmark Rankings（按 Benchmark 筛选）

### 返回功能
- Leaderboard 各 section 右上角有"← Back to Tags"按钮
- 点击后返回首页 Tags 区域，滚动到标签位置并高亮闪烁 2 秒

### 高亮效果
- 跳转时目标 section 高亮闪烁 2 秒（`highlight-flash` 动画）
- 返回时对应标签高亮闪烁 2 秒（`tag-highlight` 动画）

## 数据处理

使用 `combine_data.py` 脚本整合原始数据：

```bash
python combine_data.py
```

脚本从 `MemoryBench运行数据/off-policy` 和 `off-policy-32b` 读取数据，按 model、memory、case 分组，每组取最多 50 条样本。

## 开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署

本项目为静态页面，可部署到 Vercel、GitHub Pages 等平台。

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 技术栈

- React 19
- React Router 7
- Vite 8
- CSS（无框架，纯手写样式，支持响应式）

## 主题支持

支持浅色/深色模式切换，点击右上角太阳/月亮图标即可切换。