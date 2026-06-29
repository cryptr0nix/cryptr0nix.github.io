// Tema değiştirme
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') body.classList.add('dark');
themeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

// Yazı boyutu
let currentFontSize = 100;
const postBody = document.querySelector('.post-body');
function applyFontSize() {
  if (postBody) postBody.style.fontSize = currentFontSize + '%';
}
applyFontSize();
document.getElementById('zoom-in')?.addEventListener('click', () => {
  currentFontSize = Math.min(160, currentFontSize + 10);
  applyFontSize();
});
document.getElementById('zoom-out')?.addEventListener('click', () => {
  currentFontSize = Math.max(80, currentFontSize - 10);
  applyFontSize();
});
document.getElementById('zoom-reset')?.addEventListener('click', () => {
  currentFontSize = 100;
  applyFontSize();
});

// Okuma ilerleme çubuğu
window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById('progressBar').style.width = scrolled + '%';
});

// Scroll ile görünürlük animasyonu
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Link kopyalama
document.querySelector('.copy-link')?.addEventListener('click', function() {
  const url = this.dataset.url;
  navigator.clipboard.writeText(url).then(() => {
    this.textContent = '✅ Kopyalandı!';
    setTimeout(() => { this.textContent = '🔗 Linki Kopyala'; }, 2000);
  });
});
