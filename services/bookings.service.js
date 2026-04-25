import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '../firebase/config';
import {
  collection, doc, query, where,
  onSnapshot, orderBy, updateDoc, serverTimestamp,
} from 'firebase/firestore';

const fns             = getFunctions(app, 'us-central1');
const createBookingFn = httpsCallable(fns, 'createBooking');
const getBusySlotsFn  = httpsCallable(fns, 'getBusySlots');

// Returns string[] of occupied slot labels for this tasker on this date,
// e.g. ['9:00 AM', '12:00 PM']. Format matches TIME_SLOTS so the picker
// can do .includes() directly.
export const getBusySlots = async (taskerId, date) => {
  try {
    const result = await getBusySlotsFn({ taskerId, date });
    return result.data?.slots ?? [];
  } catch (err) {
    console.error('getBusySlots:', err);
    return [];
  }
};

// Never send pricing from the client — the Cloud Function fetches the real
// hourlyRate from Firestore and calculates the total server-side.
export const createBooking = async (bookingData) => {
  try {
    const result = await createBookingFn({
      clientId:        bookingData.clientId,
      taskerId:        bookingData.taskerId,
      idempotencyKey:  bookingData.idempotencyKey,
      scheduledAt:     bookingData.scheduledAt,
      scheduledDate:   bookingData.scheduledDate,
      scheduledSlot:   bookingData.scheduledSlot,
      estimatedHours:  bookingData.estimatedHours,
      paymentMethod:   bookingData.paymentMethod,
      serviceNotes:    bookingData.serviceNotes ?? '',
      address:         bookingData.address,
    });
    return { success: true, bookingId: result.data.bookingId, pricing: result.data.pricing };
  } catch (error) {
    return { success: false, error: error.message ?? 'No se pudo crear la reserva' };
  }
};

// Real-time listener — call the returned unsubscribe on component unmount.
export const subscribeTaskerBookings = (taskerId, onUpdate) => {
  const q = query(
    collection(db, 'bookings'),
    where('taskerId', '==', taskerId),
    orderBy('scheduledAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate({
      pending:   all.filter(b => b.status === 'pending'),
      confirmed: all.filter(b => ['confirmed', 'in_progress'].includes(b.status)),
      completed: all.filter(b => b.status === 'completed'),
      cancelled: all.filter(b => b.status === 'cancelled'),
    });
  });
};

export const subscribeClientBooking = (bookingId, onUpdate) => {
  return onSnapshot(doc(db, 'bookings', bookingId), (snap) => {
    if (snap.exists()) onUpdate({ id: snap.id, ...snap.data() });
  });
};

// Real-time listener for everything a client has booked. Splits into
// "active" (anything still pending/confirmed/in_progress — i.e. they
// might want to cancel or track) and "history" (completed + cancelled).
export const subscribeClientBookings = (clientId, onUpdate) => {
  const q = query(
    collection(db, 'bookings'),
    where('clientId', '==', clientId),
    orderBy('scheduledAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate({
      active:  all.filter(b => ['pending','confirmed','in_progress'].includes(b.status)),
      history: all.filter(b => ['completed','cancelled'].includes(b.status)),
    });
  });
};

export const acceptBooking  = (id)         => updateDoc(doc(db, 'bookings', id), { status: 'confirmed',   updatedAt: serverTimestamp() });
export const declineBooking = (id, reason) => updateDoc(doc(db, 'bookings', id), { status: 'cancelled', cancelReason: reason, cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const startJob       = (id)         => updateDoc(doc(db, 'bookings', id), { status: 'in_progress', startedAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const completeJob    = (id)         => updateDoc(doc(db, 'bookings', id), { status: 'completed',   completedAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const cancelBooking  = (id, reason) => updateDoc(doc(db, 'bookings', id), { status: 'cancelled', cancelReason: reason, cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
