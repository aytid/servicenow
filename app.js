const app = {
    articles: [],
    currentView: 'grid',
    currentArticle: null,
    currentFilter: 'All',
    editorTags: [],
    searchQuery: '',

    init() {
        this.loadArticles();
        this.setupEventListeners();
        this.setupTagInput();
        this.render();
        this.updateStats();
    },

    loadArticles() {
        // const stored = localStorage.getItem('blog_articles');
        // if (stored) {
        //     this.articles = JSON.parse(stored);
        // } else {
            // Call getSampleArticles which uses data.js
            this.articles = this.getSampleArticles();
            this.saveArticles();
        //}
    },

    saveArticles() {
        localStorage.setItem('architecture_blog_articles', JSON.stringify(this.articles));
        this.updateStats();
    },

    getSampleArticles() {
        return articlesData || [];
    },

    setupEventListeners() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    if (overlay.id === 'editorModal') this.closeEditor();
                    if (overlay.id === 'articleModal') this.closeArticle();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditor();
                this.closeArticle();
            }
        });
    },

    setupTagInput() {
        const input = document.getElementById('tagInput');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = input.value.trim();
                if (tag && !this.editorTags.includes(tag)) {
                    this.editorTags.push(tag);
                    this.renderEditorTags();
                    input.value = '';
                }
            } else if (e.key === 'Backspace' && !input.value && this.editorTags.length > 0) {
                this.editorTags.pop();
                this.renderEditorTags();
            }
        });
    },

    renderEditorTags() {
        const container = document.getElementById('tagList');
        container.innerHTML = this.editorTags.map(tag => `
            <span class="input-tag">
                ${tag}
                <button onclick="app.removeEditorTag('${tag}')" type="button">×</button>
            </span>
        `).join('');
    },

    removeEditorTag(tag) {
        this.editorTags = this.editorTags.filter(t => t !== tag);
        this.renderEditorTags();
    },

    openEditor(articleId = null) {
        const modal = document.getElementById('editorModal');
        const form = document.getElementById('articleForm');

        if (articleId) {
            const article = this.articles.find(a => a.id === articleId);
            if (!article) return;

            document.getElementById('articleId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleDate').value = article.date;
            document.getElementById('articleExcerpt').value = article.excerpt;
            document.getElementById('articleContent').value = article.content;
            this.editorTags = [...article.tags];
        } else {
            form.reset();
            document.getElementById('articleId').value = '';
            document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
            this.editorTags = [];
        }

        this.renderEditorTags();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeEditor() {
        document.getElementById('editorModal').classList.remove('active');
        document.body.style.overflow = '';
        this.editorTags = [];
    },

    saveArticle() {
        const id = document.getElementById('articleId').value;
        const title = document.getElementById('articleTitle').value.trim();
        const category = document.getElementById('articleCategory').value;
        const date = document.getElementById('articleDate').value;
        const excerpt = document.getElementById('articleExcerpt').value.trim();
        const content = document.getElementById('articleContent').value.trim();

        if (!title || !excerpt || !content || !date) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const readTime = Math.ceil(content.split(' ').length / 200) + ' min';

        const articleData = {
            id: id || Date.now().toString(),
            title,
            category,
            date,
            excerpt,
            content,
            tags: [...this.editorTags],
            readTime,
            views: id ? (this.articles.find(a => a.id === id)?.views || 0) : 0,
            updated: new Date().toISOString()
        };

        if (id) {
            const index = this.articles.findIndex(a => a.id === id);
            if (index !== -1) {
                articleData.created = this.articles[index].created;
                this.articles[index] = articleData;
                this.showToast('Article updated', 'success');
            }
        } else {
            articleData.created = new Date().toISOString();
            this.articles.unshift(articleData);
            this.showToast('Article published', 'success');
        }

        this.saveArticles();
        this.closeEditor();
        this.render();
    },

    viewArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        this.currentArticle = article;
        article.views++;
        this.saveArticles();
        window.open(`article.html?id=${id}`, '_self');
    },

    handleSearch() {
        this.searchQuery = document.getElementById('searchInput').value.toLowerCase();
        this.render();
    },

    filterByCategory(category) {
        this.currentFilter = category;

        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.toggle('active',
                (category === 'All' && chip.textContent === 'All') ||
                chip.textContent === category
            );
        });

        this.render();
    },

    getFilteredArticles() {
        return this.articles.filter(article => {
            const matchesSearch = !this.searchQuery ||
                article.title.toLowerCase().includes(this.searchQuery) ||
                article.excerpt.toLowerCase().includes(this.searchQuery) ||
                article.content.toLowerCase().includes(this.searchQuery) ||
                article.tags.some(t => t.toLowerCase().includes(this.searchQuery));

            const matchesCategory = this.currentFilter === 'All' || article.category === this.currentFilter;

            return matchesSearch && matchesCategory;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    render() {
        const container = document.getElementById('articlesContainer');
        const filtered = this.getFilteredArticles();

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">⚡</div>
                    <h3>No articles found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.className = this.currentView === 'grid' ? 'articles-grid' : 'articles-list';

        if (this.currentView === 'grid') {
            container.innerHTML = filtered.map(article => `
                <article class="article-card" onclick="app.viewArticle('${article.id}')">
                    <div class="article-image">
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-elevated) 0%, var(--color-surface) 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                            ${this.getCategoryIcon(article.category)}
                        </div>
                        <span class="article-category">${article.category}</span>
                    </div>
                    <div class="article-content">
                        <div class="article-meta">
                            <span class="article-date">📅 ${this.formatDate(article.date)}</span>
                            <span>•</span>
                            <span>${article.readTime}</span>
                        </div>
                        <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                        <p class="article-excerpt">${this.escapeHtml(article.excerpt)}</p>
                        <div class="article-footer">
                            <div class="article-tags">
                                ${article.tags.slice(0, 2).map(t => `<span class="article-tag">#${t}</span>`).join('')}
                            </div>
                            <span class="read-time">${article.views.toLocaleString()} views</span>
                        </div>
                    </div>
                </article>
            `).join('');
        } else {
            container.innerHTML = filtered.map(article => `
                <article class="article-list-item" onclick="app.viewArticle('${article.id}')">
                    <div class="list-date">
                        <div class="list-day">${new Date(article.date).getDate()}</div>
                        <div class="list-month">${new Date(article.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div class="list-content">
                        <h3>${this.escapeHtml(article.title)}</h3>
                        <div class="list-meta">
                            ${article.category} • ${article.readTime} • ${article.views.toLocaleString()} views
                        </div>
                    </div>
                    <div class="list-arrow">→</div>
                </article>
            `).join('');
        }
    },

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === view);
        });
        this.render();
    },

    updateStats() {
        document.getElementById('statArticles').textContent = this.articles.length;
        document.getElementById('statTutorials').textContent =
            this.articles.filter(a => a.category === 'Tutorial').length;
        document.getElementById('statReads').textContent =
            this.articles.reduce((sum, a) => sum + a.views, 0).toLocaleString();
    },

    getCategoryIcon(category) {
        const icons = {
            'Architecture': '🏛',
            'Performance': '⚡',
            'Integration': '🔌',
            'Tutorial': '📚',
            'Case Study': '💼'
        };
        return icons[category] || '📝';
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
        div.textContent = text;
        return div.innerHTML;
    },

    toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('architecture_theme', next);
        document.getElementById('theme-icon').textContent = next === 'dark' ? '◑' : '◐';
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showHome() {
        this.currentFilter = 'All';
        this.searchQuery = '';
        document.getElementById('searchInput').value = '';
        this.filterByCategory('All');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    showAbout() {
        this.showToast('About page coming soon', 'info');
    }
};

// Initialize theme
const savedTheme = localStorage.getItem('architecture_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '◑' : '◐';

document.addEventListener('DOMContentLoaded', () => app.init());