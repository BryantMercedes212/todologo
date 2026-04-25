import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORIES } from '../../constants/data';
import { colors } from '../../constants/colors';

export default function CategoryGrid({ onPress }) {
  return (
    <View style={s.grid}>
      {CATEGORIES.map(cat => (
        <TouchableOpacity key={cat.id} style={s.card} onPress={() => onPress?.(cat)}>
          <View style={s.icon}><Text style={s.iconText}>{cat.label.charAt(0)}</Text></View>
          <Text style={s.label} numberOfLines={1}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:     { width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  icon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  iconText: { fontSize: 16, fontWeight: '700', color: colors.primaryDark },
  label:    { fontSize: 12, fontWeight: '500', color: colors.text },
});
