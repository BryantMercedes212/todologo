import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../shared/Avatar';
import StarRating from '../shared/StarRating';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../constants/colors';

export default function TaskerCard({ tasker, onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={() => onPress?.(tasker)}>
      <Avatar name={tasker.displayName} photoUrl={tasker.photoUrl} size={48} />
      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{tasker.displayName}</Text>
        <Text style={s.skill} numberOfLines={1}>{tasker.skills?.[0] ?? 'Servicios generales'}</Text>
        <View style={s.meta}>
          <StarRating rating={tasker.rating ?? 0} reviewCount={tasker.reviewCount ?? 0} />
          {tasker.distance != null && <Text style={s.dist}>· {tasker.distance} km</Text>}
        </View>
      </View>
      <View style={s.right}>
        <Text style={s.rate}>{formatCurrency(tasker.hourlyRate)}</Text>
        <Text style={s.rateSub}>/ hora</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 10 },
  body:    { flex: 1 },
  name:    { fontSize: 15, fontWeight: '600', color: colors.text },
  skill:   { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  meta:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dist:    { fontSize: 12, color: colors.textMuted },
  right:   { alignItems: 'flex-end' },
  rate:    { fontSize: 14, fontWeight: '700', color: colors.primary },
  rateSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
});
