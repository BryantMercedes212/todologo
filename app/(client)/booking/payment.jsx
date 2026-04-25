import { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBooking } from '../../../context/BookingContext';
import { useAuth } from '../../../hooks/useAuth';
import { useAsync } from '../../../hooks/useAsync';
import { createBooking } from '../../../services/bookings.service';
import { sendWhatsAppNotification } from '../../../utils/whatsapp';
import { formatCurrency, convertTo24h } from '../../../utils/format';
import { PAYMENT_METHODS } from '../../../constants/data';
import { ROUTES } from '../../../constants/routes';
import { colors } from '../../../constants/colors';

// RFC 4122 v4 UUID. Math.random is fine here — this is a dedup key, not a
// security token. Collision odds within one user's tap window are vanishing.
const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

export default function PaymentScreen() {
  const router                                            = useRouter();
  const { booking, updateBooking, pricing, resetBooking } = useBooking();
  const { user, userProfile }                             = useAuth();
  const { loading, run }                                  = useAsync();

  // Mint once per screen mount. Every Confirmar tap reuses this key, so a
  // double-tap (or retry after a network blip) lands on the same booking
  // server-side instead of creating duplicates.
  const idempotencyKey = useRef(uuidv4()).current;

  const handleConfirm = () => run(async () => {
    const result = await createBooking({
      clientId:       user.uid,
      taskerId:       booking.tasker.id,
      idempotencyKey,
      scheduledAt:    new Date(`${booking.date}T${convertTo24h(booking.time)}`),
      scheduledDate:  booking.date,   // 'YYYY-MM-DD' — used for busy/conflict lookups
      scheduledSlot:  booking.time,   // '9:00 AM' — exact label users see
      estimatedHours: booking.estimatedHours,
      paymentMethod:  booking.paymentMethod,
      serviceNotes:   booking.serviceNotes,
      address:        booking.address,
    });
    if (!result.success) { Alert.alert('Error', result.error); return; }

    await sendWhatsAppNotification({
      phone:      booking.tasker.phone,
      taskerName: booking.tasker.displayName,
      clientName: userProfile?.name ?? 'Un cliente',
      service:    booking.tasker.skills?.[0],
      date:       booking.date,
      time:       booking.time,
      sector:     booking.address.sector,
      bookingId:  result.bookingId,
      total:      result.pricing.total,
    });
    resetBooking();
    router.replace(`${ROUTES.BOOKING_CONFIRM}?id=${result.bookingId}`);
  });

  if (!pricing) {
    // Hot reload or deep link with missing tasker — send back to home.
    return (
      <View style={s.missing}>
        <Text style={s.missingText}>Falta información de la reserva.</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.replace(ROUTES.CLIENT_HOME)}>
          <Text style={s.btnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.heading}>Resumen y pago</Text>

      <View style={s.card}>
        <Row label="Técnico"   value={booking.tasker?.displayName} />
        <Row label="Fecha"     value={booking.date} />
        <Row label="Hora"      value={booking.time} />
        <Row label="Dirección" value={`${booking.address.sector}, Santo Domingo`} />
      </View>

      <View style={s.card}>
        <Row label={`Servicio (${pricing.hours}h × ${formatCurrency(pricing.hourlyRate)})`} value={formatCurrency(pricing.subtotal)} />
        <Row label="Cargo servicio (10%)" value={formatCurrency(pricing.serviceFee)} />
        <Row label="ITBIS (18%)"          value={formatCurrency(pricing.itbis)} />
        <View style={s.div} />
        <Row label="Total estimado" value={formatCurrency(pricing.total)} bold />
      </View>

      <Text style={s.label}>Método de pago</Text>
      {PAYMENT_METHODS.map(m => (
        <TouchableOpacity key={m.id} style={[s.pay, booking.paymentMethod===m.id && s.payActive]} onPress={() => updateBooking({ paymentMethod: m.id })}>
          <View style={[s.radio, booking.paymentMethod===m.id && s.radioActive]}>
            {booking.paymentMethod===m.id && <View style={s.radioDot}/>}
          </View>
          <View><Text style={s.payLabel}>{m.label}</Text><Text style={s.paySub}>{m.sub}</Text></View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleConfirm} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnText}>Confirmar · {formatCurrency(pricing.total)}</Text>}
      </TouchableOpacity>
      <Text style={s.note}>Recibirás confirmación por WhatsApp</Text>
    </ScrollView>
  );
}

const Row = ({ label, value, bold }) => (
  <View style={s.row}>
    <Text style={[s.rowL, bold && s.bold]}>{label}</Text>
    <Text style={[s.rowV, bold && { color:colors.primary, fontSize:16 }]}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container:   { flex:1, backgroundColor:colors.background },
  missing:     { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  missingText: { color: colors.textMuted, fontSize: 14 },
  heading:     { fontSize:22, fontWeight:'600', color:colors.text, marginBottom:20 },
  card:        { backgroundColor:colors.surface, borderRadius:16, borderWidth:0.5, borderColor:colors.border, padding:16, marginBottom:12 },
  row:         { flexDirection:'row', justifyContent:'space-between', paddingVertical:5 },
  rowL:        { fontSize:13, color:colors.textMuted },
  rowV:        { fontSize:13, color:colors.text, fontWeight:'500' },
  bold:        { fontWeight:'600', color:colors.text, fontSize:14 },
  div:         { height:0.5, backgroundColor:colors.border, marginVertical:8 },
  label:       { fontSize:13, fontWeight:'500', color:colors.textMuted, marginBottom:10 },
  pay:         { flexDirection:'row', alignItems:'center', gap:12, padding:14, borderRadius:14, borderWidth:0.5, borderColor:colors.border, backgroundColor:colors.surface, marginBottom:8 },
  payActive:   { borderColor:colors.primary, backgroundColor:colors.primaryLight },
  radio:       { width:20, height:20, borderRadius:10, borderWidth:1.5, borderColor:colors.border, justifyContent:'center', alignItems:'center' },
  radioActive: { borderColor:colors.primary },
  radioDot:    { width:10, height:10, borderRadius:5, backgroundColor:colors.primary },
  payLabel:    { fontSize:14, fontWeight:'500', color:colors.text },
  paySub:      { fontSize:12, color:colors.textMuted, marginTop:2 },
  btn:         { backgroundColor:colors.primary, borderRadius:14, padding:16, alignItems:'center', marginTop:20 },
  btnOff:      { opacity:0.5 },
  btnText:     { color:'#fff', fontSize:15, fontWeight:'600' },
  note:        { textAlign:'center', fontSize:12, color:colors.textMuted, marginTop:12 },
});
