#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOK_ROOT = path.resolve(__dirname, '..');
const MANUSCRIPT_DIR = path.join(BOOK_ROOT, 'manuscript');
const OUT_DIR = path.join(BOOK_ROOT, 'pdf-book');
const HTML_PATH = path.join(OUT_DIR, 'AI-FDE-book.html');
const PDF_PATH = path.join(OUT_DIR, 'AI-FDE-book-mobile.pdf');
const PUPPETEER_ENTRY = 'D:\\ai-source-code\\yunjing-mcp\\node_modules\\puppeteer\\lib\\esm\\puppeteer\\puppeteer.js';

const BOOK_TITLE = 'AI-FDE：产业 AI 落地的新生产力体系';
const BOOK_SUBTITLE = '从团队资源数字化平台、全栈交付到数字员工运维的 AI Native 组织方法论';
const AUTHOR = '渔夫-AI';
const VERSION = '草稿版';
const DATE_TEXT = '2026-06-10';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readUtf8(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeUtf8(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function chapterIdFromName(name) {
  const match = name.match(/^(CH\d+)/i);
  return match ? match[1].toUpperCase() : path.basename(name, '.md');
}

function orderFromId(id) {
  const match = id.match(/^CH(\d+)/);
  return match ? Number(match[1]) : 999;
}

function extractTitle(markdown, fileName) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return path.basename(fileName, '.md').replace(/^CH\d+_/, '').replace(/_/g, ' ');
}

function loadChapters() {
  return fs.readdirSync(MANUSCRIPT_DIR)
    .filter((name) => /^CH\d+_.+\.md$/i.test(name))
    .sort((a, b) => orderFromId(chapterIdFromName(a)) - orderFromId(chapterIdFromName(b)))
    .map((name) => {
      const file = path.join(MANUSCRIPT_DIR, name);
      const markdown = readUtf8(file);
      const id = chapterIdFromName(name);
      return {
        id,
        order: orderFromId(id),
        file,
        fileName: name,
        title: extractTitle(markdown, name),
        markdown,
      };
    });
}

function flushParagraph(parts, out, className = '') {
  if (!parts.length) return;
  const content = inlineMarkdown(parts.join('\n').trim()).replace(/\n/g, '<br>');
  const klass = className ? ` class="${className}"` : '';
  if (content) out.push(`<p${klass}>${content}</p>`);
  parts.length = 0;
}

function renderList(items, ordered, className = '') {
  const tag = ordered ? 'ol' : 'ul';
  const body = items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('');
  const klass = className ? ` class="${className}"` : '';
  return `<${tag}${klass}>${body}</${tag}>`;
}

function renderMarkdown(markdown, chapter) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const paragraph = [];
  let listItems = [];
  let listOrdered = false;
  let inCode = false;
  let codeLines = [];
  let firstH1Skipped = false;
  let referenceMode = false;

  function flushList() {
    if (!listItems.length) return;
    out.push(renderList(listItems, listOrdered, referenceMode ? 'references-list' : ''));
    listItems = [];
  }

  function flushAll() {
    flushParagraph(paragraph, out, referenceMode ? 'references-paragraph' : '');
    flushList();
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      flushAll();
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      flushAll();
      if (!firstH1Skipped) {
        firstH1Skipped = true;
        continue;
      }
      out.push(`<h2>${inlineMarkdown(h1[1])}</h2>`);
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushAll();
      const heading = h2[1].trim();
      referenceMode = /资料来源|参考资料|来源/.test(heading);
      out.push(`<h2${referenceMode ? ' class="references-heading"' : ''}>${inlineMarkdown(heading)}</h2>`);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushAll();
      referenceMode = false;
      out.push(`<h3>${inlineMarkdown(h3[1])}</h3>`);
      continue;
    }

    const quote = line.match(/^>\s*(.+)$/);
    if (quote) {
      flushAll();
      out.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph(paragraph, out, referenceMode ? 'references-paragraph' : '');
      if (listItems.length && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph(paragraph, out, referenceMode ? 'references-paragraph' : '');
      if (listItems.length && listOrdered) flushList();
      listOrdered = false;
      listItems.push(unordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  if (inCode) {
    out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  flushAll();

  return `<article class="chapter" id="${chapter.id}">
  <section class="chapter-opening">
    <div class="chapter-kicker">${chapter.id}</div>
    <h1>${escapeHtml(chapter.title)}</h1>
  </section>
  <section class="chapter-body">
    ${out.join('\n')}
  </section>
</article>`;
}

function renderToc(chapters) {
  return `<section class="toc page">
    <div class="section-label">CONTENTS</div>
    <h1>目录</h1>
    <ol>
      ${chapters.map((chapter) => `<li><span>${chapter.id}</span><a href="#${chapter.id}">${escapeHtml(chapter.title)}</a></li>`).join('\n')}
    </ol>
  </section>`;
}

function renderCover() {
  return `<section class="cover page">
    <div class="cover-field"></div>
    <div class="cover-grid"></div>
    <div class="cover-rail">FIELD DEPLOYED AI</div>
    <div class="cover-mark">AI-FDE</div>
    <div class="cover-content">
      <div class="cover-tag">产业 AI 落地实践</div>
      <h1>${BOOK_TITLE}</h1>
      <p>${BOOK_SUBTITLE}</p>
      <div class="cover-meta">
        <span>${AUTHOR}</span>
        <span>${VERSION}</span>
        <span>${DATE_TEXT}</span>
      </div>
    </div>
  </section>`;
}

function renderIntro() {
  return `<section class="intro page">
    <div class="section-label">BOOK DRAFT</div>
    <h1>编排说明</h1>
    <p>本 PDF 根据 <strong>book-outline/manuscript</strong> 下 CH00-CH19 的正文自动生成。当前版本用于审阅、内部传播和后续出版版打磨，不作为最终出版定稿。</p>
    <p>本书讨论的不是一个岗位名称，而是产业 AI 从工具试用走向交付成果时出现的新生产力体系。全书采用倒叙方式，先写已经发生的变化，再回到传统交付瓶颈、FDE 的责任链条、基础设施、运维、人才和组织落地。</p>
    <div class="note-card">
      <strong>核心命题</strong>
      <span>AI 时代，软件越来越容易生成，但客户成果依然很难。FDE 的价值不是更快做出系统，而是把需求推进到可验证的业务成果。</span>
    </div>
  </section>`;
}

function renderStyles() {
  return `<style>
    @page {
      size: A4;
      margin: 0;
    }

    * { box-sizing: border-box; }

    html {
      font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif;
      color: #263244;
      background: #ffffff;
    }

    body {
      margin: 0;
      background: #ffffff;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .06;
      background-image:
        linear-gradient(rgba(30, 64, 175, .035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30, 64, 175, .035) 1px, transparent 1px);
      background-size: 26px 26px;
      z-index: -2;
    }

    body::after {
      content: "渔夫-AI";
      position: fixed;
      right: 15mm;
      bottom: 18mm;
      color: rgba(15, 23, 42, .035);
      font-size: 30px;
      font-weight: 900;
      letter-spacing: 1px;
      transform: rotate(-18deg);
      z-index: -1;
    }

    .page, .chapter {
      page-break-after: always;
      break-after: page;
      position: relative;
    }

    .chapter:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }

    .cover {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      color: #fff;
      overflow: visible;
      background: #07111f;
      isolation: isolate;
      transform: scale(1.215);
      transform-origin: top left;
    }

    .cover-field {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      background:
        linear-gradient(90deg, rgba(14,116,144,.28) 0 1px, transparent 1px 46mm),
        linear-gradient(0deg, rgba(148,163,184,.12) 0 1px, transparent 1px 38mm),
        radial-gradient(circle at 82% 18%, rgba(14,165,233,.34), transparent 28%),
        radial-gradient(circle at 14% 88%, rgba(37,99,235,.24), transparent 30%),
        linear-gradient(135deg, #050914 0%, #0f172a 46%, #0b3f59 100%);
    }

    .cover-grid {
      position: absolute;
      right: -34mm;
      top: 26mm;
      width: 126mm;
      height: 126mm;
      border: 1px solid rgba(226,232,240,.22);
      transform: rotate(11deg);
      opacity: .8;
      z-index: 1;
      background:
        linear-gradient(rgba(226,232,240,.10) 1px, transparent 1px),
        linear-gradient(90deg, rgba(226,232,240,.10) 1px, transparent 1px);
      background-size: 12mm 12mm;
    }

    .cover::after {
      content: "";
      position: absolute;
      left: 22mm;
      right: 22mm;
      bottom: 26mm;
      height: 1px;
      background: linear-gradient(90deg, rgba(226,232,240,.7), transparent);
      z-index: 2;
    }

    .cover-mark {
      position: absolute;
      left: 17mm;
      bottom: 36mm;
      font-size: 26mm;
      line-height: 1;
      font-weight: 900;
      color: rgba(255,255,255,.055);
      letter-spacing: 0;
      z-index: 1;
    }

    .cover-rail {
      position: absolute;
      left: 15mm;
      top: 18mm;
      z-index: 2;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      color: rgba(226,232,240,.38);
      font-size: 10px;
      letter-spacing: 2px;
      font-weight: 700;
    }

    .cover-content {
      position: relative;
      z-index: 3;
      width: 150mm;
      padding-top: 62mm;
      margin-left: 32mm;
    }

    .cover-tag {
      display: inline-block;
      padding: 0 0 7px;
      border-bottom: 1px solid rgba(226,232,240,.54);
      color: rgba(226,232,240,.78);
      font-size: 12px;
      letter-spacing: 1px;
      margin-bottom: 34px;
    }

    .cover h1 {
      margin: 0;
      font-size: 47px;
      line-height: 1.16;
      letter-spacing: 0;
      font-weight: 900;
    }

    .cover p {
      width: 124mm;
      margin: 28px 0 0;
      font-size: 20px;
      line-height: 1.72;
      color: rgba(255,255,255,.82);
    }

    .cover-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 48px;
      color: rgba(226,232,240,.78);
      font-size: 13px;
    }

    .cover-meta span {
      padding: 7px 11px;
      border: 1px solid rgba(226,232,240,.2);
      border-radius: 0;
      background: rgba(15,23,42,.35);
    }

    .intro, .toc {
      padding: 8mm 6mm 9mm;
    }

    .section-label, .chapter-kicker {
      display: inline-block;
      color: #2563eb;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .intro h1, .toc h1 {
      margin: 0 0 20px;
      color: #111827;
      font-size: 48px;
      line-height: 1.35;
    }

    .intro p {
      font-size: 40px;
      line-height: 1.42;
      margin: 0 0 .42em;
      text-indent: 2em;
      text-align: justify;
      text-justify: inter-ideograph;
    }

    .note-card {
      margin-top: 28px;
      padding: 18px 18px;
      border: 1px solid rgba(37, 99, 235, .2);
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(219,234,254,.86), rgba(240,249,255,.86));
      box-shadow: 0 12px 30px rgba(15, 23, 42, .06);
    }

    .note-card strong {
      display: block;
      color: #1e3a8a;
      margin-bottom: 8px;
    }

    .note-card span {
      display: block;
      font-size: 34px;
      line-height: 1.45;
    }

    .toc ol {
      list-style: none;
      padding: 0;
      margin: 14px 0 0;
      columns: 1;
    }

    .toc li {
      display: flex;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(148, 163, 184, .28);
      break-inside: avoid;
    }

    .toc li span {
      width: 54px;
      flex: 0 0 auto;
      color: #2563eb;
      font-weight: 800;
      font-size: 20px;
    }

    .toc a {
      color: #1f2937;
      text-decoration: none;
      font-size: 24px;
      line-height: 1.28;
    }

    .chapter {
      padding: 8mm 6mm 9mm;
    }

    .chapter-opening {
      min-height: 38mm;
      margin: 0 0 8mm;
      padding: 11mm 0 8mm;
      border-radius: 0;
      color: #111827;
      background: transparent;
      page-break-inside: avoid;
      position: relative;
      overflow: hidden;
      text-align: center;
    }

    .chapter-opening::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 36mm;
      height: 1px;
      background: #cbd5e1;
      transform: translateX(-50%);
    }

    .chapter-kicker {
      color: #64748b;
      margin-bottom: 10px;
      font-size: 12px;
      letter-spacing: 1px;
    }

    .chapter-opening h1 {
      position: relative;
      z-index: 3;
      max-width: 178mm;
      margin: 0;
      margin-left: auto;
      margin-right: auto;
      font-size: 52px;
      line-height: 1.18;
      font-weight: 800;
      letter-spacing: 0;
    }

    .chapter-body {
      padding: 0;
    }

    .chapter-body h2 {
      margin: 8mm 0 4mm;
      padding: 0;
      border-left: 0;
      color: #111827;
      font-size: 44px;
      line-height: 1.22;
      font-weight: 800;
      page-break-after: avoid;
    }

    .chapter-body h2.references-heading {
      margin-top: 7mm;
      margin-bottom: 3mm;
      padding-left: 8px;
      border-left-color: #94a3b8;
      color: #64748b;
      font-size: 18px;
      line-height: 1.25;
      font-weight: 600;
    }

    .chapter-body h3 {
      margin: 6mm 0 2.5mm;
      color: #1f2937;
      font-size: 38px;
      line-height: 1.24;
      page-break-after: avoid;
    }

    .chapter-body p {
      margin: 0 0 .26em;
      color: #1f2937;
      font-size: 40px;
      line-height: 1.42;
      text-indent: 2em;
      text-align: justify;
      text-justify: inter-ideograph;
    }

    .chapter-body p:first-child {
      margin-top: 0;
    }

    .chapter-body blockquote {
      margin: 1.1em 0;
      padding: 10px 14px;
      border-left: 3px solid #94a3b8;
      background: rgba(248,250,252,.92);
      border-radius: 0;
      color: #334155;
      font-size: 35px;
      line-height: 1.38;
    }

    .chapter-body ul, .chapter-body ol {
      margin: .6em 0 1em 1.35em;
      padding-left: 1em;
      color: #1f2937;
      font-size: 37px;
      line-height: 1.38;
    }

    .chapter-body ul.references-list,
    .chapter-body ol.references-list {
      margin: 0 0 .65em 1em;
      padding-left: .8em;
      color: #64748b;
      font-size: 17px;
      line-height: 1.28;
    }

    .chapter-body .references-list li {
      margin-bottom: .18em;
      word-break: break-all;
    }

    .chapter-body .references-list a,
    .chapter-body .references-list code {
      font-size: 16px;
    }

    .chapter-body p.references-paragraph {
      color: #64748b;
      font-size: 17px;
      line-height: 1.28;
      margin-bottom: .55em;
      word-break: break-all;
    }

    .chapter-body li {
      margin: 0 0 .45em;
    }

    code {
      font-family: Consolas, "SFMono-Regular", monospace;
      color: #3730a3;
      background: #eef2ff;
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 30px;
    }

    pre {
      margin: 0 0 1.5em;
      padding: 14px 16px;
      background: #111827;
      color: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      white-space: pre-wrap;
      font-size: 28px;
      line-height: 1.36;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    a {
      color: #2563eb;
    }

    strong {
      color: #111827;
      font-weight: 800;
    }

    @media print {
      .cover, .page, .chapter {
        break-after: page;
      }
      .chapter-body h2, .chapter-body h3 {
        break-after: avoid;
      }
      p, li, blockquote {
        orphans: 2;
        widows: 2;
      }
    }
  </style>`;
}

function renderHtml(chapters) {
  const body = [
    renderCover(),
    renderIntro(),
    renderToc(chapters),
    ...chapters.map((chapter) => renderMarkdown(chapter.markdown, chapter)),
  ].join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(BOOK_TITLE)}</title>
  ${renderStyles()}
</head>
<body>
${body}
</body>
</html>
`;
}

async function renderPdf(htmlPath, pdfPath) {
  const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_ENTRY).href);
  const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000 });
  const tempPdfPath = pdfPath.replace(/\.pdf$/i, `.tmp-${Date.now()}.pdf`);
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(240000);
    page.setDefaultTimeout(240000);
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: tempPdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
  } finally {
    await browser.close();
  }

  try {
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    fs.renameSync(tempPdfPath, pdfPath);
  } catch (error) {
    const fallbackPath = pdfPath.replace(/\.pdf$/i, `-${Date.now()}.pdf`);
    fs.renameSync(tempPdfPath, fallbackPath);
    console.warn(`[warn] target PDF was locked; wrote fallback PDF: ${fallbackPath}`);
  }
}

async function main() {
  ensureDir(OUT_DIR);
  const chapters = loadChapters();
  if (!chapters.length) {
    throw new Error(`No manuscript chapters found in ${MANUSCRIPT_DIR}`);
  }
  const html = renderHtml(chapters);
  writeUtf8(HTML_PATH, html);
  console.log(`[html] ${HTML_PATH}`);
  await renderPdf(HTML_PATH, PDF_PATH);
  console.log(`[pdf] ${PDF_PATH}`);
  console.log(`[chapters] ${chapters.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
