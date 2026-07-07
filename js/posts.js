import {
  escapeHtml,
  formatDate,
  calculateReadingTime,
  getCategoryMeta,
  isPostSaved,
  toggleSavedPost,
  highlightText,
  getSavedPosts
} from './utils.js';
import { excerptFromBody } from './markdown.js';
import { filterPosts } from './github.js';
import { showToast } from './ui.js';

let onOpenPost = () => {};

export function setPostClickHandler(handler) {
  onOpenPost = handler;
}

export function renderSkeleton(count = 3) {
  return Array.from({ length: count }, () => `
    <article class="skeleton glass glass-card">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </article>
  `).join('');
}

export function renderPosts(posts, state) {
  const container = document.getElementById('postsFeed');
  if (!container) return;

  const filtered = filterPosts(posts, {
    category: state.category,
    search: state.search,
    savedOnly: state.savedOnly,
    savedIds: getSavedPosts()
  });

  updateResultsStatus(filtered.length, posts.length, state);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state glass glass-card animate-in">
        <i class="fas fa-compass"></i>
        <h3>Sonuç Bulunamadı</h3>
        <p style="color:var(--text-secondary);margin-top:0.5rem;">Bu kriterlere uygun yazı bulunamadı.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map((post, i) => {
    const cat = getCategoryMeta(post);
    const excerpt = excerptFromBody(post.body);
    const saved = isPostSaved(post.id);
    const delay = Math.min(i * 50, 400);

    return `
      <article class="post-card glass glass-card glass-chrome animate-in"
               style="animation-delay:${delay}ms"
               data-post-id="${post.id}"
               tabindex="0"
               role="button"
               aria-label="${escapeHtml(post.title)}">
        <div class="post-card-header">
          <span class="badge ${cat.className}"><i class="fas ${cat.icon}"></i> ${cat.name}</span>
        </div>
        <h2 class="post-title">${state.search ? highlightText(post.title, state.search) : escapeHtml(post.title)}</h2>
        <div class="post-meta">
          <span><i class="far fa-calendar-alt"></i>${formatDate(post.created_at)}</span>
          <span><i class="far fa-clock"></i>${calculateReadingTime(post.body)} dk</span>
        </div>
        <p class="post-excerpt">${state.search ? highlightText(excerpt, state.search) : escapeHtml(excerpt)}</p>
        <div class="post-footer">
          <span class="read-link">Oku <i class="fas fa-arrow-right"></i></span>
          <button type="button" class="save-btn ${saved ? 'saved' : ''}"
                  data-save-id="${post.id}"
                  aria-label="${saved ? 'Kaydı kaldır' : 'Kaydet'}">
            <i class="${saved ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
      </article>`;
  }).join('');

  bindPostEvents(container);
}

function bindPostEvents(container) {
  container.querySelectorAll('[data-post-id]').forEach(card => {
    const open = () => {
      const id = Number(card.dataset.postId);
      onOpenPost(id);
    };
    card.addEventListener('click', e => {
      if (!e.target.closest('[data-save-id]')) open();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  container.querySelectorAll('[data-save-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const saved = toggleSavedPost(btn.dataset.saveId);
      btn.classList.toggle('saved', saved);
      btn.querySelector('i').className = saved ? 'fas fa-heart' : 'far fa-heart';
      showToast(saved ? 'Yazı kaydedildi' : 'Kayıt kaldırıldı');
      window.dispatchEvent(new CustomEvent('posts:refresh'));
    });
  });
}

function updateResultsStatus(count, total, state) {
  const el = document.getElementById('resultsStatus');
  if (!el) return;
  const parts = [`${count} yazı`];
  if (count !== total) parts.push(`${total} toplam`);
  if (state.savedOnly) parts.push('kaydedilenler');
  if (state.search) parts.push(`"${state.search}"`);
  el.textContent = parts.join(' · ');
}

export function updateSidebar(posts) {
  document.getElementById('totalPosts').textContent = posts.length;

  const counts = {};
  posts.forEach(p => {
    p.labels?.forEach(l => {
      counts[l.name] = (counts[l.name] || 0) + 1;
    });
  });

  document.querySelectorAll('[data-cat-count]').forEach(el => {
    const cat = el.dataset.catCount;
    const name = el.dataset.catName;
    el.innerHTML = `<i class="fas ${el.dataset.catIcon}"></i> ${name} (${counts[cat] || 0})`;
  });

  const recent = [...posts].slice(0, 5);
  const recentEl = document.getElementById('recentPosts');
  if (!recentEl) return;

  if (recent.length === 0) {
    recentEl.innerHTML = '<li>Henüz yazı yok</li>';
    return;
  }

  recentEl.innerHTML = recent.map(p => `
    <li><a href="#post-${p.id}" data-recent-id="${p.id}">${escapeHtml(p.title)}</a></li>
  `).join('');

  recentEl.querySelectorAll('[data-recent-id]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      onOpenPost(Number(link.dataset.recentId));
    });
  });
}
