import { Linking } from 'react-native';
import { formatCurrency, formatDateShort } from './format';

export const sendWhatsAppNotification = async ({
  phone, taskerName, clientName,
  service, date, time, sector, bookingId, total,
}) => {
  const message = [
    `*Nueva reserva en TaskApp* 🔔`, ``,
    `Hola ${taskerName}, tienes una nueva solicitud:`, ``,
    `*Cliente:* ${clientName}`,
    `*Servicio:* ${service}`,
    `*Fecha:* ${formatDateShort(date)}`,
    `*Hora:* ${time}`,
    `*Sector:* ${sector}, Santo Domingo`,
    `*Total estimado:* ${formatCurrency(total)}`,
    `*ID Reserva:* #${bookingId?.slice(-8).toUpperCase()}`, ``,
    `Abre la app para confirmar o rechazar esta reserva.`,
  ].join('\n');

  const digits = phone.replace(/\D/g, '');
  const url    = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
    return { success: true };
  } catch {
    return { success: false };
  }
};
