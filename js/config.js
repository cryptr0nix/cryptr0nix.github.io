export const CONFIG = {
  repoOwner: 'esakbas',
  repoName: 'esakbas.github.io',
  siteTitle: 'Hindiba',
  siteTagline: 'Belki de şimdiye kadar ardından söylenebilecek en zarif benzetme "Hindiba" idi…',
  author: 'Eşref Akbaş',
  location: 'Wan',
  profileImage: 'assets/pp.jpg',
  social: {
    instagram: 'https://www.instagram.com/esrefakbs',
    twitter: 'https://x.com/esrefakbs',
    spotify: 'https://open.spotify.com/playlist/5mZ5BOFB8HkMSzEBPiX3gi?si=3421b56087c04a81'
  },
  categories: [
    { id: 'edebiyat', name: 'Edebiyat', icon: 'fa-book' },
    { id: 'siir', name: 'Şiir', icon: 'fa-feather-alt' },
    { id: 'gunluk', name: 'Günlük', icon: 'fa-journal-whills' },
    { id: 'bir-cumle', name: 'Bir Cümle', icon: 'fa-quote-left' }
  ],
  firebase: {
    apiKey: 'AIzaSyCok6u3AtJFFBhzPen9mq1Vnt2zkGiBbiQ',
    authDomain: 'blog-yorum-85c27.firebaseapp.com',
    projectId: 'blog-yorum-85c27',
    storageBucket: 'blog-yorum-85c27.firebasestorage.app',
    messagingSenderId: '513829630788',
    appId: '1:513829630788:web:d32cea4d6cde32ab595d11',
    measurementId: 'G-8MYBYSLCKB'
  },
  fallbackPosts: [
    {
      id: 900001,
      title: 'Hindiba Notu',
      body: '## Hindiba Notu\n\nYazılar geçici olarak yüklenemediğinde bu örnek kayıt görünür.\n\n### Kısa Bir Cümle\n\nBazen bir blogun ilk işi sessizce açık kalmaktır.',
      created_at: new Date().toISOString(),
      labels: [{ name: 'gunluk' }],
      fallback: true
    },
    {
      id: 900002,
      title: 'Bir Cümle',
      body: 'Bir cümle bazen uzun bir günün kapısını kapatmaya yeter.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      labels: [{ name: 'bir-cumle' }],
      fallback: true
    }
  ]
};
