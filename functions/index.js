const admin = require('firebase-admin');
admin.initializeApp();

const { createBooking }    = require('./src/bookings/createBooking');
const { getBusySlots }     = require('./src/bookings/getBusySlots');
const { onBookingCreated } = require('./src/notifications/onBookingCreated');

exports.createBooking    = createBooking;
exports.getBusySlots     = getBusySlots;
exports.onBookingCreated = onBookingCreated;
