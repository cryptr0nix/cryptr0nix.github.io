# Hindiba — Liquid Glass Blog

Eşref Akbaş'ın kişisel blogu. macOS Liquid Glass tasarım diliyle yeniden yazılmış gelişmiş sürüm.

## Dosya Yapısı

```
hindiba/
├── index.html              # Ana sayfa
├── manifest.json           # PWA manifest
├── README.md
├── assets/
│   └── pp.jpg              # Profil fotoğrafı (siz ekleyin)
├── css/
│   ├── tokens.css          # Renk, cam, spacing değişkenleri
│   ├── reset.css           # Temel sıfırlama
│   ├── glass.css           # Liquid glass bileşenleri
│   ├── layout.css          # Grid, top bar, dock, sidebar
│   ├── components.css      # Kartlar, modal, yorumlar, command palette
│   └── motion.css          # Animasyonlar
└── js/
    ├── config.js           # Site & Firebase ayarları
    ├── utils.js            # Yardımcı fonksiyonlar
    ├── markdown.js         # Markdown → HTML
    ├── github.js           # GitHub Issues API
    ├── firebase.js         # Yorum & istatistik
    ├── posts.js            # Yazı listesi render
    ├── modal.js            # Yazı okuma penceresi
    ├── comments.js         # Yorum sistemi
    ├── ui.js               # Tema, toast, klavye kısayolları
    └── app.js              # Uygulama başlatıcı
```

## İçerik Kaynağı

Yazılar `esakbas/esakbas.github.io` reposundaki **GitHub Issues** üzerinden çekilir. Her issue bir yazı; label'lar kategori belirler:

| Label       | Kategori   |
|-------------|------------|
| edebiyat    | Edebiyat   |
| siir        | Şiir       |
| gunluk      | Günlük     |
| bir-cumle   | Bir Cümle  |

## Özellikler

- macOS Liquid Glass UI (blur, vibrancy, mesh gradient)
- Karanlık / aydınlık mod + sistem tercihi
- GitHub Issues CMS (aynı repo)
- Firebase yorumlar, beğeniler, okunma sayacı
- Command palette (`Ctrl+K` / `⌘K`)
- Arama vurgulama, kaydedilen yazılar
- Okuma boyutu ayarı, ilerleme çubuğu
- İçindekiler, ilgili yazılar, paylaşım
- Klavye: `/` arama, `Esc` modal kapat
- PWA manifest, erişilebilirlik, reduced motion

## Kurulum

1. `assets/pp.jpg` profil fotoğrafını ekleyin
2. GitHub Pages'e deploy edin veya yerel sunucu:

```bash
npx serve .
```

3. `esakbas.github.io` reposuna kopyalayın (mevcut `index.html` yerine)

## Deploy (GitHub Pages)

Bu dosyaları `esakbas/esakbas.github.io` reposunun kök dizinine koyun ve push edin.
