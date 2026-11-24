const adminApp = {
    articles: [],
    editorTags: [],
    deleteArticleId: null,
    searchQuery: '',

    init() {
        const savedTheme = localStorage.getItem('sn_blog_theme') || 'nowpulse';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedPin = sessionStorage.getItem('sn_admin_pin') || '';
        const pinInput = document.getElementById('adminPin');
        if (pinInput) {
            pinInput.value = savedPin;
            pinInput.addEventListener('input', () => {
                sessionStorage.setItem('sn_admin_pin', pinInput.value);
            });
        }

        this.loadArticles();
        this.setupEventListeners();
        this.setupTagInput();
        this.renderTable();
        this.updateStats();
    },

    loadArticles() {
        const defaultArticles = typeof articlesData !== 'undefined' ? articlesData : [];
        const storedRaw = localStorage.getItem('blog_articles');
        if (storedRaw) {
            try {
                const stored = JSON.parse(storedRaw);
                const existingIds = new Set(stored.map(a => a.id));
                const merged = [...stored];
                defaultArticles.forEach(item => {
                    if (!existingIds.has(item.id)) merged.push(item);
                });
                this.articles = merged;
            } catch (e) {
                this.articles = [...defaultArticles];
            }
        } else {
            this.articles = [...defaultArticles];
        }
        this.saveLocal();
    },

    saveLocal() {
        localStorage.setItem('blog_articles', JSON.stringify(this.articles));
        this.updateStats();
    },

    syncFromRepo() {
        if (!confirm('Discard local unsaved edits and reload directly from data.js?')) return;
        const defaultArticles = typeof articlesData !== 'undefined' ? articlesData : [];
        this.articles = [...defaultArticles];
        this.saveLocal();
        this.renderTable();
        this.showToast('Reloaded articles from data.js');
    },

    getNextId() {
        const numericIds = this.articles
            .map(a => parseInt(a.id, 10))
            .filter(n => !isNaN(n));
        const maxId = numericIds.length ? Math.max(...numericIds) : 1000;
        return String(maxId + 1);
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
                ${this.escapeHtml(tag)}
                <button onclick="adminApp.removeEditorTag('${this.escapeHtml(tag)}')" type="button">×</button>
            </span>
        `).join('');
    },

    removeEditorTag(tag) {
        this.editorTags = this.editorTags.filter(t => t !== tag);
        this.renderEditorTags();
    },

    renderTable() {
        const container = document.getElementById('articlesTable');
        let filtered = [...this.articles];

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                (a.title || '').toLowerCase().includes(q) ||
                (a.category || '').toLowerCase().includes(q) ||
                (a.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(article => `
                        <tr>
                            <td style="font-family:var(--font-mono); color:var(--text-muted);">#${this.escapeHtml(article.id)}</td>
                            <td>
                                <a href="article.html?id=${article.id}" target="_blank" class="article-title-link">
                                    ${this.escapeHtml(article.title)} ↗
                                </a>
                            </td>
                            <td><span class="category-pill ${article.category === 'Use Case' ? 'use-case' : ''}">${this.escapeHtml(article.category)}</span></td>
                            <td style="font-family:var(--font-mono); font-size:0.84rem;">${this.formatDate(article.date)}</td>
                            <td class="article-actions-cell">
                                <button class="btn btn-ghost btn-sm" onclick="adminApp.openEditor('${article.id}')">Edit</button>
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
        document.getElementById('previewPanel').style.display = 'none';

        if (articleId) {
            const article = this.articles.find(a => a.id === articleId);
            if (!article) return;

            document.getElementById('editorTitle').textContent = 'Edit Article';
            document.getElementById('articleId').value = article.id;
            document.getElementById('articleDisplayId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleDate').value = article.date;
            document.getElementById('articleExcerpt').value = article.excerpt;
            document.getElementById('articleContent').value = article.content;
            this.editorTags = [...(article.tags || [])];
        } else {
            const nextId = this.getNextId();
            document.getElementById('editorTitle').textContent = 'New Article';
            form.reset();
            document.getElementById('articleId').value = '';
            document.getElementById('articleDisplayId').value = nextId;
            document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('articleContent').value = `\n**Author: Rohan Aditya**\n\n### Key Points Covered\n- Point 1\n- Point 2\n\n---\n\n## Overview\n\nWrite your technical guide here...\n\n---\n\n© 2026 Rohan Aditya`;
            this.editorTags = ['ServiceNow'];
        }

        this.renderEditorTags();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeEditor() {
        document.getElementById('editorModal').classList.remove('active');
        document.body.style.overflow = '';
    },

    async saveArticle(andPush = false) {
        const existingId = document.getElementById('articleId').value;
        const assignedId = existingId || document.getElementById('articleDisplayId').value || this.getNextId();
        const title = document.getElementById('articleTitle').value.trim();
        const category = document.getElementById('articleCategory').value;
        const date = document.getElementById('articleDate').value;
        const excerpt = document.getElementById('articleExcerpt').value.trim();
        const content = document.getElementById('articleContent').value.trim();

        if (!title || !excerpt || !content || !date) {
            this.showToast('Please fill in all required fields');
            return;
        }

        const articleObj = {
            id: assignedId,
            title,
            category,
            excerpt,
            tags: [...this.editorTags],
            date,
            views: existingId ? (this.articles.find(a => a.id === existingId)?.views || 0) : 0,
            created: existingId
                ? (this.articles.find(a => a.id === existingId)?.created || new Date().toISOString())
                : new Date().toISOString(),
            content
        };

        if (existingId) {
            const idx = this.articles.findIndex(a => a.id === existingId);
            if (idx !== -1) this.articles[idx] = articleObj;
        } else {
            this.articles.push(articleObj);
        }

        this.saveLocal();
        this.closeEditor();
        this.renderTable();
        this.showToast(existingId ? 'Article saved locally' : 'New article added locally');

        if (andPush) {
            await this.pushToGitHub(`feat(blog): ${existingId ? 'update' : 'publish'} "${title}"`);
        }
    },

    async pushToGitHub(customCommitMsg = '') {
        const btn = document.getElementById('pushGithubBtn');
        const banner = document.getElementById('githubStatusBanner');
        const pin = document.getElementById('adminPin')?.value || '';

        btn.disabled = true;
        btn.textContent = 'Pushing to GitHub...';

        // Sort ascending by ID so data.js stays clean and predictable
        const orderedArticles = [...this.articles].sort((a, b) => Number(a.id) - Number(b.id));

        try {
            const resp = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin,
                    articles: orderedArticles,
                    commitMessage: customCommitMsg
                })
            });

            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'GitHub publish failed');
            }

            banner.className = 'status-banner show';
            banner.style.borderColor = '#62d84e';
            banner.innerHTML = `
                <span>✅ Committed <strong>data.js</strong> to <code>aytid/servicenow</code> (Vercel is redeploying).</span>
                <a href="${data.htmlUrl}" target="_blank" style="color:var(--accent); font-family:var(--font-mono);">View Commit ↗</a>
            `;
            this.showToast('Committed to GitHub successfully!');
        } catch (err) {
            banner.className = 'status-banner show';
            banner.style.borderColor = '#dc2626';
            banner.innerHTML = `
                <span>⚠️ ${this.escapeHtml(err.message)} — You can still click <strong>Export data.js</strong> as a fallback.</span>
                <button class="btn btn-ghost btn-sm" onclick="this.parentElement.classList.remove('show')">Dismiss</button>
            `;
            this.showToast('GitHub push failed: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '⬆ Push to GitHub';
        }
    },

    downloadDataJs() {
        const ordered = [...this.articles].sort((a, b) => Number(a.id) - Number(b.id));
        const items = ordered.map(a => {
            const escapedContent = String(a.content || '')
                .replace(/\\/g, '\\\\')
                .replace(/`/g, '\\`')
                .replace(/\$\{/g, '\\${');
            return `    {
        id: ${JSON.stringify(String(a.id))},
        title: ${JSON.stringify(a.title)},
        category: ${JSON.stringify(a.category)},
        excerpt: ${JSON.stringify(a.excerpt)},
        tags: ${JSON.stringify(a.tags || [])},
        date: ${JSON.stringify(a.date)},
        views: ${Number(a.views || 0)},
        created: ${JSON.stringify(a.created || new Date().toISOString())},
        content: \`${escapedContent}\`
    }`;
        }).join(',\n');

        const fileBody = `const articlesData = [\n${items}\n];\n`;
        const blob = new Blob([fileBody], { type: 'application/javascript;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showToast('Downloaded updated data.js');
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
        this.saveLocal();
        this.renderTable();
        this.closeDeleteModal();
        this.showToast('Article deleted locally — click Push to GitHub to sync');
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
        textarea.value = text.substring(0, start) + before + selected + after + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    },

    handleSearch() {
        this.searchQuery = document.getElementById('adminSearch').value.toLowerCase();
        this.renderTable();
    },

    updateStats() {
        document.getElementById('statTotal').textContent = this.articles.length;
        document.getElementById('statTutorials').textContent = this.articles.filter(a => a.category === 'Tutorial').length;
        document.getElementById('statUseCases').textContent = this.articles.filter(a => a.category === 'Use Case').length;
    },

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },

    showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
};

document.addEventListener('DOMContentLoaded', () => adminApp.init());
