import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function TaskerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Inicio' }} />
      <Tabs.Screen name="jobs"     options={{ title: 'Trabajos' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Ganancias' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
