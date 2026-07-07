import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { CONFIG } from './config.js';
import { getVisitorId } from './utils.js';

const app = initializeApp(CONFIG.firebase);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth).catch(err => console.error('Firebase auth:', err));

export async function addComment(postId, text, userName) {
  const commentsRef = collection(db, 'posts', String(postId), 'comments');
  const docRef = await addDoc(commentsRef, {
    text,
    userName: userName || 'Anonim',
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: []
  });

  await setDoc(doc(db, 'posts', String(postId)), {
    commentCount: increment(1),
    title: String(postId)
  }, { merge: true });

  return docRef.id;
}

export function subscribeComments(postId, callback) {
  const q = query(
    collection(db, 'posts', String(postId), 'comments'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

export async function toggleCommentLike(postId, commentId) {
  const visitorId = await getVisitorId();
  const commentRef = doc(db, 'posts', String(postId), 'comments', commentId);
  const snap = await getDoc(commentRef);

  if (!snap.exists()) return null;

  const likedBy = snap.data().likedBy || [];
  if (likedBy.includes(visitorId)) {
    await updateDoc(commentRef, {
      likes: increment(-1),
      likedBy: likedBy.filter(id => id !== visitorId)
    });
    return 'unliked';
  }

  await updateDoc(commentRef, {
    likes: increment(1),
    likedBy: arrayUnion(visitorId)
  });
  return 'liked';
}

export async function incrementView(postId) {
  await setDoc(doc(db, 'posts', String(postId)), {
    viewCount: increment(1)
  }, { merge: true });
}

export function subscribePostStats(postId, callback) {
  return onSnapshot(doc(db, 'posts', String(postId)), docSnap => {
    callback(docSnap.exists() ? docSnap.data() : { viewCount: 0, commentCount: 0 });
  }, () => callback({ viewCount: 0, commentCount: 0 }));
}

export { getVisitorId };
