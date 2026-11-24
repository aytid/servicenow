// Vercel Serverless Function: /api/publish
// Commits updated articlesData directly to aytid/servicenow -> data.js on GitHub

const OWNER = 'aytid';
const REPO = 'servicenow';
const BRANCH = 'main';
const FILE_PATH = 'data.js';

function escapeTemplateBackticks(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function serializeArticlesToDataJs(articles) {
  const serializedItems = articles.map((a) => {
    const tagsStr = JSON.stringify(a.tags || []);
    return `    {
        id: ${JSON.stringify(String(a.id))},
        title: ${JSON.stringify(a.title || '')},
        category: ${JSON.stringify(a.category || 'Tutorial')},
        excerpt: ${JSON.stringify(a.excerpt || '')},
        tags: ${tagsStr},
        date: ${JSON.stringify(a.date || '')},
        views: ${Number(a.views || 0)},
        created: ${JSON.stringify(a.created || new Date().toISOString())},
        content: \`${escapeTemplateBackticks(a.content || '')}\`
    }`;
  }).join(',\n');

  return `const articlesData = [
${serializedItems}
];

function getArticles() {
    const stored = localStorage.getItem('blog_articles');
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem('blog_articles', JSON.stringify(articlesData));
    return articlesData;
}

function saveArticles(articles) {
    localStorage.setItem('blog_articles', JSON.stringify(articles));
}

function getArticleById(id) {
    const articles = getArticles();
    return articles.find(a => a.id === id);
}

function incrementViews(id) {
    const articles = getArticles();
    const article = articles.find(a => a.id === id);
    if (article) {
        article.views = (article.views || 0) + 1;
        saveArticles(articles);
    }
}
`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const adminPin = process.env.ADMIN_PIN;

  if (!githubToken) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not configured in Vercel Environment Variables.' });
  }

  if (!adminPin) {
    return res.status(500).json({ error: 'ADMIN_PIN is not configured in Vercel Environment Variables.' });
  }

  const { pin, articles, commitMessage } = req.body || {};

  const crypto = require('crypto');
  const hash = (v) => crypto.createHash('sha256').update(String(v || '')).digest();
  if (!crypto.timingSafeEqual(hash(pin), hash(adminPin))) {
    return res.status(401).json({ error: 'Invalid Admin PIN.' });
  }

  if (!Array.isArray(articles)) {
    return res.status(400).json({ error: 'Invalid articles payload.' });
  }

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'rohannow-admin-publisher'
  };

  try {
    // 1. Fetch current SHA of data.js on main
    const getResp = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers });
    let sha = undefined;

    if (getResp.ok) {
      const fileInfo = await getResp.json();
      sha = fileInfo.sha;
    } else if (getResp.status !== 404) {
      const errText = await getResp.text();
      return res.status(getResp.status).json({ error: `Failed to read GitHub file: ${errText}` });
    }

    // 2. Generate updated data.js content & Base64 encode
    const updatedContent = serializeArticlesToDataJs(articles);
    const encodedContent = Buffer.from(updatedContent, 'utf8').toString('base64');

    // 3. Commit updated data.js back to GitHub
    const putBody = {
      message: commitMessage || `chore(blog): update articles via admin (${new Date().toISOString().slice(0, 10)})`,
      content: encodedContent,
      branch: BRANCH
    };
    if (sha) putBody.sha = sha;

    const putResp = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody)
    });

    const putData = await putResp.json();
    if (!putResp.ok) {
      return res.status(putResp.status).json({ error: putData.message || 'GitHub commit failed' });
    }

    return res.status(200).json({
      ok: true,
      commitSha: putData.commit?.sha,
      htmlUrl: putData.commit?.html_url
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
};
