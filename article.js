const articleApp = {
    article: null,
    articleId: null,

    init() {
        // Get article ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.articleId = urlParams.get('id');
        
        if (!this.articleId) {
            this.showNotFound();
            return;
        }

        this.loadArticle();
    },

    loadArticle() {
        const stored = localStorage.getItem('architecture_blog_articles');
        if (!stored) {
            this.showNotFound();
            return;
        }

        const articles = JSON.parse(stored);
        this.article = articles.find(a => a.id === this.articleId);

        if (!this.article) {
            this.showNotFound();
            return;
        }

        this.renderArticle();
        this.renderActions();
        this.applyTheme();
    },

    renderArticle() {
        const container = document.getElementById('articleContainer');
        const htmlContent = marked.parse(this.article.content);

        container.innerHTML = `
            <article class="article-view">
                <header class="article-view-header">
                    <span class="article-view-category">${this.article.category}</span>
                    <h1 class="article-view-title">${this.escapeHtml(this.article.title)}</h1>
                    <div class="article-view-meta">
                        <span>${this.formatDate(this.article.date)}</span>
                        <span>•</span>
                        <span>${this.article.readTime} read</span>
                        <span>•</span>
                        <span>${this.article.views.toLocaleString()} views</span>
                    </div>
                </header>
                <div class="article-view-content">${htmlContent}</div>
                <div class="article-tags" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                    ${this.article.tags.map(tag => `<span class="chip" style="margin-right: 0.5rem;">${tag}</span>`).join('')}
                </div>
            </article>
        `;

        // Highlight code blocks
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Update page title
        document.title = `${this.article.title} — Rohan Aditya`;
    },

    renderActions() {
        const container = document.getElementById('articleActions');
        container.innerHTML = `
            <button class="btn btn-ghost" onclick="articleApp.editArticle()">Edit</button>
            <button class="btn btn-ghost" onclick="articleApp.deleteArticle()" style="color: #ef4444;">Delete</button>
        `;
    },

    editArticle() {
        // Store article ID for editing
        localStorage.setItem('editing_article_id', this.articleId);
        // Open index.html in same window
        window.location.href = 'index.html?edit=' + this.articleId;
    },

    deleteArticle() {
        if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) {
            return;
        }

        const stored = localStorage.getItem('architecture_blog_articles');
        if (!stored) return;

        let articles = JSON.parse(stored);
        articles = articles.filter(a => a.id !== this.articleId);
        localStorage.setItem('architecture_blog_articles', JSON.stringify(articles));

        this.showToast('Article deleted', 'success');
        
        // Redirect back to home after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    },

    showNotFound() {
        const container = document.getElementById('articleContainer');
        container.innerHTML = `
            <div class="not-found">
                <h2>Article Not Found</h2>
                <p>The article you're looking for doesn't exist or has been removed.</p>
                <a href="index.html" class="btn btn-primary">Back to Home</a>
            </div>
        `;
        document.title = 'Not Found — Rohan Aditya';
    },

    applyTheme() {
        const savedTheme = localStorage.getItem('architecture_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
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

// Initialize
document.addEventListener('DOMContentLoaded', () => articleApp.init());