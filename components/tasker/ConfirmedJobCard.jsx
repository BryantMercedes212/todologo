import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../shared/Avatar';
import StatusPill from '../shared/StatusPill';
import { formatCurrency, formatDateShort } from '../../utils/format';
import { colors } from '../../constants/colors';

function ConfirmedJobCard({ booking, onStart, onComplete }) {
  const isInProgress = booking.status === 'in_progress';
  return (
    <View style={s.card}>
      <View style={s.head}>
        <Avatar name={booking.clientName} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{booking.clientName}</Text>
          <Text style={s.sub}>{booking.service?.category ?? 'Servicio'}</Text>
        </View>
        <StatusPill status={booking.status} />
      </View>
      <View style={s.row}><Text style={s.label}>Fecha</Text><Text style={s.value}>{formatDateShort(booking.scheduledAt)}</Text></View>
      <View style={s.row}><Text style={s.label}>Hora</Text><Text style={s.value}>{booking.scheduledSlot ?? '—'}</Text></View>
      <View style={s.row}><Text style={s.label}>Sector</Text><Text style={s.value}>{booking.address?.sector}</Text></View>
      <View style={s.row}><Text style={s.label}>Total</Text><Text style={[s.value, { color: colors.primary, fontWeight: '700' }]}>{formatCurrency(booking.pricing?.total)}</Text></View>
      <TouchableOpacity
        style={[s.btn, isInProgress && s.btnDone]}
        onPress={() => (isInProgress ? onComplete?.(booking.id) : onStart?.(booking.id))}
      >
        <Text style={s.btnText}>{isInProgress ? 'Marcar completado' : 'Iniciar trabajo'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ConfirmedJobCard);

const s = StyleSheet.create({
  card:    { padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 10 },
  head:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  name:    { fontSize: 15, fontWeight: '600', color: colors.text },
  sub:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label:   { fontSize: 12, color: colors.textMuted },
  value:   { fontSize: 12, color: colors.text, fontWeight: '500' },
  btn:     { backgroundColor: colors.primary, padding: 10, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnDone: { backgroundColor: colors.primaryDark },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
