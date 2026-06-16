# FDE 书稿写作工程入口

本目录用于管理《AI-FDE：产业 AI 落地的新生产力体系》的大纲、写作规则、资料索引、任务状态和章节产物。

任何一次继续写作前，先按以下顺序读取：

1. `ORIGINAL_BRIEF.md`：理解作者最初提出的完整写作委托。
2. `WRITING_CONTEXT.md`：理解全书定位、核心命题、上下篇结构。
3. `WRITING_RULES.md`：确认写作约束、文风、案例处理和数据使用原则。
4. `WRITING_STATE.md`：确认当前进度、最近决策、下一步任务。
5. `MATERIAL_INDEX.md`：确认可用素材和它们应该放进哪些章节。
6. `CHAPTER_WORKFLOW.md`：确认每章从大纲到正文的标准流程。
7. `WORKFLOW_SCRIPT.md`：确认脚本化流程控制方式。
8. `00_全书大纲_倒叙确认版.md`：查看当前总纲。

## 工作流脚本

每次开始写作前，先运行：

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 preflight
```

每次写完正文或调整文件结构后，运行：

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 validate
```

## 当前阶段

当前阶段是：**CH01 正文初稿已完成，等待审阅或进入 CH02**。

正文与底稿已经分离：

1. `chapters/`：章节底稿、事实底稿、素材和待确认问题。
2. `manuscript/`：干净正文。
