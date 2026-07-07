import {
  escapeHtml,
  formatDate,
  calculateReadingTime,
  getCategoryMeta,
  isPostSaved,
  copyToClipboard,
  shareOnTwitter,
  setStored,
  getStored,
  toggleSavedPost
} from './utils.js';
import { markdownToHtml, addTableOfContents, stripLeadingTitle } from './markdown.js';
import { getRelatedPosts } from './github.js';
import { mountComments, unmountComments } from './comments.js';
import { showToast } from './ui.js';

let allPosts = [];
let currentPostId = null;

export function setPosts(posts) {
  allPosts = posts;
}

export function getCurrentPostId() {
  return currentPostId;
}

export function openPostById(id, { updateHash = true } = {}) {
  const post = allPosts.find(p => p.id === id);
  if (post) openModal(post, { updateHash });
}

export function openModal(post, { updateHash = true } = {}) {
  const overlay = document.getElementById('postModal');
  const body = document.getElementById('modalBody');
  const titleBar = document.getElementById('modalTitleBar');
  if (!overlay || !body) return;

  unmountComments();
  currentPostId = post.id;

  if (updateHash) {
    history.replaceState(null, '', `#post-${post.id}`);
  }

  setStored('lastReadPostId', String(post.id));
  setStored('lastReadPostTitle', post.title || '');
  updateLastRead();

  const cat = getCategoryMeta(post);
  const content = addTableOfContents(
    markdownToHtml(stripLeadingTitle(post.body))
  );
  const saved = isPostSaved(post.id);

  if (titleBar) titleBar.textContent = post.title;

  body.innerHTML = `
    <span class="badge ${cat.className}"><i class="fas ${cat.icon}"></i> ${cat.name}</span>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      <span><i class="far fa-calendar-alt"></i>${formatDate(post.created_at)}</span>
      <span><i class="far fa-clock"></i>${calculateReadingTime(post.body)} dk okuma</span>
    </div>
    <div class="vibrancy-line" style="margin:1.5rem 0;"></div>
    <div class="post-content">${content}</div>
    <div class="modal-actions">
      <button type="button" class="glass-btn" id="shareTwitter">
        <i class="fab fa-x-twitter"></i> Paylaş
      </button>
      <button type="button" class="glass-btn" id="copyLink">
        <i class="fas fa-link"></i> Link Kopyala
      </button>
      <button type="button" class="glass-btn ${saved ? 'active' : ''}" id="saveInModal">
        <i class="${saved ? 'fas' : 'far'} fa-heart"></i> ${saved ? 'Kaydedildi' : 'Kaydet'}
      </button>
    </div>
    ${renderRelated(post)}
    <div id="commentsMount"></div>
  `;

  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  overlay.scrollTop = 0;

  body.querySelector('#shareTwitter')?.addEventListener('click', () => {
    shareOnTwitter(post.title, window.location.href);
  });

  body.querySelector('#copyLink')?.addEventListener('click', async () => {
    try {
      await copyToClipboard(window.location.href);
      showToast('Link kopyalandı');
    } catch {
      showToast('Kopyalanamadı');
    }
  });

  body.querySelector('#saveInModal')?.addEventListener('click', () => {
    const nowSaved = toggleSavedPost(post.id);
    window.dispatchEvent(new CustomEvent('posts:refresh'));
    const btn = body.querySelector('#saveInModal');
    btn.classList.toggle('active', nowSaved);
    btn.innerHTML = `<i class="${nowSaved ? 'fas' : 'far'} fa-heart"></i> ${nowSaved ? 'Kaydedildi' : 'Kaydet'}`;
    showToast(nowSaved ? 'Yazı kaydedildi' : 'Kayıt kaldırıldı');
  });

  body.querySelectorAll('.related-item').forEach(el => {
    el.addEventListener('click', () => openPostById(Number(el.dataset.relatedId)));
  });

  body.querySelectorAll('.toc-panel a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      body.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  mountComments(post.id);
}

function renderRelated(currentPost) {
  const related = getRelatedPosts(allPosts, currentPost);
  if (!related.length) return '';

  return `
    <section class="related-section">
      <h3><i class="fas fa-layer-group"></i> İlgili Yazılar</h3>
      ${related.map(p => `
        <div class="related-item glass-subtle" data-related-id="${p.id}">
          <h4>${escapeHtml(p.title)}</h4>
          <small><i class="far fa-calendar-alt"></i> ${formatDate(p.created_at)}</small>
        </div>
      `).join('')}
    </section>`;
}

export function closeModal() {
  const overlay = document.getElementById('postModal');
  if (!overlay) return;

  overlay.classList.remove('open');
  document.body.classList.remove('modal-open');
  unmountComments();
  currentPostId = null;

  if (window.location.hash.startsWith('#post-')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

export function openFromHash() {
  const match = window.location.hash.match(/^#post-(\d+)/);
  if (!match || !allPosts.length) return;
  openPostById(Number(match[1]), { updateHash: false });
}

function updateLastRead() {
  const el = document.getElementById('lastReadTitle');
  const title = getStored('lastReadPostTitle');
  if (el) {
    el.textContent = title ? title.slice(0, 32) : 'Yok';
    el.title = title;
  }
}

export function initModal() {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('postModal')?.addEventListener('click', e => {
    if (e.target.id === 'postModal') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
  window.addEventListener('hashchange', openFromHash);
  updateLastRead();
}

// Global for inline onclick fallbacks
window.openPostById = openPostById;
