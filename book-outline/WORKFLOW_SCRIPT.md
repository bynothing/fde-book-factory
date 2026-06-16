# 写作工作流控制脚本

脚本路径：

`book-outline/scripts/fde-book-workflow.ps1`

这个脚本用于严格控制写作工程结构，避免正文、底稿、事实素材和工作备注混在一起。它不生成内容，只做流程守门。

## 核心原则

1. `chapters/` 是工作底稿区。
2. `manuscript/` 是干净正文区。
3. 正文不能写入底稿。
4. 底稿不能混入正式正文。
5. 每次开始写作前先跑 `preflight`。
6. 每次写完正文或调整结构后跑 `validate`。

## 常用命令

在工程根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 status
```

查看当前工程状态、必读上下文和已有正文。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 preflight
```

开始写作前运行，确认必须先读的文件和当前流程约束。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 validate
```

检查目录分层、正文洁净度、底稿是否混入正文草稿区。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 validate -Strict
```

严格模式。普通警告也会让脚本返回非零状态，适合提交前或导出前使用。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 list
```

列出章节底稿和干净正文文件。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 new-manuscript -Chapter CH02
```

根据 `chapters/` 中的 CH02 底稿创建对应的干净正文文件。

## 标准写作流程

1. 运行 `preflight`。
2. 按脚本提示读取原始委托、上下文、规则、状态、材料索引和总纲。
3. 在 `chapters/` 中整理当前章节的大纲、事实底稿和待确认问题。
4. 使用 `new-manuscript -Chapter CH##` 创建干净正文文件。
5. 只在 `manuscript/` 中写正文。
6. 写完后运行 `validate`。
7. 更新 `WRITING_STATE.md`。
8. 进入下一章前再次运行 `status`。

## 复用到其他写作项目

复制以下结构即可复用：

```text
book-outline/
  README.md
  ORIGINAL_BRIEF.md
  WRITING_CONTEXT.md
  WRITING_RULES.md
  WRITING_STATE.md
  MATERIAL_INDEX.md
  CHAPTER_WORKFLOW.md
  WORKFLOW_SCRIPT.md
  scripts/
    fde-book-workflow.ps1
  chapters/
  manuscript/
```

复用时只需要替换：

1. `ORIGINAL_BRIEF.md`
2. `WRITING_CONTEXT.md`
3. `MATERIAL_INDEX.md`
4. `00_*.md` 总纲文件
5. `chapters/` 中的章节底稿

脚本本身不绑定本书具体内容，可以继续用于其他长篇写作工程。
