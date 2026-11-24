const articleApp = {
    article: null,
    articleId: null,
    allArticles: [],

    init() {
        this.applySavedTheme();
        const urlParams = new URLSearchParams(window.location.search);
        this.articleId = urlParams.get('id');

        if (!this.articleId) {
            this.showNotFound();
            return;
        }

        this.loadArticle();
        this.setupScrollProgress();
    },

    applySavedTheme() {
        const saved = localStorage.getItem('sn_blog_theme') || 'nowpulse';
        this.setTheme(saved, false);
    },

    setTheme(themeName, persist = true) {
        document.documentElement.setAttribute('data-theme', themeName);
        if (persist) {
            localStorage.setItem('sn_blog_theme', themeName);
        }
        document.querySelectorAll('.theme-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-set-theme') === themeName);
        });
    },

    loadArticle() {
        const defaultArticles = typeof articlesData !== 'undefined' ? articlesData : [];
        const articles = defaultArticles;

        this.allArticles = articles;
        this.article = articles.find(a => a.id === this.articleId);

        if (!this.article) {
            this.showNotFound();
            return;
        }

        this.renderArticle();
        this.renderRelated();
    },

    estimateReadTime(content) {
        const words = (content || '').trim().split(/\s+/).length;
        return Math.max(2, Math.ceil(words / 220)) + ' min read';
    },

    renderArticle() {
        const container = document.getElementById('articleContainer');
        const htmlContent = marked.parse(this.article.content);
        const isUseCase = this.article.category === 'Use Case';

        container.innerHTML = `
            <article class="article-main-card">
                <header class="article-view-header">
                    <span class="category-pill ${isUseCase ? 'use-case' : ''}">${this.escapeHtml(this.article.category)}</span>
                    <h1 class="article-view-title">${this.escapeHtml(this.article.title)}</h1>
                    <div class="article-view-meta">
                        <span>📅 ${this.formatDate(this.article.date)}</span>
                        <span>⏱ ${this.estimateReadTime(this.article.content)}</span>
                        <span>✍️ Rohan Aditya</span>
                    </div>
                </header>
                <div class="article-view-content" id="renderedMarkdown">${htmlContent}</div>
                <div class="article-tags" style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    ${(this.article.tags || []).map(tag => `<span class="article-tag">#${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            </article>
        `;

        this.enhanceCodeBlocks();
        this.buildTableOfContents();
        document.title = `${this.article.title} — Rohan Aditya`;
    },

    enhanceCodeBlocks() {
        const contentEl = document.getElementById('renderedMarkdown');
        if (!contentEl) return;

        contentEl.querySelectorAll('pre').forEach((pre, index) => {
            const code = pre.querySelector('code');
            if (!code) return;

            if (window.hljs) {
                hljs.highlightElement(code);
            }

            const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
            const langLabel = langClass ? langClass.replace('language-', '').toUpperCase() : 'SNIPPET';

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML = `
                <span>${this.escapeHtml(langLabel)}</span>
                <button type="button" class="copy-code-btn" data-copy-idx="${index}">Copy</button>
            `;

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);

            header.querySelector('.copy-code-btn').addEventListener('click', (e) => {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    e.target.textContent = 'Copied ✓';
                    setTimeout(() => (e.target.textContent = 'Copy'), 1800);
                });
            });
        });
    },

    buildTableOfContents() {
        const contentEl = document.getElementById('renderedMarkdown');
        const tocList = document.getElementById('tocList');
        if (!contentEl || !tocList) return;

        const headings = Array.from(contentEl.querySelectorAll('h2, h3'));
        if (headings.length === 0) {
            tocList.innerHTML = '<li style="font-size:0.8rem; color:var(--text-muted);">No subsections</li>';
            return;
        }

        tocList.innerHTML = headings.map((h, i) => {
            const id = 'section-' + i;
            h.id = id;
            const cls = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
            return `<li><a href="#${id}" class="${cls}">${this.escapeHtml(h.textContent)}</a></li>`;
        }).join('');
    },

    renderRelated() {
        const rail = document.getElementById('relatedArticlesList');
        if (!rail) return;

        const sorted = [...this.allArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
        rail.innerHTML = sorted.map(item => `
            <a href="article.html?id=${item.id}" class="sidebar-tag-btn ${item.id === this.articleId ? 'active' : ''}" style="display:block; line-height:1.35; padding:0.5rem 0.6rem;">
                ${this.escapeHtml(item.title)}
            </a>
        `).join('');
    },

    setupScrollProgress() {
        window.addEventListener('scroll', () => {
            const bar = document.getElementById('readingProgress');
            if (!bar) return;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
            bar.style.width = pct + '%';
        });
    },

    showNotFound() {
        const container = document.getElementById('articleContainer');
        container.innerHTML = `
            <div class="article-main-card" style="text-align:center; padding:4rem 2rem;">
                <h2>Article Not Found</h2>
                <p style="color:var(--text-muted); margin:0.75rem 0 1.5rem;">The article you're looking for doesn't exist.</p>
                <a href="index.html" class="download-btn">← Back to Articles</a>
            </div>
        `;
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => articleApp.init());
