import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { getInitials } from '../../utils/format';

export default function Avatar({ name = '', photoUrl = null, size = 40 }) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.text, { fontSize: size * 0.4 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  text:   { fontWeight: '600', color: colors.primaryDark },
});
