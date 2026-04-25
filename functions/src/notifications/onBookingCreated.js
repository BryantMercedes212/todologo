const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

// Triggered automatically when a booking is created — sends FCM push to tasker.
exports.onBookingCreated = onDocumentCreated('bookings/{bookingId}', async (event) => {
  const snap = event.data;
  if (!snap) return null;
  const booking   = snap.data();
  const bookingId = event.params.bookingId;
  try {
    const taskerDoc = await admin.firestore().collection('users').doc(booking.taskerId).get();
    const fcmToken  = taskerDoc.data()?.fcmToken;
    if (!fcmToken) return null;

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: '¡Nueva solicitud de trabajo! 🔔',
        body:  `${booking.clientName} necesita ${booking.service.category} en ${booking.address.sector}`,
      },
      data:    { bookingId, screen: '/(tasker)/' },
      android: { priority: 'high' },
      apns:    { payload: { aps: { sound: 'default', badge: 1 } } },
    });
    return null;
  } catch (error) {
    console.error('onBookingCreated:', error);
    return null;
  }
});
