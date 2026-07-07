import {
  escapeHtml,
  formatDate,
  getStored,
  setStored,
  getVisitorId
} from './utils.js';
import {
  addComment,
  subscribeComments,
  subscribePostStats,
  toggleCommentLike,
  incrementView
} from './firebase.js';
import { showToast } from './ui.js';

let unsubComments = null;
let unsubStats = null;

export function unmountComments() {
  unsubComments?.();
  unsubStats?.();
  unsubComments = null;
  unsubStats = null;
}

export async function mountComments(postId) {
  const mount = document.getElementById('commentsMount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="comments-section">
      <h3><i class="fas fa-comments"></i> Yorumlar</h3>
      <div class="comment-stats" id="commentStats">
        <i class="fas fa-spinner fa-spin"></i> Yükleniyor…
      </div>
      <form class="comment-form" id="commentForm">
        <input type="text" id="commentName" class="comment-field name glass-subtle"
               placeholder="Adınız (opsiyonel)" maxlength="50" autocomplete="name">
        <textarea id="commentText" class="comment-field glass-subtle"
                  placeholder="Yorumunuzu yazın…" required minlength="3" maxlength="1000"></textarea>
        <p class="comment-helper">En az 3 karakter. Gönderimler arasında 15 sn bekleme uygulanır.</p>
        <button type="submit" class="glass-btn primary" id="commentSubmit">
          <i class="fas fa-paper-plane"></i> Gönder
        </button>
      </form>
      <div id="commentsList"></div>
    </section>`;

  const visitorId = await getVisitorId();

  unsubStats = subscribePostStats(postId, stats => {
    const el = document.getElementById('commentStats');
    if (el) {
      el.innerHTML = `
        <i class="fas fa-comment"></i> ${stats.commentCount || 0} yorum ·
        <i class="fas fa-eye"></i> ${stats.viewCount || 0} okunma`;
    }
  });

  unsubComments = subscribeComments(postId, comments => {
    const list = document.getElementById('commentsList');
    if (!list) return;

    if (!comments.length) {
      list.innerHTML = `
        <p style="text-align:center;color:var(--text-tertiary);padding:2rem 0;">
          <i class="fas fa-comment-slash"></i> Henüz yorum yok. İlk yorumu sen yap!
        </p>`;
      return;
    }

    list.innerHTML = comments.map(c => {
      const liked = (c.likedBy || []).includes(visitorId);
      return `
        <article class="comment-card glass-subtle">
          <div class="comment-header">
            <span class="comment-user"><i class="fas fa-user-circle"></i> ${escapeHtml(c.userName || 'Anonim')}</span>
            <span>${formatDate(c.createdAt, true)}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
          <button type="button" class="comment-like ${liked ? 'liked' : ''}"
                  data-comment-id="${escapeHtml(c.id)}">
            <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
            <span>${c.likes || 0}</span>
          </button>
        </article>`;
    }).join('');

    list.querySelectorAll('.comment-like').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await toggleCommentLike(postId, btn.dataset.commentId);
        } catch (err) {
          console.error(err);
          showToast('Beğeni işlemi başarısız');
        } finally {
          btn.disabled = false;
        }
      });
    });
  });

  incrementView(postId);

  document.getElementById('commentForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await submitComment(postId);
  });
}

async function submitComment(postId) {
  const textEl = document.getElementById('commentText');
  const nameEl = document.getElementById('commentName');
  const btn = document.getElementById('commentSubmit');
  const text = textEl?.value.trim();

  if (!text || text.length < 3) {
    showToast('Yorum en az 3 karakter olmalı');
    return;
  }

  const cooldownKey = `commentCooldown:${postId}`;
  const last = Number(getStored(cooldownKey, '0'));
  const wait = Math.ceil((15000 - (Date.now() - last)) / 1000);
  if (wait > 0) {
    showToast(`${wait} sn bekleyin`);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor…';

  try {
    await addComment(postId, text, nameEl?.value.trim());
    setStored(cooldownKey, String(Date.now()));
    textEl.value = '';
    showToast('Yorum gönderildi');
  } catch (err) {
    console.error(err);
    showToast('Yorum gönderilemedi');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gönder';
  }
}
