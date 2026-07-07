import { getStored, setStored, debounce } from './utils.js';

let toastTimer = null;

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

export function initTheme() {
  const saved = getStored('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  updateThemeIcon();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  setStored('theme', next);
  updateThemeIcon();
  showToast(next === 'dark' ? 'Karanlık mod' : 'Aydınlık mod');
}

function updateThemeIcon() {
  const theme = document.documentElement.getAttribute('data-theme');
  const isDark = theme === 'dark' ||
    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const icon = document.querySelector('#themeToggle i');
  if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

export function initProgressBar() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${Math.min(pct, 100)}%`;
  }, { passive: true });
}

export function initReadingSize(onChange) {
  let size = Number(getStored('readingFontSize', '1.05')) || 1.05;

  const apply = () => {
    size = Math.min(1.35, Math.max(0.9, size));
    document.documentElement.style.setProperty('--reading-size', `${size}rem`);
    setStored('readingFontSize', String(size));
    onChange?.(size);
  };

  apply();

  document.getElementById('fontDecrease')?.addEventListener('click', () => {
    size -= 0.05;
    apply();
    showToast('Yazı küçültüldü');
  });

  document.getElementById('fontReset')?.addEventListener('click', () => {
    size = 1.05;
    apply();
    showToast('Yazı sıfırlandı');
  });

  document.getElementById('fontIncrease')?.addEventListener('click', () => {
    size += 0.05;
    apply();
    showToast('Yazı büyütüldü');
  });
}

export function initDock() {
  document.getElementById('scrollTopBtn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function initSearch(onSearch) {
  const input = document.getElementById('searchInput');
  if (!input) return;

  const handler = debounce(() => onSearch(input.value.trim()), 200);
  input.addEventListener('input', handler);

  document.addEventListener('keydown', e => {
    if (e.key === '/' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      input.focus();
    }
  });
}

export function initCommandPalette(posts, onOpenPost) {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandInput');
  const results = document.getElementById('commandResults');
  if (!palette || !input || !results) return;

  let selectedIndex = 0;
  let filtered = [];

  const open = () => {
    palette.classList.add('open');
    input.value = '';
    renderResults(posts.slice(0, 8));
    input.focus();
  };

  const close = () => {
    palette.classList.remove('open');
    selectedIndex = 0;
  };

  const renderResults = items => {
    filtered = items;
    selectedIndex = 0;
    if (!items.length) {
      results.innerHTML = '<div class="command-item">Sonuç yok</div>';
      return;
    }
    results.innerHTML = items.map((p, i) => `
      <div class="command-item ${i === 0 ? 'selected' : ''}" data-cmd-id="${p.id}">
        <i class="fas fa-file-alt"></i>
        <span>${p.title}</span>
      </div>
    `).join('');

    results.querySelectorAll('.command-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        onOpenPost(Number(el.dataset.cmdId));
        close();
      });
      el.addEventListener('mouseenter', () => {
        selectedIndex = i;
        updateSelection();
      });
    });
  };

  const updateSelection = () => {
    results.querySelectorAll('.command-item').forEach((el, i) => {
      el.classList.toggle('selected', i === selectedIndex);
    });
  };

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const items = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.body && p.body.toLowerCase().includes(q))
    ).slice(0, 10);
    renderResults(items);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection();
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      onOpenPost(filtered[selectedIndex].id);
      close();
    } else if (e.key === 'Escape') {
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      palette.classList.contains('open') ? close() : open();
    }
  });

  palette.addEventListener('click', e => {
    if (e.target === palette) close();
  });

  document.getElementById('cmdHint')?.addEventListener('click', open);
}

export function initCategoryFilters(onFilter) {
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach(b =>
        b.classList.toggle('active', b === btn)
      );
      onFilter(btn.dataset.category);
    });
  });
}

export function initSavedFilter(onToggle) {
  document.getElementById('savedFilter')?.addEventListener('click', e => {
    const active = e.currentTarget.classList.toggle('active');
    onToggle(active);
    showToast(active ? 'Kaydedilenler' : 'Tüm yazılar');
  });
}
