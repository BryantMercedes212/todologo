import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = (uid, patch) =>
  updateDoc(doc(db, 'users', uid), patch);
