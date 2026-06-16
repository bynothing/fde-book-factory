# Style Design Reference

Use this reference when designing or revising the AI-FDE book's online HTML, PDF, WeChat article, cover, diagrams, or long-form reading layout.

## Design goal

This book is not a marketing brochure, a software manual, or a generic AI trend report. The visual language should feel like a serious technology-practice book written from an industry field perspective.

Target feeling:

- Calm, credible, and analytical.
- Technical but not code-heavy.
- Business-facing but not sales-like.
- Modern AI-native, but not generic purple-gradient AI style.
- Long-form readable on mobile.

## Style hierarchy

Prioritize in this order:

1. Readability.
2. Argument clarity.
3. Structural navigation.
4. Diagram comprehension.
5. Visual atmosphere.

If a visual choice hurts reading, remove it.

## Typography

For mobile HTML:

- Body text should be large enough for phone reading without zooming.
- Line height should be generous, usually around `1.9` to `2.08` for WeChat/HTML and `1.42` to `1.58` for big PDF pages.
- Avoid dense paragraphs with tight line height.
- Use short paragraph rhythm where possible.
- Headings should create structure, not dominate every screen.

For PDF mobile reading:

- Use larger body type than print book defaults.
- Use narrow margins.
- Keep two-character Chinese indentation when it improves book-like rhythm.
- Check actual rendered pages, not just CSS values.

For references:

- References are evidence notes, not main narrative.
- Keep them smaller and lower-contrast than body text.
- They must remain readable enough for traceability.

## Color

Preferred palette:

- Ink / near black for body text.
- Deep blue, slate, and restrained teal for structure and diagrams.
- Light blue-gray backgrounds for figure leads, notes, and cards.
- White or near-white reading surface.

Avoid:

- Generic AI purple/blue glow as the main identity.
- One-note dark blue pages everywhere.
- Decorative gradient blobs.
- Excessive card shadows.
- Beige luxury/editorial palette unless the user explicitly asks.

## Cover

The cover may be more atmospheric than inner pages, but it still needs restraint.

Good direction:

- Deep technical editorial background.
- Strong title.
- Subtle grid or system-line motif.
- Clear author/version/date.
- Full-bleed for PDF cover when requested.

Avoid:

- Split hero card layout.
- Generic SaaS landing page look.
- Abstract decoration that does not relate to systems, field deployment, or production infrastructure.
- Small title hidden behind decorative effects.

## Diagrams

Diagrams are explanatory instruments, not decoration.

Each diagram must have:

1. Figure lead: why this figure appears here.
2. Figure title: what structure it explains.
3. Diagram body: architecture, flow, stack, cycle, roadmap, or concept map.
4. Caption: one-sentence takeaway.

Diagram types:

- Flow: delivery chain, demand-to-outcome workflow.
- Cycle: feedback loops, operations loops.
- Stack: infrastructure, barriers, layered capabilities.
- Hub: FDE responsibility center, tool amplification.
- Funnel: macro adoption to verified outcome.
- Roadmap: talent path, enterprise rollout path.
- Architecture: complex case translation from field constraints to computational structure.

Diagram QA:

- Must work on mobile width.
- Must not require horizontal scrolling unless explicitly designed.
- Text inside diagram cards must be readable.
- No overlapping labels.
- No tiny decorative labels.
- Check at least one diagram page in PDF and one diagram section in mobile HTML.

## Layout

For online HTML:

- Use one main reading column.
- Keep a strong cover and clear TOC.
- Add a figure index when the book contains many diagrams.
- Use figure leads to pace long chapters.
- Avoid nested cards inside cards unless the diagram needs grouped nodes.

For PDF:

- Preserve page-by-page rhythm.
- Avoid blank final pages.
- Avoid single orphan TOC item pages when possible.
- Confirm cover, TOC, figure index, first figure, mid-book body page, and final page.

For WeChat:

- Inline CSS only.
- Wider inner padding for long essays; avoid cramped edges.
- Body line height should usually be around `2.0`.
- Do not add decorative images unless the user asks.

## Content-style alignment

Match visual choices to the book's argument:

- "AI changes delivery outcomes" should be shown with flows from demand to result.
- "FDE is responsibility reconstruction" should be shown with responsibility hubs or chain compression.
- "Platform is infrastructure" should be shown with stacks.
- "Digital employee operations" should be shown with cycles.
- "Talent is trained in a system" should be shown with roadmaps.

When in doubt, choose the visual form that reveals the structure of the argument.

## Final style review checklist

- Can a mobile reader read one page comfortably without zooming?
- Does each diagram explain a real idea from the chapter?
- Are figure leads useful rather than ornamental?
- Does the cover signal the book's field-practice seriousness?
- Is the color palette restrained and consistent?
- Are references visually secondary but still readable?
- Are there no clipped, overlapped, or tiny labels?
- Do HTML and PDF share the same visual logic?
