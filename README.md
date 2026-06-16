# fde-book-factory — AI-FDE 编书工具与书稿

> 一套 **AI 原生的"编书工厂"**:用工作流脚本 + 写作规则 + 状态机,驱动 AI 与人协作产出整本书,并一键生成 HTML / PDF / 公众号文章。
> 当前作品:《**AI-FDE:产业 AI 落地的新生产力体系**》(19 章 + 前言/结语)。
> 关联公司准则:[原则四 · 问题定义型招聘](https://github.com/bynothing/xling_top_level_info/blob/main/docs/00-principles/README.md)(FDE 即"领域交付专家"),本仓库本身即该方法论的产物示范。

---

## 这是什么

不是一份书稿,而是一条**可复用的编书流水线**:把"写一本书"拆成大纲 → 章节底稿 → 干净正文 → 多端发布的标准化工作流,每一步都有规则、状态记录和校验脚本,让 AI 可以持续接力、人类只做关键终审。

## 目录结构

```
fde-book-factory/
├── FDE_大纲-上.MD / FDE_大纲-下.MD   原始大纲(上/下篇)
├── 运维实践.txt / 运维实践-总结.txt   原始素材
├── book-viewer.html                  成书在线阅读器(单文件)
├── book-viewer/build.py              阅读器构建脚本
└── book-outline/                     ★ 编书工程主目录
    ├── README.md                     工程入口与写作顺序
    ├── ORIGINAL_BRIEF.md             原始写作委托
    ├── WRITING_CONTEXT.md            全书定位/核心命题/结构
    ├── WRITING_RULES.md              写作约束/文风/数据使用原则
    ├── WRITING_STATE.md              ★ 当前进度与最近决策(状态机)
    ├── MATERIAL_INDEX.md             素材索引→章节映射
    ├── CHAPTER_WORKFLOW.md           单章 大纲→正文 标准流程
    ├── WORKFLOW_SCRIPT.md            脚本化流程控制说明
    ├── 00_全书大纲_倒叙确认版.md      当前总纲
    ├── chapters/                     章节底稿(事实/素材/待确认)
    ├── manuscript/                   干净正文(19 章)
    ├── scripts/                      工作流脚本(fde-book-workflow.ps1 等)
    ├── skill-draft/                  可复用 skill 草稿
    ├── online-release/               网页/PDF 成品与预览
    ├── pdf-book/                     PDF 输出
    └── wechat-articles/ wechat-publish/  公众号文章与发布
```

## 如何使用(写作接力)

每次继续写作前,按 `book-outline/README.md` 的顺序读取上下文,然后:

```powershell
# 写作前预检
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 preflight

# 写完后校验
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 validate
```

生成在线阅读器:

```bash
python book-viewer/build.py
```

## 设计原则(对齐公司方法论)

- **状态机驱动**:`WRITING_STATE.md` 记录"当前进度/最近决策/下一步",任何 AI 或人接手都能无缝续写——即"数据全量可读"。
- **底稿与正文分离**:`chapters/`(可追溯的事实底稿)与 `manuscript/`(干净正文)解耦。
- **脚本化卡关**:`preflight` / `validate` 充当编书流程的"Evals",不合规不放行。
- **多端结果交付**:直接产出可读成品(网页/PDF/公众号),而非半成品工具。

---

_本仓库是公司知识资产之一,已登记于[顶层信息体系](https://github.com/bynothing/xling_top_level_info)。_
