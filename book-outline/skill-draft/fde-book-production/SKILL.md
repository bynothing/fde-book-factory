---
name: fde-book-production
description: Use for Chinese long-form book projects like the AI-FDE manuscript where the task is to continue from existing content, preserve writing context, improve readability, add explanatory diagrams, create mobile-friendly HTML/PDF editions, adapt chapters into WeChat articles, or manage the writing/production workflow without corrupting clean manuscript files.
---

# FDE Book Production

Use this skill when the user asks to continue, revise, package, illustrate, typeset, publish, or export the AI-FDE book or a similar Chinese long-form technical/business practice book.

## Core stance

- Content first, format second. Read the existing manuscript/state/rules before producing anything.
- Do not silently rewrite the book's thesis. Preserve the author's core judgments unless the user asks for a rewrite.
- Keep clean manuscript files separate from notes, drafts, publishing HTML, PDF output, and generated previews.
- Write in Chinese unless the user asks otherwise.
- Avoid generic AI-style enthusiasm. Prefer sharp claims, concrete evidence, project facts, and disciplined transitions.
- For publishing tasks, produce draft/review artifacts by default. Do not mass-send WeChat content unless explicitly requested.

## First checks

1. Locate the project root and read recovery files if present:
   - `book-outline/WRITING_STATE.md`
   - `book-outline/WRITING_RULES.md`
   - `book-outline/ORIGINAL_BRIEF.md`
   - `book-outline/WORKFLOW_SCRIPT.md`
2. Inspect the active content source:
   - Clean book chapters: `book-outline/manuscript/`
   - Chapter notes/drafts: `book-outline/chapters/`
   - Online/PDF release output: `book-outline/online-release/`
   - WeChat articles: `book-outline/wechat-articles/`
3. If `book-outline/scripts/fde-book-workflow.ps1` exists, run `preflight` or `status` before substantial writing changes.

## Choose the production mode

Infer the mode from the user request:

- **Outline mode**: restructure the book system before chapter writing.
- **Chapter mode**: write or revise one clean manuscript chapter.
- **Article mode**: adapt book ideas into a WeChat/public article.
- **Illustrated release mode**: add architecture/process/explanation diagrams and figure leads.
- **HTML/PDF mode**: create mobile-friendly online HTML and PDF editions.
- **Publishing mode**: generate/validate WeChat-compatible HTML and publish only to draft box.
- **QA mode**: inspect readability, diagram rendering, PDF pages, mobile screenshots, and source separation.

For AI-FDE-specific paths and commands, read `references/fde-book-workflow.md`.

For visual direction, typography, mobile reading, diagram style, and publication polish, read `references/style-design.md` before changing HTML/PDF/WeChat layout.

## Writing rules for this book family

- The book endpoint is "需求到交付成果", not merely "需求到系统".
- The team resource digital platform is infrastructure/data governance, not a foreground software product pitch.
- FDE is not a "super individual"; it is a responsibility role supported by AI tools, infrastructure, digital employee operations, and organizational mechanisms.
- Cases must be processed into mechanisms and industry lessons. Avoid raw client/project leakage and avoid product brochure tone.
- China AI commentary should distinguish media/policy/model/application heat from slower enterprise production-result conversion.

## Diagram rules

Use diagrams when they clarify structure before or during dense chapters:

- Architecture diagrams: platform stack, AI/FDE/tooling/ops relationships.
- Flow diagrams:需求到交付成果, traditional delivery chain, FDE closed-loop workflow.
- Cycle diagrams: digital employee operations, feedback loops, asset sedimentation.
- Roadmaps: talent development, enterprise rollout stages.
- Concept maps: responsibility reconstruction, system barriers, capability models.

Each diagram must include:

1. A short figure lead before the diagram explaining why the reader needs it here.
2. A clear figure title.
3. The diagram body.
4. A short caption stating the takeaway.

Prefer HTML/CSS diagrams for online/PDF editions so they render consistently in browsers and Puppeteer PDFs. Use Mermaid only when the rendering pipeline is explicitly available and verified.

## HTML/PDF output rules

- Online HTML should be standalone, mobile-first, and readable in a browser.
- PDF should be generated from the same HTML when possible to avoid drift.
- Keep source manuscript unchanged unless the task is manuscript editing.
- Export to a dedicated output directory rather than mixing with manuscript files.
- Use visual QA: render PDF pages to images and inspect cover, TOC, diagram pages, body pages, and final page.
- For mobile reading, prioritize readable type, sane line height, narrow margins, and non-overlapping diagrams.
- Treat style as part of meaning: layout, type scale, diagrams, captions, and whitespace must help the reader understand the book's argument, not merely make the page look decorated.

## WeChat output rules

When asked for a WeChat article, use the `wechat-html-publisher` skill if available.

- Draft a separate Markdown article under `book-outline/wechat-articles/`.
- Generate WeChat-compatible HTML with inline CSS.
- Validate banned tags/styles before publishing.
- Publish to draft box only unless the user explicitly asks for mass sending.

## Completion criteria

A production task is complete only when:

- Output files exist in the expected directory.
- The source manuscript remains clean.
- HTML/PDF/WeChat validation appropriate to the target has been run.
- Key preview screenshots or rendered PDF pages have been inspected.
- `book-outline/WRITING_STATE.md` or the relevant status file is updated for resumability.
