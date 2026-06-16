#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOK_ROOT = path.resolve(__dirname, '..');
const MANUSCRIPT_DIR = path.join(BOOK_ROOT, 'manuscript');
const OUT_DIR = path.join(BOOK_ROOT, 'wechat-publish');
const HTML_DIR = path.join(OUT_DIR, 'html');
const LOG_DIR = path.join(OUT_DIR, 'logs');
const QUEUE_PATH = path.join(OUT_DIR, 'queue.json');
const CLI_PATH = 'D:\\ai-source-code\\yunjing-mcp\\platform\\utils\\wechat-publish-cli.mjs';
const CLI_CWD = 'D:\\ai-source-code\\yunjing-mcp';

const DEFAULT_COLLECTION = 'AI-FDE 书稿连载';
const DEFAULT_CATEGORY = '产业 AI 落地';
const DEFAULT_AUTHOR = '渔夫-AI';

function usage() {
  console.log(`
FDE book WeChat batch task

Usage:
  node book-outline/scripts/wechat-book-batch.mjs build
  node book-outline/scripts/wechat-book-batch.mjs validate
  node book-outline/scripts/wechat-book-batch.mjs publish --dry-run
  node book-outline/scripts/wechat-book-batch.mjs publish

Options:
  --from CH04
  --to CH08
  --limit 3
  --collection "AI-FDE 书稿连载"
  --category "产业 AI 落地"
`);
}

function parseArgs(argv) {
  const options = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      i += 1;
    } else {
      options[key] = true;
    }
  }
  return { command: positional[0] || 'help', options };
}

function ensureDirs() {
  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function readUtf8(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeUtf8(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~#>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function shortWechatTitle(title) {
  return title
    .replace(/^第[一二三四五六七八九十百0-9]+章\s*/, '')
    .replace(/^CH\d+\s*/, '')
    .trim();
}

function digestFromMarkdown(markdown, title) {
  const plain = stripMarkdown(markdown.replace(/^#\s+.+$/m, ''));
  const digest = plain || `围绕“${title}”展开 AI-FDE 产业落地体系的关键判断。`;
  return digest.slice(0, 96);
}

function outputHtmlName(entry) {
  return `${String(entry.order).padStart(2, '0')}_${entry.id}_${safeFileName(entry.wechatTitle)}.wechat.html`;
}

function safeFileName(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 40);
}

function listManuscripts() {
  return fs.readdirSync(MANUSCRIPT_DIR)
    .filter((name) => /^CH\d+_.+\.md$/i.test(name))
    .sort((a, b) => orderFromId(chapterIdFromName(a)) - orderFromId(chapterIdFromName(b)))
    .map((name) => {
      const id = chapterIdFromName(name);
      const file = path.join(MANUSCRIPT_DIR, name);
      const markdown = readUtf8(file);
      const title = extractTitle(markdown, name);
      const wechatTitle = shortWechatTitle(title);
      return {
        id,
        order: orderFromId(id),
        source: file,
        title,
        wechatTitle,
        digest: digestFromMarkdown(markdown, wechatTitle),
        collection: DEFAULT_COLLECTION,
        category: DEFAULT_CATEGORY,
        author: DEFAULT_AUTHOR,
      };
    });
}

function applyRange(entries, options) {
  let result = [...entries];
  if (options.from) {
    const fromOrder = orderFromId(String(options.from).toUpperCase());
    result = result.filter((entry) => entry.order >= fromOrder);
  }
  if (options.to) {
    const toOrder = orderFromId(String(options.to).toUpperCase());
    result = result.filter((entry) => entry.order <= toOrder);
  }
  if (options.limit) {
    result = result.slice(0, Number(options.limit));
  }
  return result;
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code style="background:#eef2ff;color:#3730a3;padding:1px 5px;border-radius:4px;font-size:13px;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#1f2937;">$1</strong>');
}

function flushParagraph(parts, out) {
  if (!parts.length) return;
  const content = renderInlineMarkdown(parts.join('\n').trim()).replace(/\n/g, '<br>');
  if (content) {
    out.push(`<p style="font-size:15px;line-height:1.95;color:#333333;margin:0 0 1.55em;">${content}</p>`);
  }
  parts.length = 0;
}

function renderList(items, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  const body = items.map((item) => `<li style="margin:0 0 8px;padding-left:2px;">${renderInlineMarkdown(item)}</li>`).join('');
  return `<${tag} style="font-size:15px;line-height:1.85;color:#333333;margin:0 0 1.6em 1.2em;padding-left:1em;">${body}</${tag}>`;
}

function renderMarkdownBody(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const paragraph = [];
  let listItems = [];
  let listOrdered = false;
  let inCode = false;
  let codeLines = [];

  function flushList() {
    if (!listItems.length) return;
    out.push(renderList(listItems, listOrdered));
    listItems = [];
  }

  function flushAll() {
    flushParagraph(paragraph, out);
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
        out.push(`<pre style="background:#111827;color:#e5e7eb;border-radius:8px;padding:14px 16px;overflow:auto;font-size:13px;line-height:1.7;margin:0 0 1.6em;"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
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
      out.push(`<h1 style="font-size:23px;line-height:1.45;color:#111827;margin:0 0 20px;font-weight:800;">${renderInlineMarkdown(h1[1])}</h1>`);
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushAll();
      out.push(`<section style="margin:34px 0 18px;padding:0 0 0 12px;border-left:4px solid #2563eb;"><h2 style="font-size:19px;line-height:1.45;color:#1f2937;margin:0;font-weight:800;">${renderInlineMarkdown(h2[1])}</h2></section>`);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushAll();
      out.push(`<h3 style="font-size:17px;line-height:1.55;color:#374151;margin:26px 0 12px;font-weight:700;">${renderInlineMarkdown(h3[1])}</h3>`);
      continue;
    }

    const quote = line.match(/^>\s*(.+)$/);
    if (quote) {
      flushAll();
      out.push(`<blockquote style="margin:0 0 1.6em;padding:12px 14px;border-left:4px solid #38bdf8;background:#f0f9ff;border-radius:8px;color:#334155;font-size:15px;line-height:1.85;">${renderInlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph(paragraph, out);
      if (listItems.length && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph(paragraph, out);
      if (listItems.length && listOrdered) flushList();
      listOrdered = false;
      listItems.push(unordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  if (inCode) {
    out.push(`<pre style="background:#111827;color:#e5e7eb;border-radius:8px;padding:14px 16px;overflow:auto;font-size:13px;line-height:1.7;margin:0 0 1.6em;"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  flushAll();
  return out.join('\n');
}

function renderHtml(entry, markdown, total) {
  const series = `AI-FDE 书稿连载 ${String(entry.order + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
  const lead = entry.digest;
  const body = renderMarkdownBody(markdown);
  return `<section style="max-width:600px;margin:20px auto;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,'PingFang SC','Microsoft YaHei',sans-serif;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
  <section style="background:linear-gradient(135deg,#0f172a,#1d4ed8 62%,#0ea5e9);padding:38px 26px 34px;color:#ffffff;">
    <span style="display:inline-block;background:rgba(255,255,255,0.18);padding:5px 11px;border-radius:20px;font-size:12px;line-height:1.4;margin-bottom:16px;">${escapeHtml(series)}</span>
    <h1 style="font-size:24px;font-weight:800;line-height:1.4;margin:0 0 14px;letter-spacing:0;">${escapeHtml(entry.wechatTitle)}</h1>
    <p style="font-size:14px;line-height:1.8;margin:0;color:rgba(255,255,255,0.86);">${escapeHtml(lead)}</p>
  </section>
  <section style="padding:28px 22px 30px;background:#ffffff;">
    <section style="margin:0 0 24px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
      <p style="font-size:14px;line-height:1.85;color:#475569;margin:0;"><strong style="color:#1e40af;">本篇导读：</strong>${escapeHtml(lead)}</p>
    </section>
${body}
  </section>
  <section style="padding:18px 20px;text-align:center;background:#f8fafc;border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 4px;color:#64748b;font-size:12px;line-height:1.7;">${escapeHtml(DEFAULT_COLLECTION)}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">Generated by ${escapeHtml(entry.author || DEFAULT_AUTHOR)}</p>
  </section>
</section>
`;
}

function createQueue(options = {}) {
  ensureDirs();
  const entries = listManuscripts().map((entry) => ({
    ...entry,
    collection: options.collection || entry.collection,
    category: options.category || entry.category,
  }));
  for (const entry of entries) {
    entry.html = path.join(HTML_DIR, outputHtmlName(entry));
  }
  writeUtf8(QUEUE_PATH, `${JSON.stringify(entries, null, 2)}\n`);
  return entries;
}

function loadQueue(options = {}) {
  if (!fs.existsSync(QUEUE_PATH)) return createQueue(options);
  const entries = JSON.parse(readUtf8(QUEUE_PATH));
  return entries.map((entry) => ({
    ...entry,
    collection: options.collection || entry.collection || DEFAULT_COLLECTION,
    category: options.category || entry.category || DEFAULT_CATEGORY,
    author: entry.author || DEFAULT_AUTHOR,
  }));
}

function build(options) {
  const entries = createQueue(options);
  const selected = applyRange(entries, options);
  const total = entries.length;
  for (const entry of selected) {
    const markdown = readUtf8(entry.source);
    const html = renderHtml(entry, markdown, total);
    writeUtf8(entry.html, html);
    console.log(`[build] ${entry.id} -> ${entry.html}`);
  }
  console.log(`[build] generated ${selected.length}/${entries.length} WeChat HTML files.`);
}

function validate(options) {
  const entries = applyRange(loadQueue(options), options);
  const banned = /<html|<head|<body|position\s*:\s*(absolute|fixed)|gap\s*:|<script|<link|background-image\s*:\s*url|backdrop-filter|mask|filter\s*:|clip-path/iu;
  let errors = 0;
  for (const entry of entries) {
    if (!fs.existsSync(entry.html)) {
      console.error(`[fail] missing html: ${entry.html}`);
      errors += 1;
      continue;
    }
    const html = readUtf8(entry.html);
    const hit = html.match(banned);
    if (hit) {
      console.error(`[fail] banned html/css in ${entry.id}: ${hit[0]}`);
      errors += 1;
    } else {
      console.log(`[ok] ${entry.id}`);
    }
  }
  if (errors) {
    console.error(`[validate] failed with ${errors} error(s).`);
    process.exit(1);
  }
  console.log(`[validate] passed for ${entries.length} file(s).`);
}

function buildPublishArgs(entry, options, mode = 'html') {
  if (mode === 'raw-content') {
    const args = [
      CLI_PATH,
      'publish',
      '--file', entry.html,
      '--title', entry.wechatTitle,
      '--collection', entry.collection || DEFAULT_COLLECTION,
      '--category', entry.category || DEFAULT_CATEGORY,
      '--digest', entry.digest,
      '--author', entry.author || DEFAULT_AUTHOR,
      '--cover', 'auto',
      '--raw',
    ];
    if (options['dry-run']) args.push('--dry-run');
    return args;
  }

  const args = [
    CLI_PATH,
    'publish-html',
    '--html-file', entry.html,
    '--title', entry.wechatTitle,
    '--collection', entry.collection || DEFAULT_COLLECTION,
    '--category', entry.category || DEFAULT_CATEGORY,
    '--digest', entry.digest,
    '--author', entry.author || DEFAULT_AUTHOR,
    '--cover', 'auto',
  ];
  if (options['dry-run']) args.push('--dry-run');
  return args;
}

function runNode(args) {
  const result = spawnSync('node', args, {
    cwd: CLI_CWD,
    encoding: 'utf8',
    timeout: 180000,
  });

  return {
    command: `node ${args.map((arg) => (/\s/.test(arg) ? JSON.stringify(arg) : arg)).join(' ')}`,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error ? String(result.error) : null,
  };
}

function runPublishCli(entry, options) {
  if (!options['try-html']) {
    return runNode(buildPublishArgs(entry, options, 'raw-content'));
  }

  const htmlArgs = buildPublishArgs(entry, options, 'html');
  const first = runNode(htmlArgs);
  const output = `${first.stdout || ''}\n${first.stderr || ''}`;
  const missingHtmlEndpoint = first.status !== 0 && output.includes('/external/wechat/autojob/publish-html');

  if (!missingHtmlEndpoint) {
    return first;
  }

  const rawArgs = buildPublishArgs(entry, options, 'raw-content');
  const second = runNode(rawArgs);
  return {
    ...second,
    fallbackFrom: first,
    fallbackReason: 'publish-html endpoint missing; retried publish --file <html> --raw',
  };
}

function publish(options) {
  validate(options);
  const entries = applyRange(loadQueue(options), options);
  const summary = [];
  for (const entry of entries) {
    console.log(`[publish${options['dry-run'] ? ':dry-run' : ''}] ${entry.id} ${entry.wechatTitle}`);
    const result = runPublishCli(entry, options);
    const logPath = path.join(LOG_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}_${entry.id}${options['dry-run'] ? '_dry-run' : ''}.json`);
    writeUtf8(logPath, `${JSON.stringify({ entry, result }, null, 2)}\n`);
    summary.push({ id: entry.id, title: entry.wechatTitle, status: result.status, log: logPath });
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      console.error(`[publish] stopped at ${entry.id}. See log: ${logPath}`);
      process.exit(result.status || 1);
    }
  }
  const summaryPath = path.join(LOG_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}_summary${options['dry-run'] ? '_dry-run' : ''}.json`);
  writeUtf8(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`[publish] done. summary: ${summaryPath}`);
}

const { command, options } = parseArgs(process.argv.slice(2));

if (command === 'help') usage();
else if (command === 'build') build(options);
else if (command === 'validate') validate(options);
else if (command === 'publish') publish(options);
else {
  usage();
  process.exit(1);
}
