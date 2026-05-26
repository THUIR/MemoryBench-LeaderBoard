会议主题：Memory Bench评测平台建设研讨会

会议摘要：本次会议明确了基于 Memory Bench 论文构建可持续学习评测平台的战略方向，确立了以 Leaderboard 为核心的网站建设路径，并制定了包含 ELO 排分机制与多维度数据展示的 MVP 开发计划，预计两周内交付。

一、Memory Bench 评测框架与数据基础
针对现有评测集无法有效评估大模型"过程性能力"提升的问题，会议详细拆解了 Memory Bench 的核心逻辑与现有数据资产：
1. 评测机制设计
模拟用户反馈闭环：构建了"任务提供（Text Provider）- 模型生成 - 用户模拟器（User Simulator）- 性能监控（Performance Monitor）"的全流程闭环，通过模拟用户反馈（如法律文书评价）驱动模型持续学习。
训练与测试分离：严格区分训练 Query（含反馈）与测试 Query（不含反馈），确保评测结果仅反映模型在训练过程中的能力提升，而非过拟合。
反馈质量验证：虽然使用大模型（如千问 32B）模拟用户反馈存在偏差，但经人工评测证实，大模型生成的反馈在自然度、相关性和总体质量上均接近甚至优于人工反馈，足以支撑持续学习能力的评测。
2. 数据集与基线模型
多领域任务覆盖：数据集涵盖 Open Domain、Legal Domain 和 Academic Domain，任务类型按输入输出长度划分为长输入短输出（如问答）、短输入长输出（如写作）等四种形态。
现有实验数据：已完成千问 38B、32B 及 Mistral 等基座模型在不同记忆系统（如 BM25、A0）下的评测，数据总量约 2 万条，远超竞品（约 300 条）。
二、平台建设方案与交互设计
会议确立了以 Leaderboard 为核心功能的网站建设路径，并深入探讨了排名算法与筛选逻辑：
1. 排名算法选型
引入 ELO 天梯机制：摒弃传统的均值归一化（Mean Max）和 Z-Score 归一化，决定采用类似游戏天梯的 ELO 算法。通过随机抽取模型进行"对战"（比较任务能力），动态计算积分，使排名更直观。
多维度指标展示：除排名外，计划展示模型运行时长、Token 消耗量及估算成本，为用户提供全面的性能参考。
2. 筛选与交互逻辑
多层级筛选视图：支持按"基座模型"和"记忆系统"两个维度进行交叉筛选。用户可查看特定模型下的不同方法表现，或特定方法下的不同模型表现。
数据下钻能力：网站将支持从总榜下钻至具体数据集（Dataset）的评测结果，满足专业用户对细分领域性能的查看需求。
三、开发排期与部署策略
为确保项目快速落地，会议制定了明确的开发时间表与部署方案：
1. 里程碑节点
MVP 版本交付：预计在两周内（约 6 月 7 日前）完成包含 Leaderboard 核心功能的网站上线。
完整版本目标：计划在 6 月底至 7 月初完成包含模型上传接口及更多评测功能的完善版本，以配合后续学术会议需求。
2. 部署与国际化
服务器选型：鉴于网站主要为静态页面展示，对服务器性能要求不高，可考虑使用国内云服务或直接托管在 GitHub Pages 上。
语言与访问：优先开发英文版本以确保国际可访问性，若国内服务器访问受限，将以 GitHub 作为主要部署渠道。
四、待办事项
开发 Memory Bench 评测平台网站（含 Leaderboard），部署在vercel上。

示例网站：
https://continual-learning-bench.com
https://arena.ai/leaderboard/text

【重点】平台设计：
目前分为两个页面，page1主要包含leaderboard等排行榜内容，page2包括case的详情页等内容。
全部数据都存储在D:\Git\memorybench\MemoryBench运行数据文件夹下，数据详情通过D:\Git\memorybench\MemoryBench运行数据\README.md说明。

1. page1：
首先做一个热力图，行为model名，列为memory，值为elo数值。
其次做一个排行榜，这个排行榜需要限制长度，通过上下滚动显示全面，包含elo等值，可以通过summary.json文件获得。

2. page2：
需要做一个分类的卡片，这个卡片点进去是详情（所有case）的列表。这个数据首先需要处理一下，将D:\Git\memorybench\MemoryBench运行数据\off-policy和D:\Git\memorybench\MemoryBench运行数据\off-policy-32b文件夹下的predict.json和evaluate_detail整合到一起，注意添加字段来区分模型、task、domain和memory等。

数据处理：
目前D:\Git\memorybench\MemoryBench运行数据下面包含两个文件夹off-policy和off-policy-32b，这分别是两个模型的处理数据。每个模型的文件夹下又分别包含一个domain和一个task，domain文件夹下又包含3种，task文件夹下包含4种，每种下面都包含8个memory。
其中，每个memory都包含4个json数据文件，summary是总结文件，evaluate_details是评价打分以及具体原因文件，predict是预测回答文件。我希望你能构建py代码生成一个数据文件，这个数据文件里主要的字段是evaluate_details的metrics和predict的messages字段，可以通过test_idx一一对应起来。然后在page2点击case的详情页面时，会跳出一个在当前页面上方的一个小页面，展示这个case的详情（及打分详情和回答详情等）。