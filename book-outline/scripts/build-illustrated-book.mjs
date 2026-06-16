#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOK_ROOT = path.resolve(__dirname, '..');
const MANUSCRIPT_DIR = path.join(BOOK_ROOT, 'manuscript');
const OUT_DIR = path.join(BOOK_ROOT, 'online-release');
const HTML_PATH = path.join(OUT_DIR, 'AI-FDE-illustrated-online.html');
const PDF_PATH = path.join(OUT_DIR, 'AI-FDE-illustrated-mobile.pdf');
const PUPPETEER_ENTRY = 'D:\\ai-source-code\\yunjing-mcp\\node_modules\\puppeteer\\lib\\esm\\puppeteer\\puppeteer.js';

const BOOK_TITLE = 'AI-FDE：产业 AI 落地的新生产力体系';
const BOOK_SUBTITLE = '从团队资源数字化平台、全栈交付到数字员工运维的 AI Native 组织方法论';
const AUTHOR = '渔夫-AI';
const VERSION = '图文移动阅读版';
const DATE_TEXT = '2026-06-14';

const FIGURES = {
  CH01: {
    type: 'funnel',
    title: '从 AI 热度到业务成果，中间隔着一道很厚的落地层',
    lead: '第一章讲宏观事实。为了避免把“AI 很热”误读成“AI 已经产生深度成果”，这里先把热度、投入、试点和成果之间的层级关系摊开。',
    caption: 'AI 投入和工具使用正在普及，但真正形成业务成果的组织仍然很少。',
    items: [
      ['资本与预算进入', '模型、算力、应用、咨询和服务开始进入企业预算。'],
      ['工具和试点铺开', '知识库、客服、代码辅助、办公自动化和 Agent 试点快速增加。'],
      ['流程和数据改造', '真实生产力提升必须进入业务流程、数据结构和组织协同。'],
      ['成果验证闭环', '效率、质量、风险、收入或成本必须被验证，才算落地。'],
    ],
  },
  CH03: {
    type: 'flow',
    title: '传统产业 AI 交付的主要损耗，不在写代码，而在链条过长',
    lead: '第三章讨论传统交付为什么在 AI 项目里变慢。图里每一段交接都可能产生信息变形、责任稀释和返工。',
    caption: '链条越长，真实业务问题越容易在转述中失真。',
    items: [
      ['销售/售前', '把业务现象翻译成方案承诺'],
      ['产品/架构', '把方案承诺翻译成需求和技术路线'],
      ['研发/测试', '把需求翻译成功能并验证缺陷'],
      ['实施/运维', '把功能推到现场并处理后续问题'],
      ['客户成果', '流程跑通、人员采用、结果可验证'],
    ],
  },
  CH04: {
    type: 'hub',
    title: 'FDE 不是多做几个岗位动作，而是把成果责任收束到现场',
    lead: '第四章给 FDE 下定义。这里的核心不是“一个人会很多技能”，而是这个人站在现场，对需求、方案、交付和结果之间的连续性负责。',
    caption: 'FDE 把过去分散在多岗位之间的责任链条重新组织成成果闭环。',
    center: ['FDE', '现场成果负责人'],
    items: [
      ['业务解构', '看懂真实问题'],
      ['方案判断', '确定技术路径'],
      ['快速搭建', '调用基础设施'],
      ['现场迭代', '用反馈校准'],
      ['成果验证', '确认业务结果'],
      ['资产沉淀', '反哺组织能力'],
    ],
  },
  CH05: {
    type: 'cycle',
    title: 'AI-FDE 的标准工作闭环：从进入现场到资产沉淀',
    lead: '第五章进入方法论。FDE 的工作不是线性瀑布，而是一组持续校准的闭环动作。',
    caption: '闭环的价值在于让变化尽早暴露，并把每次变化沉淀为组织资产。',
    items: [
      ['进入现场', '确认场景和真实约束'],
      ['需求解构', '拆出对象、流程、规则'],
      ['方案架构', '确定系统和数据边界'],
      ['快速搭建', '让业务尽快跑起来'],
      ['现场迭代', '用反馈修正方向'],
      ['业务验证', '验证成果而非功能'],
      ['资产沉淀', '形成可复用基础设施'],
    ],
  },
  CH07: {
    type: 'hub',
    title: 'AI 把 FDE 武装成一支小队，但不替 FDE 承担最终责任',
    lead: '第七章解释 AI 的真实作用。AI 不是替代 FDE，而是把 FDE 的分析、生成、验证和运维能力放大。',
    caption: 'AI 工具链让一个 FDE 获得过去小队级别的工作支撑。',
    center: ['FDE', '责任与判断'],
    items: [
      ['通用大模型', '分析、总结、推理'],
      ['代码/文档工具', '生成实现材料'],
      ['MCP 工具链', '连接平台能力'],
      ['Agent 工作流', '执行半自动任务'],
      ['数字员工', '持续监控与运维'],
      ['知识资产库', '复用历史经验'],
    ],
  },
  CH08: {
    type: 'stack',
    title: 'FDE 的壁垒不是个人能力，而是公司级系统能力',
    lead: '第八章收束上篇。真正难复制的不是“找一个聪明人”，而是让聪明人背后有完整体系托举。',
    caption: '人才、基础设施、组织和机制共同决定 FDE 能不能规模化出现。',
    items: [
      ['机制底座', '定价、复盘、资产沉淀和持续改进'],
      ['组织底座', '授权、协同、现场响应和结果责任'],
      ['技术底座', '平台、数据、工具链、Agent 和运维能力'],
      ['人才底座', '能跑通业务闭环的复合型 FDE'],
    ],
  },
  CH09: {
    type: 'stack',
    title: '团队资源数字化平台退回基础设施位置后，反而更关键',
    lead: '第九章讨论平台价值重估。它不再是前台售卖的产品主角，而是 FDE 体系的底层操作系统。',
    caption: '基础设施不一定最“值钱”，但离开它，FDE 的现场闭环跑不起来。',
    items: [
      ['多客户/多场景复用', '租户、模板、扩展模块和项目资产'],
      ['Web2 与行业工作台', '补足复杂场景的人机交互界面'],
      ['MCP 工具链', '让人和 Agent 共同调用平台能力'],
      ['BPM/菜单/权限/租户', '企业系统治理的四件套'],
      ['数据结构治理', '业务对象、关系、表单和流程的统一入口'],
    ],
  },
  CH10: {
    type: 'flow',
    title: 'AI 时代的交付终点不是系统上线，而是客户成果发生',
    lead: '第十章把基础设施落到工作流。图里最后一格不是“上线”，而是“成果确认”。',
    caption: '需求只有被推到业务结果，才完成了 AI-FDE 的交付闭环。',
    items: [
      ['场景确认', '谁在什么约束下解决什么问题'],
      ['结构建模', '对象、字段、关系、权限和流程'],
      ['基础设施搭建', '表单、菜单、BPM、角色和数据'],
      ['现场试跑', '让真实用户进入流程'],
      ['成果确认', '验证效率、质量、风险或经营结果'],
    ],
  },
  CH11: {
    type: 'architecture',
    title: '复杂行业案例的关键，是把混乱现场翻译成可计算结构',
    lead: '第十一章用风洞排程作为复杂行业实践样本。真正难点不只是做一个排程页面，而是把资源、项目、任务、人员、维护和时间窗口变成可以协同计算的结构。',
    caption: '复杂行业落地需要同时处理业务建模、算法插件、工作台和人机协同。',
    items: [
      ['现场约束', '资源、项目、任务、人员、维护、时间窗口'],
      ['数据结构治理', '把约束翻译成对象、关系和规则'],
      ['排程策略插件', '多策略计算、冲突识别、方案比较'],
      ['Web2 工作台', '让业务人员理解、调整和确认方案'],
      ['人机协同决策', 'AI 提供方案，人负责业务取舍'],
    ],
  },
  CH12: {
    type: 'cycle',
    title: '数字员工运维让 FDE 体系从“交付一次”变成“持续运营”',
    lead: '第十二章把视角从交付转向运营。AI-FDE 体系不是把系统交出去就结束，而是让运维、监控、故障处理和知识沉淀持续发生。',
    caption: '数字员工运维是 FDE 体系的持续运营面。',
    items: [
      ['主动监控', '发现异常和趋势'],
      ['故障诊断', '定位环境、数据、脚本或配置问题'],
      ['工具脚本', '执行可控修复动作'],
      ['Agent 协作', '处理重复性分析和检查'],
      ['人工确认', '高风险动作由人最终判断'],
      ['知识沉淀', '把故障经验变成下一次资产'],
    ],
  },
  CH16: {
    type: 'roadmap',
    title: 'FDE 人才不是招聘出来的，而是在体系中训练出来的',
    lead: '第十六章回答人才培养问题。成熟 FDE 不是单点技能叠加，而是通过项目、平台、复盘和现场责任逐步长出来。',
    caption: 'FDE 培养需要从工具使用走向现场闭环，再走向资产和组织能力。',
    items: [
      ['工具熟练', '会使用 AI、平台和脚本提高个人效率'],
      ['项目参与', '在真实项目里承担局部闭环'],
      ['现场负责', '能独立推进需求到成果'],
      ['资产沉淀', '把经验转为模板、脚本和方法'],
      ['体系带人', '培养下一批 FDE'],
    ],
  },
  CH18: {
    type: 'roadmap',
    title: '企业落地 AI-FDE，不是先买工具，而是先搭闭环',
    lead: '第十八章面向传统企业给出落地路径。真正要做的不是立刻复制一个岗位名称，而是逐步建立能跑通成果的最小体系。',
    caption: '企业可以从试点闭环开始，逐步建设基础设施、人才和持续运营机制。',
    items: [
      ['0-30 天', '选一个真实业务场景，定义可验证成果'],
      ['30-60 天', '搭建最小数据结构和工具链闭环'],
      ['60-90 天', '引入 FDE 责任人，跑通现场迭代'],
      ['90 天以后', '沉淀资产，扩展到更多场景'],
    ],
  },
};

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

function renderMarkdown(markdown) {
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
      referenceMode = false;
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

  if (inCode) out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  flushAll();
  return out.join('\n');
}

function renderFlow(items) {
  return `<div class="diagram-flow">
    ${items.map((item, index) => `<div class="flow-step">
      <div class="flow-index">${String(index + 1).padStart(2, '0')}</div>
      <div class="flow-title">${escapeHtml(item[0])}</div>
      <div class="flow-desc">${escapeHtml(item[1])}</div>
    </div>`).join('<div class="flow-arrow">→</div>')}
  </div>`;
}

function renderFunnel(items) {
  return `<div class="diagram-funnel">
    ${items.map((item, index) => `<div class="funnel-step" style="width:${100 - index * 10}%">
      <span>${escapeHtml(item[0])}</span>
      <small>${escapeHtml(item[1])}</small>
    </div>`).join('')}
  </div>`;
}

function renderStack(items) {
  return `<div class="diagram-stack">
    ${items.map((item, index) => `<div class="stack-layer">
      <div class="stack-no">${String(items.length - index).padStart(2, '0')}</div>
      <div>
        <strong>${escapeHtml(item[0])}</strong>
        <span>${escapeHtml(item[1])}</span>
      </div>
    </div>`).join('')}
  </div>`;
}

function renderHub(def) {
  return `<div class="diagram-hub">
    <div class="hub-center"><strong>${escapeHtml(def.center[0])}</strong><span>${escapeHtml(def.center[1])}</span></div>
    <div class="hub-items">
      ${def.items.map((item) => `<div class="hub-item"><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(item[1])}</span></div>`).join('')}
    </div>
  </div>`;
}

function renderCycle(items) {
  return `<div class="diagram-cycle">
    ${items.map((item, index) => `<div class="cycle-step">
      <div class="cycle-no">${index + 1}</div>
      <strong>${escapeHtml(item[0])}</strong>
      <span>${escapeHtml(item[1])}</span>
    </div>`).join('')}
  </div>`;
}

function renderArchitecture(items) {
  return `<div class="diagram-architecture">
    ${items.map((item, index) => `<div class="arch-node">
      <div class="arch-no">${String(index + 1).padStart(2, '0')}</div>
      <strong>${escapeHtml(item[0])}</strong>
      <span>${escapeHtml(item[1])}</span>
    </div>`).join('')}
  </div>`;
}

function renderRoadmap(items) {
  return `<div class="diagram-roadmap">
    ${items.map((item, index) => `<div class="road-step">
      <div class="road-dot">${index + 1}</div>
      <strong>${escapeHtml(item[0])}</strong>
      <span>${escapeHtml(item[1])}</span>
    </div>`).join('')}
  </div>`;
}

function renderFigure(chapterId, figureNo) {
  const def = FIGURES[chapterId];
  if (!def) return '';
  const visual = {
    flow: () => renderFlow(def.items),
    funnel: () => renderFunnel(def.items),
    stack: () => renderStack(def.items),
    hub: () => renderHub(def),
    cycle: () => renderCycle(def.items),
    architecture: () => renderArchitecture(def.items),
    roadmap: () => renderRoadmap(def.items),
  }[def.type]();

  return `<section class="figure-lead">${escapeHtml(def.lead)}</section>
  <figure class="book-figure figure-${def.type}">
    <div class="figure-meta">图 ${figureNo} · ${escapeHtml(chapterId)}</div>
    <h3>${escapeHtml(def.title)}</h3>
    ${visual}
    <figcaption>${escapeHtml(def.caption)}</figcaption>
  </figure>`;
}

function renderChapter(chapter, figureNo) {
  return `<article class="chapter" id="${chapter.id}">
    <section class="chapter-opening">
      <div class="chapter-kicker">${chapter.id}</div>
      <h1>${escapeHtml(chapter.title)}</h1>
    </section>
    ${renderFigure(chapter.id, figureNo)}
    <section class="chapter-body">
      ${renderMarkdown(chapter.markdown)}
    </section>
  </article>`;
}

function renderToc(chapters) {
  return `<section class="toc page" id="toc">
    <div class="section-label">CONTENTS</div>
    <h1>目录</h1>
    <ol>
      ${chapters.map((chapter) => `<li><span>${chapter.id}</span><a href="#${chapter.id}">${escapeHtml(chapter.title)}</a></li>`).join('\n')}
    </ol>
  </section>`;
}

function renderFigureIndex(chapters) {
  let no = 1;
  const items = chapters
    .filter((chapter) => FIGURES[chapter.id])
    .map((chapter) => {
      const figure = FIGURES[chapter.id];
      return `<li><span>图 ${no++}</span><a href="#${chapter.id}">${escapeHtml(figure.title)}</a></li>`;
    })
    .join('\n');
  return `<section class="figure-index page">
    <div class="section-label">DIAGRAMS</div>
    <h1>图解索引</h1>
    <ol>${items}</ol>
  </section>`;
}

function renderCover() {
  return `<section class="cover page">
    <div class="cover-field"></div>
    <div class="cover-grid"></div>
    <div class="cover-rail">FIELD DEPLOYED AI</div>
    <div class="cover-mark">AI-FDE</div>
    <div class="cover-content">
      <div class="cover-tag">图文移动阅读版</div>
      <h1>${escapeHtml(BOOK_TITLE)}</h1>
      <p>${escapeHtml(BOOK_SUBTITLE)}</p>
      <div class="cover-meta">
        <span>${escapeHtml(AUTHOR)}</span>
        <span>${escapeHtml(VERSION)}</span>
        <span>${escapeHtml(DATE_TEXT)}</span>
      </div>
    </div>
  </section>`;
}

function renderIntro() {
  return `<section class="intro page">
    <div class="section-label">READING GUIDE</div>
    <h1>图文版说明</h1>
    <p>这一版面向线上发布和移动端阅读，在原有二十章正文基础上增加示意图。图不是装饰，而是帮助读者在进入长章节之前先抓住结构：哪里是行业事实，哪里是交付机制，哪里是基础设施，哪里是人才和组织。</p>
    <p>每张图前都有一句楔子说明，解释它为什么放在这里。读者可以先顺着图读全书框架，再回到正文看论证细节。</p>
    <div class="note-card">
      <strong>核心阅读方式</strong>
      <span>先看图，建立地图；再读正文，理解现场；最后回到图，检查这套体系是否能迁移到自己的企业。</span>
    </div>
  </section>`;
}

function renderStyles() {
  return `<style>
    :root {
      color-scheme: light;
      --ink: #10141d;
      --text: #252b36;
      --muted: #667085;
      --line: #d8dee8;
      --paper: #ffffff;
      --soft: #f6f7f9;
      --accent: #203a5f;
      --teal: #25656e;
      --teal-soft: #eef5f6;
      --surface: #f7f8fa;
      --rule: #aeb8c6;
    }

    * { box-sizing: border-box; }

    html {
      scroll-behavior: smooth;
      background: #f2f3f5;
    }

    body {
      margin: 0;
      color: var(--text);
      background: #f2f3f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
    }

    a { color: inherit; }

    .book-shell {
      width: min(100%, 880px);
      margin: 0 auto;
      background: var(--paper);
      box-shadow: 0 26px 84px rgba(16, 20, 29, .10);
    }

    .page, .chapter {
      position: relative;
      padding: 56px 48px 66px;
      background: var(--paper);
    }

    .cover {
      min-height: 100svh;
      padding: 0;
      overflow: hidden;
      color: #fff;
      background: #07111f;
      isolation: isolate;
    }

    .cover-field {
      position: absolute;
      inset: 0;
      z-index: 0;
      background:
        linear-gradient(90deg, rgba(14,116,144,.26) 0 1px, transparent 1px 64px),
        linear-gradient(0deg, rgba(148,163,184,.11) 0 1px, transparent 1px 54px),
        radial-gradient(circle at 82% 18%, rgba(14,165,233,.34), transparent 30%),
        radial-gradient(circle at 12% 90%, rgba(37,99,235,.24), transparent 32%),
        linear-gradient(135deg, #050914 0%, #0f172a 46%, #0b3f59 100%);
    }

    .cover-grid {
      position: absolute;
      right: -72px;
      top: 52px;
      width: 360px;
      height: 360px;
      border: 1px solid rgba(226,232,240,.22);
      transform: rotate(11deg);
      opacity: .82;
      z-index: 1;
      background:
        linear-gradient(rgba(226,232,240,.10) 1px, transparent 1px),
        linear-gradient(90deg, rgba(226,232,240,.10) 1px, transparent 1px);
      background-size: 42px 42px;
    }

    .cover::after {
      content: "";
      position: absolute;
      left: 42px;
      right: 42px;
      bottom: 44px;
      height: 1px;
      background: linear-gradient(90deg, rgba(226,232,240,.7), transparent);
      z-index: 2;
    }

    .cover-rail {
      position: absolute;
      left: 24px;
      top: 30px;
      z-index: 2;
      writing-mode: vertical-rl;
      color: rgba(226,232,240,.38);
      font-size: 11px;
      letter-spacing: 2px;
      font-weight: 700;
    }

    .cover-mark {
      position: absolute;
      left: 42px;
      bottom: 72px;
      z-index: 1;
      color: rgba(255,255,255,.055);
      font-size: clamp(64px, 19vw, 132px);
      line-height: 1;
      font-weight: 900;
      letter-spacing: 0;
    }

    .cover-content {
      position: relative;
      z-index: 3;
      width: min(78%, 620px);
      padding-top: 22vh;
      margin-left: 76px;
    }

    .cover-tag {
      display: inline-block;
      padding: 0 0 8px;
      border-bottom: 1px solid rgba(226,232,240,.54);
      color: rgba(226,232,240,.78);
      font-size: 13px;
      letter-spacing: 1px;
      margin-bottom: 34px;
    }

    .cover h1 {
      margin: 0;
      font-size: clamp(34px, 7vw, 58px);
      line-height: 1.14;
      letter-spacing: 0;
      font-weight: 900;
    }

    .cover p {
      width: min(100%, 560px);
      margin: 28px 0 0;
      font-size: clamp(17px, 3.2vw, 22px);
      line-height: 1.72;
      color: rgba(255,255,255,.82);
    }

    .cover-meta {
      display: flex;
      flex-wrap: wrap;
      margin-top: 44px;
    }

    .cover-meta span {
      display: inline-flex;
      margin: 0 10px 10px 0;
      padding: 7px 11px;
      border: 1px solid rgba(226,232,240,.2);
      color: rgba(226,232,240,.78);
      background: rgba(15,23,42,.35);
      font-size: 13px;
    }

    .section-label, .chapter-kicker {
      display: inline-block;
      color: var(--accent);
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .intro h1, .toc h1, .figure-index h1 {
      margin: 0 0 18px;
      color: var(--ink);
      font-size: 38px;
      line-height: 1.28;
    }

    .intro p {
      margin: 0 0 1.15em;
      color: #243044;
      font-size: 20px;
      line-height: 2.02;
      text-align: justify;
    }

    .note-card {
      margin-top: 32px;
      padding: 20px 22px;
      border-top: 1px solid var(--rule);
      border-bottom: 1px solid var(--rule);
      background: #f8fafb;
    }

    .note-card strong {
      display: block;
      color: #1e3a8a;
      margin-bottom: 8px;
    }

    .note-card span {
      display: block;
      line-height: 1.9;
    }

    .toc ol, .figure-index ol {
      list-style: none;
      padding: 0;
      margin: 22px 0 0;
    }

    .toc li, .figure-index li {
      display: flex;
      padding: 13px 0;
      border-bottom: 1px solid rgba(174, 184, 198, .38);
      break-inside: avoid;
    }

    .toc li span, .figure-index li span {
      width: 58px;
      flex: 0 0 auto;
      color: var(--accent);
      font-weight: 800;
      font-size: 14px;
    }

    .toc a, .figure-index a {
      text-decoration: none;
      color: #1f2937;
      font-size: 18px;
      line-height: 1.58;
    }

    .chapter-opening {
      padding: 12px 0 28px;
      margin: 0 0 26px;
      text-align: center;
      border-bottom: 1px solid var(--line);
    }

    .chapter-opening h1 {
      max-width: 760px;
      margin: 0 auto;
      color: var(--ink);
      font-size: 32px;
      line-height: 1.32;
      font-weight: 850;
    }

    .figure-lead {
      margin: 6px 0 18px;
      padding: 14px 0 14px 18px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      border-left: 2px solid var(--teal);
      background: #ffffff;
      color: #334155;
      font-size: 17px;
      line-height: 1.95;
    }

    .book-figure {
      margin: 0 0 44px;
      padding: 22px 0 18px;
      border-top: 1px solid #9aa7b8;
      border-bottom: 1px solid #d7dee8;
      background: #ffffff;
      box-shadow: none;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .figure-meta {
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .book-figure h3 {
      margin: 0 0 18px;
      color: var(--ink);
      font-size: 21px;
      line-height: 1.45;
    }

    .book-figure figcaption {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(174, 184, 198, .42);
      color: var(--muted);
      font-size: 14px;
      line-height: 1.7;
    }

    .diagram-flow {
      display: grid;
      grid-template-columns: 1fr;
      border-top: 1px solid rgba(154, 167, 184, .42);
      margin-top: 4px;
    }

    .flow-step, .hub-item, .cycle-step, .arch-node, .road-step {
      border: 0;
      border-bottom: 1px solid rgba(154, 167, 184, .42);
      background: transparent;
      border-radius: 0;
      box-shadow: none;
    }

    .flow-step {
      display: grid;
      grid-template-columns: 42px minmax(120px, .8fr) 1.2fr;
      gap: 14px;
      align-items: start;
      padding: 14px 0;
      margin: 0;
    }

    .flow-arrow {
      display: none;
    }

    .flow-index, .stack-no, .arch-no, .cycle-no, .road-dot {
      color: var(--accent);
      font-weight: 900;
      font-size: 13px;
      margin-bottom: 7px;
      letter-spacing: .5px;
    }

    .flow-title, .hub-item strong, .cycle-step strong, .arch-node strong, .road-step strong {
      display: block;
      color: var(--ink);
      font-weight: 800;
      font-size: 16px;
      line-height: 1.45;
      margin-bottom: 5px;
    }

    .flow-desc, .hub-item span, .cycle-step span, .arch-node span, .road-step span {
      display: block;
      color: #64748b;
      font-size: 13.5px;
      line-height: 1.68;
    }

    .diagram-funnel {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      border-top: 1px solid rgba(154, 167, 184, .42);
    }

    .funnel-step {
      margin: 0;
      padding: 14px 0 14px 18px;
      border-left: 3px solid var(--teal);
      border-bottom: 1px solid rgba(154, 167, 184, .42);
      border-radius: 0;
      color: var(--ink);
      background: transparent;
    }

    .funnel-step span {
      display: block;
      font-weight: 850;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .funnel-step small {
      display: block;
      color: #64748b;
      font-size: 12px;
      line-height: 1.55;
    }

    .diagram-stack {
      display: flex;
      flex-direction: column;
      border-top: 1px solid rgba(154, 167, 184, .42);
    }

    .stack-layer {
      display: flex;
      align-items: flex-start;
      padding: 14px 0;
      margin: 0;
      border-left: 0;
      border-top: 0;
      border-right: 0;
      border-bottom: 1px solid rgba(154, 167, 184, .42);
      background: transparent;
      border-radius: 0;
      box-shadow: none;
    }

    .stack-no {
      width: 34px;
      flex: 0 0 auto;
      margin-right: 10px;
    }

    .stack-layer strong {
      display: block;
      color: #111827;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .stack-layer span {
      display: block;
      color: #64748b;
      font-size: 13px;
      line-height: 1.6;
    }

    .diagram-hub {
      display: grid;
      grid-template-columns: minmax(142px, 190px) 1fr;
      align-items: stretch;
      border-top: 1px solid rgba(154, 167, 184, .42);
      border-bottom: 1px solid rgba(154, 167, 184, .42);
    }

    .hub-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 160px;
      padding: 20px 18px 20px 0;
      margin-right: 20px;
      border-right: 3px solid var(--teal);
      border-radius: 0;
      color: var(--ink);
      background: transparent;
    }

    .hub-center strong {
      font-size: 30px;
      line-height: 1;
      margin-bottom: 10px;
    }

    .hub-center span {
      font-size: 14px;
      color: #64748b;
    }

    .hub-items {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .hub-item {
      padding: 13px 0;
      margin: 0 18px 0 0;
    }

    .diagram-cycle, .diagram-architecture, .diagram-roadmap {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 22px;
      border-top: 1px solid rgba(154, 167, 184, .42);
    }

    .cycle-step, .arch-node, .road-step {
      position: relative;
      min-height: 74px;
      padding: 14px 0 14px 42px;
      margin: 0;
    }

    .cycle-no, .arch-no, .road-dot {
      position: absolute;
      left: 0;
      top: 16px;
      min-width: 26px;
    }

    .chapter-body {
      max-width: 720px;
      margin: 0 auto;
    }

    .chapter-body h2 {
      margin: 2.15em 0 .72em;
      color: var(--ink);
      font-size: 25px;
      line-height: 1.44;
      font-weight: 850;
      page-break-after: avoid;
    }

    .chapter-body h2.references-heading {
      margin-top: 2em;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
      font-weight: 700;
    }

    .chapter-body h3 {
      margin: 1.75em 0 .68em;
      color: #1f2937;
      font-size: 21px;
      line-height: 1.5;
      page-break-after: avoid;
    }

    .chapter-body p {
      margin: 0 0 .9em;
      color: #243044;
      font-size: 19px;
      line-height: 2.08;
      text-indent: 2em;
      text-align: justify;
      text-justify: inter-ideograph;
    }

    .chapter-body blockquote {
      margin: 1.2em 0;
      padding: 12px 0 12px 18px;
      border-left: 3px solid var(--teal);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      background: #ffffff;
      color: #334155;
      border-radius: 0;
      line-height: 2;
    }

    .chapter-body ul, .chapter-body ol {
      margin: .8em 0 1.2em 1.4em;
      padding-left: 1em;
      color: #243044;
      font-size: 19px;
      line-height: 2;
    }

    .chapter-body li {
      margin: 0 0 .45em;
    }

    .chapter-body .references-list,
    .chapter-body p.references-paragraph {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
      word-break: break-all;
    }

    code {
      font-family: Consolas, "SFMono-Regular", monospace;
      color: #203a5f;
      background: #f1f5f9;
      border-radius: 0;
      padding: 1px 4px;
      font-size: .86em;
    }

    pre {
      margin: 0 0 1.5em;
      padding: 14px 16px;
      background: #111827;
      color: #e5e7eb;
      border-radius: 0;
      overflow: auto;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.7;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .back-top {
      display: block;
      width: fit-content;
      margin: 32px auto 0;
      padding: 9px 13px;
      border: 1px solid var(--line);
      border-radius: 0;
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
    }

    @media (max-width: 640px) {
      html, body { background: #ffffff; }
      .book-shell { width: 100%; box-shadow: none; }
      .page, .chapter { padding: 36px 26px 48px; }
      .cover-content { margin-left: 44px; width: calc(100% - 66px); padding-top: 18vh; }
      .cover::after { left: 28px; right: 28px; }
      .cover-mark { left: 28px; bottom: 68px; }
      .intro p { font-size: 19px; line-height: 2.06; }
      .toc a, .figure-index a { font-size: 17px; line-height: 1.62; }
      .chapter-opening { margin-bottom: 24px; }
      .chapter-opening h1 { font-size: 26px; line-height: 1.36; }
      .figure-lead { font-size: 17px; line-height: 2.02; padding: 15px 16px; }
      .book-figure { padding: 20px 18px 18px; margin-bottom: 38px; }
      .book-figure h3 { font-size: 20px; line-height: 1.5; }
      .chapter-body p { font-size: 19px; line-height: 2.08; }
      .chapter-body h2 { font-size: 24px; line-height: 1.48; }
      .chapter-body h3 { font-size: 21px; line-height: 1.55; }
      .flow-step { grid-template-columns: 34px 1fr; gap: 8px 12px; }
      .flow-desc { grid-column: 2; }
      .diagram-hub { grid-template-columns: 1fr; }
      .hub-center { margin-right: 0; margin-bottom: 0; min-height: 120px; border-right: 0; border-bottom: 3px solid var(--teal); padding: 18px 0; }
      .hub-items, .diagram-cycle, .diagram-architecture, .diagram-roadmap { grid-template-columns: 1fr; }
      .flow-arrow { display: none; }
      .funnel-step { width: 100% !important; }
    }

    @page { size: A4; margin: 0; }

    @media print {
      html, body { background: #fff; }
      .book-shell { width: 100%; box-shadow: none; }
      .cover {
        width: 210mm;
        height: 297mm;
        min-height: 297mm;
        page-break-after: always;
        break-after: page;
      }
      .page, .chapter {
        padding: 8mm 7.5mm 9mm;
        page-break-after: always;
        break-after: page;
      }
      .intro h1, .toc h1, .figure-index h1 { font-size: 48px; }
      .intro p { font-size: 32px; line-height: 1.56; }
      .toc a, .figure-index a { font-size: 24px; line-height: 1.32; }
      .toc li span, .figure-index li span { font-size: 18px; width: 60px; }
      .chapter-opening { padding: 10mm 0 8mm; margin-bottom: 7mm; }
      .chapter-opening h1 { font-size: 42px; line-height: 1.24; max-width: 180mm; }
      .figure-lead { font-size: 23px; line-height: 1.62; padding: 10px 12px; }
      .book-figure { padding: 14px; margin-bottom: 8mm; box-shadow: none; border-radius: 0; }
      .book-figure h3 { font-size: 25px; line-height: 1.35; }
      .book-figure figcaption { font-size: 16px; line-height: 1.45; }
      .flow-title, .hub-item strong, .cycle-step strong, .arch-node strong, .road-step strong, .stack-layer strong { font-size: 18px; }
      .flow-desc, .hub-item span, .cycle-step span, .arch-node span, .road-step span, .stack-layer span { font-size: 15px; line-height: 1.5; }
      .hub-center strong { font-size: 34px; }
      .chapter-body { max-width: none; }
      .chapter-body h2 { font-size: 39px; line-height: 1.3; margin: 1.6em 0 .55em; }
      .chapter-body h2.references-heading { font-size: 18px; }
      .chapter-body h3 { font-size: 33px; line-height: 1.34; }
      .chapter-body p { font-size: 32px; line-height: 1.54; margin-bottom: .38em; }
      .chapter-body ul, .chapter-body ol { font-size: 30px; line-height: 1.5; }
      .chapter-body blockquote { font-size: 29px; line-height: 1.5; }
      .chapter-body .references-list, .chapter-body p.references-paragraph { font-size: 15px; line-height: 1.35; }
      p, li, blockquote { orphans: 2; widows: 2; }
      .back-top { display: none; }
    }
  </style>`;
}

function renderHtml(chapters) {
  let figureNo = 1;
  const body = [
    renderCover(),
    renderIntro(),
    renderToc(chapters),
    renderFigureIndex(chapters),
    ...chapters.map((chapter) => {
      const currentNo = FIGURES[chapter.id] ? figureNo++ : '';
      return renderChapter(chapter, currentNo);
    }),
  ].join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(BOOK_TITLE)}｜图文移动阅读版</title>
  ${renderStyles()}
</head>
<body>
  <main class="book-shell" id="top">
    ${body}
  </main>
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
  if (!chapters.length) throw new Error(`No manuscript chapters found in ${MANUSCRIPT_DIR}`);
  const html = renderHtml(chapters);
  writeUtf8(HTML_PATH, html);
  console.log(`[html] ${HTML_PATH}`);
  await renderPdf(HTML_PATH, PDF_PATH);
  console.log(`[pdf] ${PDF_PATH}`);
  console.log(`[chapters] ${chapters.length}`);
  console.log(`[figures] ${Object.keys(FIGURES).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
