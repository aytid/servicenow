const HERO_SNIPPETS = [
    {
        articleId: '1016',
        label: 'Calling Flow Designer from a Business Rule',
        code: `try {
  var inputs = {};
  inputs['current'] = current;
  inputs['table_name'] = 'change_request';

  sn_fd.FlowAPI.getRunner()
    .flow('global.my_flow')
    .inForeground()
    .withInputs(inputs)
    .run();
} catch (ex) {
  gs.error(ex.getMessage());
}`
    },
    {
        articleId: '1019',
        label: 'Widget Broadcasting and Emitting in ServiceNow',
        code: `api.controller = function($rootScope) {
  var c = this;
  var EVENT_NAME = 'kap.incident.stateSelected';

  c.select = function(state) {
    $rootScope.$broadcast(EVENT_NAME, {
      value: state.value,
      label: state.label
    });
  };
};`
    },
    {
        articleId: '1002',
        label: 'Show Table Data in Modal – Native UI',
        code: `var ga = new GlideAjax('GetTableRecordsAJAX');
ga.addParam('sysparm_name', 'getRecords');
ga.addParam('sysparm_table_sysid', sysId);

ga.getXMLAnswer(function(response) {
  $j('#listContainer').html(response);
});`
    }
];

const app = {
    articles: [],
    currentView: 'grid',
    currentFilter: 'All',
    currentTag: '',
    searchQuery: '',

    init() {
        this.applySavedTheme();
        this.loadArticles();
        this.selectSnippet(0);
        this.renderSidebarTags();
        this.render();
        this.updateStats();
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

    loadArticles() {
        // Always show the published articles from data.js, so edits pushed
        // from /admin reach every visitor (no per-browser cached copy).
        this.articles = typeof articlesData !== 'undefined' ? [...articlesData] : [];
        this.saveArticles();
    },

    saveArticles() {
        this.updateStats();
    },

    selectSnippet(index) {
        const snippet = HERO_SNIPPETS[index] || HERO_SNIPPETS[0];
        const codeEl = document.getElementById('heroSnippetCode');
        const labelEl = document.getElementById('heroSnippetLabel');
        const linkEl = document.getElementById('heroSnippetLink');

        if (codeEl) {
            codeEl.textContent = snippet.code;
            codeEl.removeAttribute('data-highlighted');
            if (window.hljs) hljs.highlightElement(codeEl);
        }
        if (labelEl) labelEl.textContent = snippet.label;
        if (linkEl) linkEl.href = `article.html?id=${snippet.articleId}`;

        document.querySelectorAll('.snippet-tab').forEach((tab, idx) => {
            tab.classList.toggle('active', idx === index);
        });
    },

    estimateReadTime(content) {
        const words = (content || '').trim().split(/\s+/).length;
        return Math.max(2, Math.ceil(words / 220)) + ' min read';
    },

    renderSidebarTags() {
        const container = document.getElementById('sidebarTagList');
        if (!container) return;

        const counts = {};
        this.articles.forEach(a => {
            (a.tags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });

        const topTags = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 14);

        container.innerHTML = `
            <button class="sidebar-tag-btn ${!this.currentTag ? 'active' : ''}" onclick="app.filterByTag('')">
                <span>All Topics</span><span>${this.articles.length}</span>
            </button>
            ${topTags.map(([tag, count]) => `
                <button class="sidebar-tag-btn ${this.currentTag === tag ? 'active' : ''}" onclick="app.filterByTag('${this.escapeHtml(tag)}')">
                    <span>${this.escapeHtml(tag)}</span><span>${count}</span>
                </button>
            `).join('')}
        `;
    },

    filterByTag(tag) {
        this.currentTag = tag;
        this.renderSidebarTags();
        this.render();
    },

    filterByCategory(category) {
        this.currentFilter = category;
        this.currentTag = '';

        document.querySelectorAll('#filterChips .chip').forEach(chip => {
            chip.classList.toggle('active', chip.getAttribute('data-cat') === category);
        });

        document.querySelectorAll('.header-nav .nav-link[data-nav-cat]').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-nav-cat') === category);
        });

        this.renderSidebarTags();
        this.render();
    },

    handleSearch() {
        this.searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
        this.render();
    },

    getFilteredArticles() {
        return this.articles
            .filter(article => {
                const matchesSearch = !this.searchQuery ||
                    article.title.toLowerCase().includes(this.searchQuery) ||
                    article.excerpt.toLowerCase().includes(this.searchQuery) ||
                    article.content.toLowerCase().includes(this.searchQuery) ||
                    (article.tags || []).some(t => t.toLowerCase().includes(this.searchQuery));

                const matchesCategory = this.currentFilter === 'All' || article.category === this.currentFilter;
                const matchesTag = !this.currentTag || (article.tags || []).includes(this.currentTag);

                return matchesSearch && matchesCategory && matchesTag;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    viewArticle(id, event) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        article.views = (article.views || 0) + 1;
        this.saveArticles();

        const url = `article.html?id=${id}`;
        if (event && (event.ctrlKey || event.metaKey)) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    },

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });
        this.render();
    },

    render() {
        const container = document.getElementById('articlesContainer');
        const heading = document.getElementById('sectionHeading');
        const countEl = document.getElementById('resultsCount');
        const filtered = this.getFilteredArticles();

        if (heading) {
            heading.textContent = this.currentTag
                ? `Topic: ${this.currentTag}`
                : this.currentFilter === 'All'
                    ? 'Latest Articles'
                    : `${this.currentFilter}s`;
        }
        if (countEl) {
            countEl.textContent = `(${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'})`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>No matching articles found</h3>
                    <p style="color: var(--text-muted); margin-top: 0.4rem;">Try clearing your search or switching category filters.</p>
                </div>
            `;
            return;
        }

        container.className = this.currentView === 'grid' ? 'articles-grid' : 'articles-list';

        if (this.currentView === 'grid') {
            container.innerHTML = filtered.map(article => {
                const isUseCase = article.category === 'Use Case';
                return `
                <article class="article-card" onclick="app.viewArticle('${article.id}', event)">
                    <div>
                        <div class="article-card-top">
                            <span class="category-pill ${isUseCase ? 'use-case' : ''}">${this.escapeHtml(article.category)}</span>
                            <span class="article-date">${this.formatDate(article.date)}</span>
                        </div>
                        <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                        <p class="article-excerpt">${this.escapeHtml(article.excerpt)}</p>
                    </div>
                    <div class="article-footer">
                        <div class="article-tags">
                            ${(article.tags || []).slice(0, 4).map(t => `<span class="article-tag">#${this.escapeHtml(t)}</span>`).join('')}
                        </div>
                        <div class="article-card-meta-bottom">
                            <span>${this.estimateReadTime(article.content)}</span>
                            <span class="read-cta">Read article →</span>
                        </div>
                    </div>
                </article>`;
            }).join('');
        } else {
            container.innerHTML = filtered.map(article => `
                <article class="article-list-item" onclick="app.viewArticle('${article.id}', event)">
                    <div>
                        <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.35rem;">
                            <span class="category-pill ${article.category === 'Use Case' ? 'use-case' : ''}">${this.escapeHtml(article.category)}</span>
                            <span class="article-date">${this.formatDate(article.date)} · ${this.estimateReadTime(article.content)}</span>
                        </div>
                        <h3 class="article-title" style="margin-bottom:0.25rem;">${this.escapeHtml(article.title)}</h3>
                        <p style="font-size:0.88rem; color:var(--text-secondary);">${this.escapeHtml(article.excerpt)}</p>
                    </div>
                    <span class="read-cta" style="white-space:nowrap;">Read →</span>
                </article>
            `).join('');
        }
    },

    updateStats() {
        const totalEl = document.getElementById('statArticles');
        const tutEl = document.getElementById('statTutorials');
        const ucEl = document.getElementById('statUseCases');
        if (totalEl) totalEl.textContent = this.articles.length;
        if (tutEl) tutEl.textContent = this.articles.filter(a => a.category === 'Tutorial').length;
        if (ucEl) ucEl.textContent = this.articles.filter(a => a.category === 'Use Case').length;
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },

    showHome() {
        this.currentFilter = 'All';
        this.currentTag = '';
        this.searchQuery = '';
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        this.filterByCategory('All');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
