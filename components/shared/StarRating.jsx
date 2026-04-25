import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function StarRating({ rating = 0, reviewCount = 0, size = 13 }) {
  return (
    <View style={s.row}>
      <Text style={[s.star, { fontSize: size }]}>★</Text>
      <Text style={[s.rating, { fontSize: size }]}>{Number(rating).toFixed(1)}</Text>
      {reviewCount > 0 && <Text style={[s.count, { fontSize: size - 2 }]}>({reviewCount})</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star:   { color: colors.accent },
  rating: { fontWeight: '600', color: colors.text },
  count:  { color: colors.textMuted },
});
