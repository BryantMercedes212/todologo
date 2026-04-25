import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../shared/Avatar';
import { formatCurrency, formatDateShort } from '../../utils/format';
import { colors } from '../../constants/colors';

function BookingRequestCard({ booking, onAccept, onDecline }) {
  return (
    <View style={s.card}>
      <View style={s.head}>
        <Avatar name={booking.clientName} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{booking.clientName}</Text>
          <Text style={s.sub}>{booking.service?.category ?? 'Servicio'}</Text>
        </View>
        <Text style={s.amount}>{formatCurrency(booking.pricing?.total)}</Text>
      </View>
      <View style={s.row}><Text style={s.label}>Fecha</Text><Text style={s.value}>{formatDateShort(booking.scheduledAt)}</Text></View>
      <View style={s.row}><Text style={s.label}>Hora</Text><Text style={s.value}>{booking.scheduledSlot ?? '—'}</Text></View>
      <View style={s.row}><Text style={s.label}>Sector</Text><Text style={s.value}>{booking.address?.sector}</Text></View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.btn, s.decline]} onPress={() => onDecline?.(booking.id)}>
          <Text style={[s.btnText, { color: colors.danger }]}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.accept]} onPress={() => onAccept?.(booking.id)}>
          <Text style={[s.btnText, { color: '#fff' }]}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(BookingRequestCard);

const s = StyleSheet.create({
  card:    { padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 10 },
  head:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  name:    { fontSize: 15, fontWeight: '600', color: colors.text },
  sub:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amount:  { fontSize: 15, fontWeight: '700', color: colors.primary },
  row:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label:   { fontSize: 12, color: colors.textMuted },
  value:   { fontSize: 12, color: colors.text, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn:     { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  decline: { backgroundColor: '#FCE1E1' },
  accept:  { backgroundColor: colors.primary },
  btnText: { fontSize: 13, fontWeight: '600' },
});
