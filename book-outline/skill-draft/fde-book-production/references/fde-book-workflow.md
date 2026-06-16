# AI-FDE Book Workflow Reference

Use this reference for the local AI-FDE book project and similar book-production projects.

## Known local structure

- Project root: `D:\AI_native_change\FDE及相关的问题`
- Clean manuscript: `book-outline/manuscript/CH00-CH19*.md`
- Chapter working notes: `book-outline/chapters/`
- Workflow guardrail script: `book-outline/scripts/fde-book-workflow.ps1`
- Existing PDF/mobile script: `book-outline/scripts/build-pdf-book.mjs`
- Illustrated release script: `book-outline/scripts/build-illustrated-book.mjs`
- WeChat batch script: `book-outline/scripts/wechat-book-batch.mjs`
- WeChat wrapper: `book-outline/scripts/publish-fde-book-wechat.ps1`
- Online illustrated output: `book-outline/online-release/`
- PDF output: `book-outline/pdf-book/`
- WeChat article drafts: `book-outline/wechat-articles/`

## Preflight and status

From project root:

```powershell
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 preflight
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 status
powershell -ExecutionPolicy Bypass -File book-outline\scripts\fde-book-workflow.ps1 validate
```

Run `validate` after changing manuscript structure or generated workflow files.

## Current preferred public release

The preferred public-facing edition is the illustrated online release:

- `book-outline/online-release/AI-FDE-illustrated-online.html`
- `book-outline/online-release/AI-FDE-illustrated-mobile.pdf`

Build:

```powershell
node book-outline\scripts\build-illustrated-book.mjs
```

Expected characteristics:

- 20 chapters.
- 12 explanatory figures.
- 12 figure leads.
- Mobile-first HTML.
- PDF rendered from the same HTML.
- Preview images in `book-outline/online-release/preview/`.

## Pure text mobile PDF

The pure text mobile reading edition is retained for comparison:

```powershell
node book-outline\scripts\build-pdf-book.mjs
```

Current output:

- `book-outline/pdf-book/AI-FDE-book-mobile.pdf`

## Illustrated release figure set

The current figure system covers:

1. AI landing watershed.
2. Traditional delivery loss chain.
3. FDE responsibility reconstruction.
4. AI-FDE standard work loop.
5. AI toolchain amplification.
6. FDE system barrier.
7. Team resource digital platform infrastructure stack.
8. Demand-to-outcome workflow.
9. Complex industry scheduling case.
10. Digital employee operations loop.
11. FDE talent development path.
12. Enterprise AI-FDE rollout roadmap.

When adding or revising figures:

- Keep figures near the chapter where the concept first becomes essential.
- Add a figure lead before every figure.
- Do not add decorative visuals without explanatory value.
- Use compact diagram cards on mobile.
- Verify both HTML screenshot and PDF rendered page.

## PDF visual QA

Use PyMuPDF if available:

```powershell
@'
from pathlib import Path
import fitz
pdf = Path(r'book-outline/online-release/AI-FDE-illustrated-mobile.pdf')
out = Path(r'book-outline/online-release/preview')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(str(pdf))
for page_no in [0, 1, 2, 4, 12, 80, 108, len(doc)-1]:
    if page_no < len(doc):
        pix = doc[page_no].get_pixmap(matrix=fitz.Matrix(0.75, 0.75), alpha=False)
        pix.save(str(out / f'page_{page_no+1:03d}.png'))
print('PDF_PAGES', len(doc))
print('PDF_SIZE_MB', round(pdf.stat().st_size/1024/1024, 2))
'@ | python -
```

Inspect:

- Cover: full-bleed or intentional frame, no unexpected blank margins.
- TOC and figure index: no single orphan item page unless unavoidable.
- Figure pages: no overlap, clipping, unreadable small text, or broken flow.
- Body pages: readable mobile type, comfortable line height, sane margins.
- Final page: no blank trailing page.

## Mobile HTML QA

Use Puppeteer if the repo has access to the yunjing-mcp Puppeteer dependency:

```powershell
@'
import { pathToFileURL } from 'url';
import path from 'path';
const { default: puppeteer } = await import(pathToFileURL('D:/ai-source-code/yunjing-mcp/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js').href);
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000 });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.resolve('book-outline/online-release/AI-FDE-illustrated-online.html')).href, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'book-outline/online-release/preview/mobile-html-top.png', fullPage: false });
  await page.goto(pathToFileURL(path.resolve('book-outline/online-release/AI-FDE-illustrated-online.html')).href + '#CH05', { waitUntil: 'networkidle0' });
  await new Promise((resolve) => setTimeout(resolve, 800));
  await page.screenshot({ path: 'book-outline/online-release/preview/mobile-html-ch05.png', fullPage: false });
} finally {
  await browser.close();
}
'@ | node --input-type=module
```

## WeChat article flow

Use this only for article adaptations, not full-book HTML:

1. Write article MD in `book-outline/wechat-articles/`.
2. Generate a WeChat-compatible HTML fragment with inline styles.
3. Validate banned constructs:

```powershell
Select-String -Path '<article.wechat.html>' -Pattern '<html|<head|<body|position:\s*(absolute|fixed)|gap:|<script|<link|background-image:\s*url|backdrop-filter|mask|clip-path' -CaseSensitive:$false
```

4. Publish draft only via yunjing-mcp CLI:

```powershell
node D:\ai-source-code\yunjing-mcp\platform\utils\wechat-publish-cli.mjs publish --file "<article.wechat.html>" --raw --title "<title>" --collection "<collection>" --category "<category>" --digest "<digest>" --cover auto
```

Do not use `--publish-to-all` unless the user explicitly asks for mass sending.

## State update

After each major change, append a concise record to:

- `book-outline/WRITING_STATE.md`

Include:

- What changed.
- Output files.
- Validation performed.
- Current preferred version.
