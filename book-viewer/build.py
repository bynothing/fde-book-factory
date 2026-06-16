#!/usr/bin/env python3
"""Build a self-contained HTML book viewer from manuscript markdown files."""

import re
import os
import html as html_mod

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANUSCRIPT_DIR = os.path.join(BASE_DIR, "book-outline", "manuscript")
OUTPUT_FILE = os.path.join(BASE_DIR, "book-viewer.html")

CHAPTER_ORDER = [
    ("CH00", "前言"),
    ("CH01", "上篇 · 事实、原理与范式"),
    ("CH02", None),
    ("CH03", None),
    ("CH04", None),
    ("CH05", None),
    ("CH06", None),
    ("CH07", None),
    ("CH08", None),
    ("CH09", "下篇 · 基础设施、运维、人才与组织落地"),
    ("CH10", None),
    ("CH11", None),
    ("CH12", None),
    ("CH13", None),
    ("CH14", None),
    ("CH15", None),
    ("CH16", None),
    ("CH17", None),
    ("CH18", None),
    ("CH19", "结语"),
]

def find_manuscript(ch_id):
    """Find manuscript file by chapter ID."""
    for fname in os.listdir(MANUSCRIPT_DIR):
        if fname.startswith(ch_id + "_") and fname.endswith(".md"):
            return os.path.join(MANUSCRIPT_DIR, fname)
    return None

def parse_markdown(text):
    """Convert markdown text to HTML. Handles the subset used in manuscripts."""
    lines = text.split("\n")
    out = []
    i = 0
    in_code_block = False
    in_list = None  # 'ul' or 'ol'

    def close_list():
        nonlocal in_list
        if in_list:
            out.append(f"</{in_list}>")
            in_list = None

    def flush_paragraph(buf):
        if not buf:
            return
        para = " ".join(buf)
        # Inline formatting
        para = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", para)
        out.append(f"<p>{para}</p>")
        buf.clear()

    para_buf = []

    while i < len(lines):
        line = lines[i]

        # Code block
        if line.strip().startswith("```"):
            if in_code_block:
                out.append("</code></pre>")
                in_code_block = False
            else:
                close_list()
                flush_paragraph(para_buf)
                out.append("<pre><code>")
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            out.append(html_mod.escape(line))
            i += 1
            continue

        # Empty line
        if not line.strip():
            close_list()
            flush_paragraph(para_buf)
            i += 1
            continue

        # Headers
        m = re.match(r"^(#{1,3})\s+(.+)$", line)
        if m:
            close_list()
            flush_paragraph(para_buf)
            level = len(m.group(1))
            content = m.group(2)
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            out.append(f"<h{level}>{content}</h{level}>")
            i += 1
            continue

        # Unordered list
        m = re.match(r"^(\s*)[-*]\s+(.+)$", line)
        if m:
            flush_paragraph(para_buf)
            if in_list != "ul":
                close_list()
                out.append("<ul>")
                in_list = "ul"
            item = m.group(2)
            item = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", item)
            out.append(f"<li>{item}</li>")
            i += 1
            continue

        # Ordered list
        m = re.match(r"^(\s*)\d+[.)]\s+(.+)$", line)
        if m:
            flush_paragraph(para_buf)
            if in_list != "ol":
                close_list()
                out.append("<ol>")
                in_list = "ol"
            item = m.group(2)
            item = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", item)
            out.append(f"<li>{item}</li>")
            i += 1
            continue

        # Regular paragraph line
        para_buf.append(line)
        i += 1

    close_list()
    flush_paragraph(para_buf)
    if in_code_block:
        out.append("</code></pre>")

    return "\n".join(out)

def extract_title(text):
    """Extract chapter title from first H1."""
    m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    if m:
        return m.group(1)
    return "Untitled"

def build():
    chapters = []
    toc_items = []

    for ch_id, section_label in CHAPTER_ORDER:
        path = find_manuscript(ch_id)
        if not path:
            print(f"WARNING: No manuscript found for {ch_id}")
            continue

        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()

        title = extract_title(raw)
        body_html = parse_markdown(raw)

        # Remove the H1 from body since we'll render it differently
        body_html = re.sub(r"<h1>.*?</h1>\n*", "", body_html, count=1)

        short_id = ch_id.lower()
        chapters.append({
            "id": short_id,
            "title": title,
            "body": body_html,
            "section_label": section_label,
        })

        if section_label:
            toc_items.append({
                "type": "section",
                "label": section_label,
                "id": None,
            })

        toc_items.append({
            "type": "chapter",
            "label": title,
            "id": short_id,
        })

    # Build HTML
    html = generate_html(chapters, toc_items)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Built: {OUTPUT_FILE}")
    print(f"  {len(chapters)} chapters embedded")

def generate_html(chapters, toc_items):
    chapters_html = []
    for ch in chapters:
        nav = ""
        chapters_html.append(f'''
        <section id="{ch["id"]}" class="chapter">
            <h1 class="chapter-title">{html_mod.escape(ch["title"])}</h1>
            <div class="chapter-body">
                {ch["body"]}
            </div>
        </section>
        ''')

    toc_html_parts = []
    for item in toc_items:
        if item["type"] == "section":
            toc_html_parts.append(f'<div class="toc-section">{html_mod.escape(item["label"])}</div>')
        else:
            toc_html_parts.append(f'<a href="#{item["id"]}" class="toc-link" data-target="{item["id"]}">{html_mod.escape(item["label"])}</a>')

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI-FDE：产业 AI 落地的新生产力体系</title>
<style>
:root {{
    --bg: #fdfcf9;
    --sidebar-bg: #f5f2ed;
    --text: #2c2416;
    --text-secondary: #6b5e4a;
    --border: #e0d8cc;
    --accent: #b85c3a;
    --accent-light: #f0e6dc;
    --link: #8b4513;
    --shadow: 0 1px 3px rgba(0,0,0,0.06);
    --code-bg: #f0ebe3;
    --strong: #3d2b1a;
    --hover: #e8e0d5;
}}

[data-theme="dark"] {{
    --bg: #1a1815;
    --sidebar-bg: #211e1a;
    --text: #e0d8cc;
    --text-secondary: #a09080;
    --border: #3a3530;
    --accent: #d4846a;
    --accent-light: #2a221c;
    --link: #c98b6a;
    --shadow: 0 1px 3px rgba(0,0,0,0.3);
    --code-bg: #25221e;
    --strong: #f0e8dc;
    --hover: #2e2a25;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, "Times New Roman", serif;
    font-size: 18px;
    line-height: 1.85;
    color: var(--text);
    background: var(--bg);
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
}}

/* Sidebar */
.sidebar {{
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    padding: 2rem 1.5rem;
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    overflow-y: auto;
    z-index: 10;
}}

.sidebar h2 {{
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.5rem;
    letter-spacing: 0.02em;
}}

.sidebar .subtitle {{
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    line-height: 1.4;
}}

.toc-section {{
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    margin: 1.5rem 0 0.5rem 0;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
}}

.toc-link {{
    display: block;
    padding: 0.35rem 0;
    font-size: 0.88rem;
    color: var(--text-secondary);
    text-decoration: none;
    border-left: 2px solid transparent;
    padding-left: 0.75rem;
    transition: all 0.15s;
    line-height: 1.4;
}}

.toc-link:hover {{
    color: var(--text);
    border-left-color: var(--accent);
    background: var(--hover);
}}

.toc-link.active {{
    color: var(--link);
    font-weight: 600;
    border-left-color: var(--accent);
}}

/* Theme toggle */
.theme-toggle {{
    position: fixed;
    top: 1rem;
    right: 1.5rem;
    z-index: 100;
    background: var(--sidebar-bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 1.1rem;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: var(--shadow);
}}

.theme-toggle:hover {{
    background: var(--hover);
    transform: scale(1.05);
}}

/* Menu toggle (mobile) */
.menu-toggle {{
    display: none;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 200;
    background: var(--sidebar-bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 1.2rem;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
}}

/* Overlay */
.overlay {{
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 9;
}}

/* Main content */
.main {{
    grid-column: 2;
    padding: 3rem 4rem;
    max-width: 820px;
}}

.chapter {{
    margin-bottom: 4rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
}}

.chapter:last-child {{
    border-bottom: none;
}}

.chapter-title {{
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--strong);
    margin-bottom: 1.5rem;
    line-height: 1.3;
}}

.chapter-body h2 {{
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--strong);
    margin: 2rem 0 0.75rem 0;
    line-height: 1.4;
}}

.chapter-body h3 {{
    font-size: 1.08rem;
    font-weight: 700;
    color: var(--text);
    margin: 1.5rem 0 0.5rem 0;
}}

.chapter-body p {{
    margin: 0.75rem 0;
    text-align: justify;
}}

.chapter-body strong {{
    color: var(--strong);
    font-weight: 700;
}}

.chapter-body ul, .chapter-body ol {{
    margin: 0.75rem 0 0.75rem 1.5rem;
}}

.chapter-body li {{
    margin: 0.3rem 0;
}}

.chapter-body pre {{
    background: var(--code-bg);
    padding: 1rem 1.25rem;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.6;
    margin: 0.75rem 0;
    border: 1px solid var(--border);
}}

.chapter-body code {{
    font-family: "SF Mono", "Cascadia Code", "Fira Code", monospace;
    font-size: 0.85em;
}}

.chapter-body pre code {{
    background: none;
    padding: 0;
}}

/* Back to top */
.back-to-top {{
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--sidebar-bg);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    box-shadow: var(--shadow);
    z-index: 100;
    pointer-events: none;
}}

.back-to-top.visible {{
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}}

.back-to-top:hover {{
    background: var(--hover);
    color: var(--text);
}}

/* Responsive */
@media (max-width: 900px) {{
    body {{
        grid-template-columns: 1fr;
    }}
    .sidebar {{
        transform: translateX(-100%);
        transition: transform 0.3s;
        width: 280px;
    }}
    .sidebar.open {{
        transform: translateX(0);
    }}
    .overlay.show {{
        display: block;
    }}
    .menu-toggle {{
        display: flex;
    }}
    .main {{
        grid-column: 1;
        padding: 2rem 1.25rem;
    }}
    .chapter-title {{
        font-size: 1.4rem;
    }}
    body {{
        font-size: 16px;
    }}
}}

/* Print */
@media print {{
    .sidebar, .theme-toggle, .menu-toggle, .back-to-top, .overlay {{
        display: none !important;
    }}
    body {{
        grid-template-columns: 1fr;
        font-size: 12pt;
        line-height: 1.6;
    }}
    .main {{
        grid-column: 1;
        padding: 0;
        max-width: none;
    }}
}}
</style>
</head>
<body>

<div class="overlay" id="overlay"></div>
<button class="menu-toggle" id="menuToggle" aria-label="目录">&#9776;</button>
<button class="theme-toggle" id="themeToggle" aria-label="切换主题" title="切换深色/浅色模式">&#9788;</button>
<button class="back-to-top" id="backToTop" aria-label="回到顶部" title="回到顶部">&#8593;</button>

<nav class="sidebar" id="sidebar">
    <h2>AI-FDE</h2>
    <div class="subtitle">产业 AI 落地的新生产力体系</div>
    {"".join(toc_html_parts)}
</nav>

<main class="main" id="main">
    {"".join(chapters_html)}
</main>

<script>
(function() {{
    // Theme
    const themeToggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("book-theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);

    themeToggle.addEventListener("click", function() {{
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("book-theme", next);
    }});

    // Mobile menu
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuToggle = document.getElementById("menuToggle");

    function openMenu() {{
        sidebar.classList.add("open");
        overlay.classList.add("show");
    }}
    function closeMenu() {{
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }}

    menuToggle.addEventListener("click", function() {{
        sidebar.classList.contains("open") ? closeMenu() : openMenu();
    }});
    overlay.addEventListener("click", closeMenu);

    // Close menu on chapter click (mobile)
    document.querySelectorAll(".toc-link").forEach(function(link) {{
        link.addEventListener("click", function() {{
            if (window.innerWidth <= 900) closeMenu();
        }});
    }});

    // Active TOC tracking
    const tocLinks = document.querySelectorAll(".toc-link");
    const chapters = document.querySelectorAll(".chapter");

    function updateActive() {{
        let current = null;
        chapters.forEach(function(ch) {{
            const top = ch.getBoundingClientRect().top;
            if (top < 120) current = ch.id;
        }});
        tocLinks.forEach(function(link) {{
            link.classList.toggle("active", link.dataset.target === current);
        }});
    }};

    window.addEventListener("scroll", updateActive, {{ passive: true }});
    updateActive();

    // Back to top
    const backToTop = document.getElementById("backToTop");
    window.addEventListener("scroll", function() {{
        backToTop.classList.toggle("visible", window.scrollY > 400);
    }}, {{ passive: true }});

    backToTop.addEventListener("click", function() {{
        window.scrollTo({{ top: 0, behavior: "smooth" }});
    }});
}})();
</script>

</body>
</html>'''

if __name__ == "__main__":
    build()
