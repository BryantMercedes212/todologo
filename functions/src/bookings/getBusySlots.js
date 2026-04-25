const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const db = admin.firestore();

// Server-side because Firestore rules block clients from reading bookings
// they're not a participant in. Returns ONLY occupied slot strings — no
// addresses, prices, or names leak. Cancelled bookings are excluded so
// the slot frees up.
//
// Reads scheduledDate + scheduledSlot string fields directly — no
// Timestamp/timezone math, the labels match TIME_SLOTS exactly.
exports.getBusySlots = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }

  const { taskerId, date } = data ?? {};
  if (!taskerId || !date) {
    throw new HttpsError('invalid-argument', 'taskerId and date are required.');
  }

  const snap = await db.collection('bookings')
    .where('taskerId',      '==', taskerId)
    .where('scheduledDate', '==', date)
    .get();

  const slots = snap.docs
    .map(d => d.data())
    .filter(b => b.status !== 'cancelled' && b.scheduledSlot)
    .map(b => b.scheduledSlot);

  return { slots };
});
