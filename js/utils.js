import { CONFIG } from './config.js';

export function getStored(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Storage unavailable:', error);
  }
}

export function getSavedPosts() {
  try {
    return JSON.parse(getStored('savedPosts', '[]'));
  } catch {
    return [];
  }
}

export function toggleSavedPost(id) {
  const sid = String(id);
  const saved = getSavedPosts();
  const next = saved.includes(sid) ? saved.filter(x => x !== sid) : [...saved, sid];
  setStored('savedPosts', JSON.stringify(next));
  return next.includes(sid);
}

export function isPostSaved(id) {
  return getSavedPosts().includes(String(id));
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}

export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '#';
  } catch {
    return '#';
  }
}

export function formatDate(value, withTime = false) {
  if (!value) return 'Tarih yok';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tarih yok';
  return withTime ? date.toLocaleString('tr-TR') : date.toLocaleDateString('tr-TR');
}

export function calculateReadingTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugifyCategory(category) {
  return String(category || 'edebiyat').toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getCategoryMeta(post) {
  const id = post.labels?.[0]?.name || 'edebiyat';
  const found = CONFIG.categories.find(c => c.id === id);
  return {
    id,
    className: `badge-${slugifyCategory(id)}`,
    name: found?.name || escapeHtml(id),
    icon: found?.icon || 'fa-tag'
  };
}

export function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(pattern, '<mark>$1</mark>');
}

export async function getVisitorId() {
  let id = getStored('visitorId');
  if (!id) {
    id = `visitor_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
    setStored('visitorId', id);
  }
  return id;
}

export function debounce(fn, ms = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand('copy');
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  } finally {
    input.remove();
  }
}

export function shareOnTwitter(title, url) {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400,noopener');
}
