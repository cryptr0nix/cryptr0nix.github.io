import { CONFIG } from './config.js';
import { fetchPosts } from './github.js';
import {
  renderPosts,
  renderSkeleton,
  updateSidebar,
  setPostClickHandler
} from './posts.js';
import {
  setPosts,
  openPostById,
  openFromHash,
  initModal
} from './modal.js';
import {
  initTheme,
  initProgressBar,
  initReadingSize,
  initDock,
  initSearch,
  initCommandPalette,
  initCategoryFilters,
  initSavedFilter,
  showToast
} from './ui.js';

const state = {
  category: 'all',
  search: '',
  savedOnly: false
};

let allPosts = [];

async function loadPosts() {
  const feed = document.getElementById('postsFeed');
  if (feed) feed.innerHTML = renderSkeleton(3);

  try {
    allPosts = await fetchPosts();
  } catch (err) {
    console.error('Posts load error:', err);
    allPosts = [...CONFIG.fallbackPosts];
    showToast('Yazılar yüklenemedi — örnek içerik gösteriliyor');
  }

  setPosts(allPosts);
  refresh();
  openFromHash();
}

function refresh() {
  renderPosts(allPosts, state);
  updateSidebar(allPosts);
}

function init() {
  initTheme();
  initProgressBar();
  initReadingSize();
  initDock();
  initModal();

  setPostClickHandler(id => openPostById(id));

  initSearch(search => {
    state.search = search;
    refresh();
  });

  initCategoryFilters(category => {
    state.category = category;
    refresh();
  });

  initSavedFilter(savedOnly => {
    state.savedOnly = savedOnly;
    refresh();
  });

  initCommandPalette(allPosts, id => openPostById(id));

  window.addEventListener('posts:refresh', refresh);

  loadPosts().then(() => {
    initCommandPalette(allPosts, id => openPostById(id));
  });
}

document.addEventListener('DOMContentLoaded', init);
