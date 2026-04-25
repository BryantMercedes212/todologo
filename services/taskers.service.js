import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';

// Haversine formula — distance in km between two GPS coordinates.
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, dLat = ((lat2-lat1)*Math.PI)/180, dLng = ((lng2-lng1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Firestore has no native geo query — we filter client-side.
// Upgrade to GeoFirestore when taskers grow past ~500.
export const getNearbyTaskers = async (userLat, userLng, category = null, radiusKm = 15) => {
  try {
    let q = query(
      collection(db, 'taskers'),
      where('isAvailableNow', '==', true),
      where('isActive', '==', true)
    );
    if (category) q = query(q, where('categories', 'array-contains', category));

    const snap    = await getDocs(q);
    const taskers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return taskers
      .filter(t => t.location?.coords)
      .map(t => {
        const distance = getDistanceKm(userLat, userLng, t.location.coords.lat, t.location.coords.lng);
        return { ...t, distance: parseFloat(distance.toFixed(1)) };
      })
      .filter(t => t.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('getNearbyTaskers:', error);
    return [];
  }
};

export const getTaskerProfile = async (userId) => {
  const [u, t] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDoc(doc(db, 'taskers', userId)),
  ]);
  return { ...(u.data() ?? {}), ...(t.data() ?? {}) };
};

export const updateTaskerAvailability = (userId, isAvailableNow) =>
  updateDoc(doc(db, 'taskers', userId), { isAvailableNow });

export const updateTaskerProfile = (userId, patch) =>
  updateDoc(doc(db, 'taskers', userId), patch);
