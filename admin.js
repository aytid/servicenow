const adminApp = {
    articles: [],
    editorTags: [],
    deleteArticleId: null,
    searchQuery: '',

    init() {
        const pinInput = document.getElementById('adminPin');
        if (pinInput) {
            pinInput.value = sessionStorage.getItem('sn_admin_pin') || '';
            pinInput.addEventListener('input', () => {
                sessionStorage.setItem('sn_admin_pin', pinInput.value);
            });
        }

        this.loadArticles();
        this.setupEventListeners();
        this.setupTagInput();
        this.renderTable();
        this.updateStats();
        this.applyTheme();
    },

    // Local drafts live under their own key. Without drafts, the admin
    // starts from the published data.js.
    DRAFT_KEY: 'sn_admin_articles',

    loadArticles() {
        const published = typeof articlesData !== 'undefined' ? articlesData : [];
        const stored = localStorage.getItem(this.DRAFT_KEY);
        if (stored) {
            try {
                this.articles = JSON.parse(stored);
                return;
            } catch (e) { /* fall through to published data */ }
        }
        this.articles = [...published];
    },

    saveArticles() {
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(this.articles));
        this.updateStats();
    },

    syncFromRepo() {
        if (!confirm('Discard local edits and reload the published articles from data.js?')) return;
        localStorage.removeItem(this.DRAFT_KEY);
        this.articles = typeof articlesData !== 'undefined' ? [...articlesData] : [];
        this.renderTable();
        this.updateStats();
        this.showToast('Reloaded published articles', 'success');
    },

    orderedArticles() {
        return [...this.articles].sort((a, b) => Number(a.id) - Number(b.id));
    },

    async pushToGitHub(commitMessage = '') {
        const btn = document.getElementById('pushGithubBtn');
        const banner = document.getElementById('githubStatusBanner');
        const pin = document.getElementById('adminPin')?.value || '';

        if (!pin) {
            this.showBanner('err', 'Enter your Admin PIN first.');
            document.getElementById('adminPin')?.focus();
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Pushing...';

        try {
            const resp = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, articles: this.orderedArticles(), commitMessage })
            });
            let data = {};
            try { data = await resp.json(); } catch (e) { /* non-JSON error page */ }
            if (!resp.ok) throw new Error(data.error || `Publish failed (HTTP ${resp.status})`);

            const link = data.htmlUrl
                ? `<a href="${this.escapeHtml(data.htmlUrl)}" target="_blank" rel="noopener">View commit ↗</a>`
                : '';
            this.showBanner('ok', 'Published to GitHub. The live site updates in about a minute.', link);
            this.showToast('Published to GitHub', 'success');
        } catch (err) {
            this.showBanner('err', `${err.message} You can still use Export data.js as a fallback.`);
            this.showToast('Publish failed', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '⬆ Push to GitHub';
        }
    },

    showBanner(kind, message, extraHtml = '') {
        const banner = document.getElementById('githubStatusBanner');
        if (!banner) return;
        banner.className = `status-banner show ${kind}`;
        banner.innerHTML = `<span>${this.escapeHtml(message)}</span>${extraHtml}`;
    },

    downloadDataJs() {
        const esc = (str) => String(str || '')
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$\{/g, '\\${');
        const items = this.orderedArticles().map(a => {
            const extra = [
                a.readTime ? `        readTime: ${JSON.stringify(String(a.readTime))},` : '',
                a.updated ? `        updated: ${JSON.stringify(String(a.updated))},` : ''
            ].filter(Boolean).join('\n');
            return `    {
        id: ${JSON.stringify(String(a.id))},
        title: ${JSON.stringify(a.title || '')},
        category: ${JSON.stringify(a.category || 'Tutorial')},
        excerpt: ${JSON.stringify(a.excerpt || '')},
        tags: ${JSON.stringify(a.tags || [])},
        date: ${JSON.stringify(a.date || '')},
        views: ${Number(a.views || 0)},
        created: ${JSON.stringify(a.created || new Date().toISOString())},${extra ? '\n' + extra : ''}
        content: \`${esc(a.content)}\`
    }`;
        }).join(',\n');

        const blob = new Blob([`const articlesData = [\n${items}\n];\n`],
            { type: 'application/javascript;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.js';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Downloaded data.js', 'success');
    },

    setupEventListeners() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    if (overlay.id === 'editorModal') this.closeEditor();
                    if (overlay.id === 'deleteModal') this.closeDeleteModal();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditor();
                this.closeDeleteModal();
            }
        });

        // Auto-calculate read time
        document.getElementById('articleContent')?.addEventListener('input', () => {
            const content = document.getElementById('articleContent').value;
            const words = content.split(/\s+/).length;
            const minutes = Math.ceil(words / 200);
            document.getElementById('articleReadTime').value = minutes;
        });
    },

    setupTagInput() {
        const input = document.getElementById('tagInput');
        if (!input) return;

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
        if (!container) return;
        container.innerHTML = this.editorTags.map(tag => `
            <span class="input-tag">
                ${tag}
                <button onclick="adminApp.removeEditorTag('${tag}')" type="button">×</button>
            </span>
        `).join('');
    },

    removeEditorTag(tag) {
        this.editorTags = this.editorTags.filter(t => t !== tag);
        this.renderEditorTags();
    },

    renderTable() {
        const container = document.getElementById('articlesTable');
        let filtered = this.articles;

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(q) ||
                a.category.toLowerCase().includes(q) ||
                a.excerpt.toLowerCase().includes(q)
            );
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            container.innerHTML = `
            <div class="empty-state-admin">
                <h3>No articles found</h3>
                <p>Create your first article to get started</p>
            </div>
        `;
            return;
        }

        container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(article => `
                    <tr>
                        <td>
                            <a href="article.html?id=${article.id}" 
                               target="_blank" 
                               class="article-title-link"
                               onclick="event.stopPropagation()">
                                ${this.escapeHtml(article.title)}
                            </a>
                        </td>
                        <td><span class="article-category-cell">${article.category}</span></td>
                        <td>${this.formatDate(article.date)}</td>
                        <td>${article.views?.toLocaleString() || 0}</td>
                        <td class="article-actions-cell">
                            <button class="btn btn-secondary btn-sm" onclick="adminApp.editArticle('${article.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="adminApp.deleteArticle('${article.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    },
    openEditor(articleId = null) {
        const modal = document.getElementById('editorModal');
        const form = document.getElementById('articleForm');
        const titleEl = document.getElementById('editorTitle');

        // Reset preview
        document.getElementById('previewPanel').style.display = 'none';

        if (articleId) {
            const article = this.articles.find(a => a.id === articleId);
            if (!article) return;

            titleEl.textContent = 'Edit Article';
            document.getElementById('articleId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleDate').value = article.date;
            document.getElementById('articleExcerpt').value = article.excerpt;
            document.getElementById('articleContent').value = article.content;
            document.getElementById('articleReadTime').value = parseInt(article.readTime) || 5;
            this.editorTags = [...(article.tags || [])];
        } else {
            titleEl.textContent = 'New Article';
            form.reset();
            document.getElementById('articleId').value = '';
            document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('articleReadTime').value = 5;
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

    editArticle(id) {
        this.openEditor(id);
    },

    deleteArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        this.deleteArticleId = id;
        document.getElementById('deleteArticleTitle').textContent = `"${article.title}"`;
        document.getElementById('deleteModal').classList.add('active');
    },

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteArticleId = null;
    },

    confirmDelete() {
        if (!this.deleteArticleId) return;

        this.articles = this.articles.filter(a => a.id !== this.deleteArticleId);
        this.saveArticles();
        this.renderTable();
        this.closeDeleteModal();
        this.showToast('Deleted locally. Click Push to GitHub to publish.', 'success');
    },

    async saveArticle(andPush = false) {
        const id = document.getElementById('articleId').value;
        const title = document.getElementById('articleTitle').value.trim();
        const category = document.getElementById('articleCategory').value;
        const date = document.getElementById('articleDate').value;
        const excerpt = document.getElementById('articleExcerpt').value.trim();
        const content = document.getElementById('articleContent').value.trim();
        const readTime = document.getElementById('articleReadTime').value || '5 min';

        if (!title || !excerpt || !content || !date) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const articleData = {
            id: id || Date.now().toString(),
            title,
            category,
            date,
            excerpt,
            content,
            tags: [...this.editorTags],
            readTime: readTime + ' min',
            views: id ? (this.articles.find(a => a.id === id)?.views || 0) : 0,
            updated: new Date().toISOString()
        };

        if (id) {
            const index = this.articles.findIndex(a => a.id === id);
            if (index !== -1) {
                articleData.created = this.articles[index].created;
                this.articles[index] = articleData;
                this.showToast('Article updated successfully', 'success');
            }
        } else {
            articleData.created = new Date().toISOString();
            this.articles.unshift(articleData);
            this.showToast('Article created successfully', 'success');
        }

        this.saveArticles();
        this.closeEditor();
        this.renderTable();

        if (andPush) {
            await this.pushToGitHub(`feat(blog): ${id ? 'update' : 'publish'} "${title}"`);
        }
    },

    togglePreview() {
        const panel = document.getElementById('previewPanel');
        const content = document.getElementById('articleContent').value;

        if (panel.style.display === 'none') {
            document.getElementById('previewContent').innerHTML = marked.parse(content);
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    },

    insertMarkdown(before, after = '') {
        const textarea = document.getElementById('articleContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        const newText = text.substring(0, start) + before + selected + after + text.substring(end);
        textarea.value = newText;

        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    },

    handleSearch() {
        this.searchQuery = document.getElementById('adminSearch').value.toLowerCase();
        this.renderTable();
    },

    updateStats() {
        document.getElementById('statTotal').textContent = this.articles.length;
        document.getElementById('statViews').textContent =
            this.articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString();

        const thisMonth = this.articles.filter(a => {
            const date = new Date(a.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        document.getElementById('statThisMonth').textContent = thisMonth;
    },

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    THEMES: ['nowpulse', 'glidedocs', 'darkdev'],

    applyTheme() {
        // Same theme setting as the public site
        let saved = localStorage.getItem('sn_blog_theme') || 'nowpulse';
        if (!this.THEMES.includes(saved)) saved = 'nowpulse';
        document.documentElement.setAttribute('data-theme', saved);
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = this.THEMES[(this.THEMES.indexOf(current) + 1) % this.THEMES.length];
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sn_blog_theme', next);
        this.showToast(`Theme: ${next}`);
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
    }
};

document.addEventListener('DOMContentLoaded', () => adminApp.init());