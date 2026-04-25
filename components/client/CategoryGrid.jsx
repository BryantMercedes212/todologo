import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORIES } from '../../constants/data';
import { colors } from '../../constants/colors';

export default function CategoryGrid({ onPress, selectedId }) {
  return (
    <View style={s.grid}>
      {CATEGORIES.map(cat => {
        const active = cat.id === selectedId;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[s.card, active && s.cardActive]}
            onPress={() => onPress?.(cat)}
          >
            <View style={[s.icon, active && s.iconActive]}>
              <Text style={[s.iconText, active && s.iconTextActive]}>{cat.label.charAt(0)}</Text>
            </View>
            <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:            { width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  cardActive:      { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  icon:            { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  iconActive:      { backgroundColor: colors.primary },
  iconText:        { fontSize: 16, fontWeight: '700', color: colors.primaryDark },
  iconTextActive:  { color: '#fff' },
  label:           { fontSize: 12, fontWeight: '500', color: colors.text },
  labelActive:     { color: colors.primaryDark, fontWeight: '700' },
});
