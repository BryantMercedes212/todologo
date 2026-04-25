const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { calculatePricing }     = require('../utils/pricing');
const { validateBookingInput } = require('../utils/validate');

const db = admin.firestore();

/**
 * SECURITY: Client sends only raw inputs. Server:
 *   1. Fetches real hourlyRate from Firestore — never trusts client price
 *   2. Validates all inputs
 *   3. Rejects if the slot is already taken (slot-conflict check)
 *   4. Calculates pricing server-side
 *   5. Creates booking document
 *   6. Returns bookingId + pricing
 */
exports.createBooking = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }
  if (data.clientId !== auth.uid) {
    throw new HttpsError('permission-denied', 'clientId must match auth user.');
  }
  if (!data.scheduledDate || !data.scheduledSlot) {
    throw new HttpsError('invalid-argument', 'scheduledDate and scheduledSlot are required.');
  }

  try {
    const taskerRef = db.collection('taskers').doc(data.taskerId);
    const taskerDoc = await taskerRef.get();
    validateBookingInput(data, taskerDoc);

    // Slot-conflict check: reject if this tasker already has a non-cancelled
    // booking for the same date + slot string. Cheap because both are exact
    // string equality. Race-safe enough for low-volume — for high traffic,
    // promote to a transaction.
    const conflict = await db.collection('bookings')
      .where('taskerId',      '==', data.taskerId)
      .where('scheduledDate', '==', data.scheduledDate)
      .where('scheduledSlot', '==', data.scheduledSlot)
      .get();
    const hasConflict = conflict.docs.some(d => d.data().status !== 'cancelled');
    if (hasConflict) {
      throw new HttpsError('already-exists', 'Ese horario ya está reservado. Elige otra hora.');
    }

    const tasker  = taskerDoc.data();
    const pricing = calculatePricing(tasker.hourlyRate, data.estimatedHours);

    const clientDoc = await db.collection('users').doc(data.clientId).get();
    const client    = clientDoc.exists ? clientDoc.data() : {};

    const booking = {
      clientId:    data.clientId,
      clientName:  client.name  ?? '',
      clientPhone: client.phone ?? '',
      taskerId:    data.taskerId,
      taskerName:  tasker.displayName ?? '',
      taskerPhone: tasker.phone ?? '',
      status:      'pending',
      service: {
        category:       tasker.skills?.[0] ?? '',
        description:    data.serviceNotes  ?? '',
        estimatedHours: data.estimatedHours,
      },
      scheduledAt:   admin.firestore.Timestamp.fromDate(new Date(data.scheduledAt)),
      scheduledDate: data.scheduledDate,   // 'YYYY-MM-DD'
      scheduledSlot: data.scheduledSlot,   // '9:00 AM'
      address: {
        street: data.address.street,
        sector: data.address.sector,
        city:   data.address.city   ?? 'Santo Domingo',
        coords: data.address.coords ?? null,
        notes:  data.address.notes  ?? '',
      },
      pricing,
      payment: { method: data.paymentMethod, status: 'pending', paidAt: null },
      createdAt:    admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:    admin.firestore.FieldValue.serverTimestamp(),
      cancelledAt:  null,
      cancelReason: null,
    };

    const ref = await db.collection('bookings').add(booking);
    return { success: true, bookingId: ref.id, pricing };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error.message ?? 'Unexpected error');
  }
});
