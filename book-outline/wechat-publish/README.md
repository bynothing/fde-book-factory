# FDE 书稿微信公众号批量发布任务

本目录用于管理《AI-FDE：产业 AI 落地的新生产力体系》全书章节的公众号排版稿和发布日志。

默认行为只生成和校验微信 HTML 排版稿，不发布、不群发。

## 常用命令

在工程根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\publish-fde-book-wechat.ps1
```

生成全部章节的微信 HTML 排版稿，并校验微信兼容性。

建议正式发布前先跑单章 dry-run：

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\publish-fde-book-wechat.ps1 -DryRun -Limit 1
```

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\publish-fde-book-wechat.ps1 -DryRun
```

对全部章节执行发布 dry-run，检查发布 payload，不创建公众号草稿。

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\publish-fde-book-wechat.ps1 -Publish
```

将全部章节发布到微信公众号草稿箱。不会群发。

当前后端未开放 `publish-html` 接口，因此批量脚本默认使用已验证成功的回退路径：

```text
publish --file <html> --raw
```

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\publish-fde-book-wechat.ps1 -Build -Validate -From CH01 -To CH03
```

只处理 CH01 到 CH03。

## 产物

1. `queue.json`：章节发布队列。
2. `html/`：微信公众号兼容 HTML 排版稿。
3. `logs/`：dry-run 或发布日志。

## 排版约束

1. 所有样式使用 inline style。
2. 不使用 `html`、`head`、`body` 标签。
3. 不使用外部 CSS、JavaScript、外部字体。
4. 不使用 `position:absolute/fixed`、`gap`、`background-image:url(...)`、`filter`、`mask`、`clip-path`。
5. 署名统一为 `渔夫-AI`。
6. 发布默认进入草稿箱，不群发。

## 当前状态

已生成 20 个章节的微信 HTML 排版稿，并通过本地兼容性校验。

2026-06-10 已将 CH00-CH19 共 20 篇发布到微信公众号草稿箱，未群发。发布报告见：

`book-outline/wechat-publish/PUBLISH_REPORT_2026-06-10.md`

注意：当前 Windows PowerShell 环境在命令结束后可能触发 Conda 自动激活的编码报错。该报错发生在批量任务完成之后；只要看到 `[validate] passed for 20 file(s).`，说明本任务的生成与校验已完成。
