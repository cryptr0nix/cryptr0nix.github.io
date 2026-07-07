import { escapeHtml, sanitizeUrl } from './utils.js';

export function markdownToHtml(md) {
  let html = escapeHtml(md);

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt; (.*)$/gm, '<blockquote><p>$1</p></blockquote>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, label, url) =>
    `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
  );

  html = html.split('\n\n').map(para => {
    if (/^<(h[1-3]|pre|blockquote)/.test(para.trim())) return para;
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

export function addTableOfContents(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const headings = [...template.content.querySelectorAll('h2, h3')];
  if (headings.length < 2) return html;

  const links = headings.map((heading, index) => {
    const id = `section-${index + 1}`;
    heading.id = id;
    return `<a href="#${id}">${escapeHtml(heading.textContent)}</a>`;
  }).join('');

  const toc = document.createElement('nav');
  toc.className = 'toc-panel glass-subtle';
  toc.setAttribute('aria-label', 'İçindekiler');
  toc.innerHTML = `<h3><i class="fas fa-list"></i> İçindekiler</h3>${links}`;
  template.content.prepend(toc);
  return template.innerHTML;
}

export function stripLeadingTitle(body) {
  return String(body || '').replace(/^## .*\n/, '');
}

export function excerptFromBody(body, maxLen = 200) {
  const plain = String(body || '')
    .replace(/[#*_>`\[\]()]/g, '')
    .split('\n')
    .slice(0, 3)
    .join(' ')
    .trim();
  if (!plain) return 'Özet bulunmuyor.';
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
}
