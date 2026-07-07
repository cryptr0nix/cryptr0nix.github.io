import { CONFIG } from './config.js';

export async function fetchPosts() {
  const url = `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/issues?state=all&per_page=100`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const issues = await response.json();
  if (!Array.isArray(issues)) {
    throw new Error('Unexpected API response');
  }

  return issues
    .filter(issue => !issue.pull_request)
    .filter(issue => Array.isArray(issue.labels) && issue.labels.length > 0)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getCategoryCounts(posts) {
  const counts = Object.fromEntries(CONFIG.categories.map(c => [c.id, 0]));
  posts.forEach(post => {
    post.labels?.forEach(label => {
      if (counts[label.name] !== undefined) counts[label.name]++;
    });
  });
  return counts;
}

export function filterPosts(posts, { category, search, savedOnly, savedIds }) {
  let filtered = [...posts];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.labels?.some(l => l.name === category));
  }

  if (savedOnly) {
    filtered = filtered.filter(p => savedIds.includes(String(p.id)));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.body && p.body.toLowerCase().includes(q))
    );
  }

  return filtered;
}

export function getRelatedPosts(posts, currentPost, limit = 3) {
  const tags = currentPost.labels?.map(l => l.name) ?? [];
  return posts
    .filter(p => p.id !== currentPost.id)
    .map(p => ({
      ...p,
      score: p.labels?.filter(l => tags.includes(l.name)).length ?? 0
    }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
