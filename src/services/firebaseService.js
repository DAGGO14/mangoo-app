import {
  collection, doc, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, where,
  serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Collections ───
const COLS = {
  orders:    'orders',
  products:  'products',
  users:     'users',
  packages:  'packages',
  wishlist:  'wishlist',
  notifs:    'notifs',   // subcollection per user: notifs/{userId}/items
};

// ─── ORDERS ───
export async function fsGetOrders() {
  const snap = await getDocs(query(collection(db, COLS.orders), orderBy('createdAt','desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function fsListenOrders(callback) {
  return onSnapshot(
    query(collection(db, COLS.orders), orderBy('createdAt','desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function fsAddOrder(order) {
  const ref = doc(collection(db, COLS.orders), order.id);
  await setDoc(ref, { ...order, createdAt: order.createdAt || new Date().toISOString() });
  return order;
}

export async function fsUpdateOrder(orderId, updates) {
  await updateDoc(doc(db, COLS.orders, orderId), { ...updates, updatedAt: new Date().toISOString() });
}

export async function fsDeleteOrder(orderId) {
  await deleteDoc(doc(db, COLS.orders, orderId));
}

// ─── PRODUCTS ───
export async function fsGetProducts() {
  const snap = await getDocs(collection(db, COLS.products));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export function fsListenProducts(callback) {
  return onSnapshot(collection(db, COLS.products),
    snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id })))
  );
}

export async function fsSaveProduct(product) {
  const id = String(product.id || Date.now());
  await setDoc(doc(db, COLS.products, id), { ...product, id });
}

export async function fsDeleteProduct(productId) {
  await deleteDoc(doc(db, COLS.products, String(productId)));
}

// ─── USERS ───
export async function fsGetUsers() {
  const snap = await getDocs(collection(db, COLS.users));
  return snap.docs.map(d => ({ ...d.data() }));
}

export async function fsSaveUser(user) {
  if (!user?.id) return;
  // Strip large base64 images before saving to Firestore (10MB limit per doc)
  const safe = { ...user };
  if (safe.avatarImg && safe.avatarImg.length > 50000) {
    safe.avatarImg = null; // too large for Firestore, keep in localStorage
  }
  await setDoc(doc(db, COLS.users, user.id), safe, { merge: true });
}

export async function fsGetUser(userId) {
  const snap = await getDoc(doc(db, COLS.users, userId));
  return snap.exists() ? snap.data() : null;
}

// ─── PACKAGES ───
export async function fsGetPackages() {
  const snap = await getDocs(query(collection(db, COLS.packages), orderBy('createdAt','desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fsAddPackage(pkg) {
  await setDoc(doc(collection(db, COLS.packages), pkg.id), pkg);
}

// ─── WISHLIST ───
export async function fsGetWishlist() {
  const snap = await getDocs(collection(db, COLS.wishlist));
  return snap.docs.map(d => ({ ...d.data() }));
}

export async function fsSaveWishlistItem(item) {
  await setDoc(doc(db, COLS.wishlist, String(item.id)), item);
}

export async function fsDeleteWishlistItem(id) {
  await deleteDoc(doc(db, COLS.wishlist, String(id)));
}

// ─── NOTIFICATIONS (per user) ───
function userNotifsCol(userId) {
  return collection(db, COLS.notifs, userId, 'items');
}

export async function fsGetNotifs(userId) {
  if (!userId) return [];
  const snap = await getDocs(query(userNotifsCol(userId), orderBy('createdAt','desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function fsListenNotifs(userId, callback) {
  if (!userId) return () => {};
  return onSnapshot(
    query(userNotifsCol(userId), orderBy('createdAt','desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function fsAddNotif(userId, notif) {
  if (!userId) return;
  const ref = doc(userNotifsCol(userId));
  await setDoc(ref, { ...notif, createdAt: new Date().toISOString() });
}

export async function fsMarkNotifsRead(userId, notifIds) {
  if (!userId || !notifIds.length) return;
  const batch = writeBatch(db);
  notifIds.forEach(id => {
    batch.update(doc(db, COLS.notifs, userId, 'items', id), { read: true });
  });
  await batch.commit();
}
