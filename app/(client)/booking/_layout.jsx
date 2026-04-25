import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../../../constants/colors';

// Booking flow gets its own stack with a visible back button so users
// don't get trapped. The datetime screen is the FIRST in this sub-stack,
// so we add a manual headerLeft that pops to the parent (home) — otherwise
// expo-router hides the back button on a stack root.
// The confirmation screen hides the back button since the booking is
// already saved and going "back" into the flow would be confusing.
export default function BookingLayout() {
  const router = useRouter();

  const HomeBack = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 8 }}>
      <Text style={{ color: colors.text, fontSize: 16 }}>‹ Atrás</Text>
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown:         true,
        headerBackTitle:     'Atrás',
        headerTintColor:     colors.text,
        headerStyle:         { backgroundColor: colors.background },
        headerShadowVisible: false,
        title:               '',
      }}
    >
      <Stack.Screen name="datetime"     options={{ title: 'Fecha y hora', headerLeft: HomeBack }} />
      <Stack.Screen name="address"      options={{ title: 'Dirección' }} />
      <Stack.Screen name="payment"      options={{ title: 'Pago' }} />
      <Stack.Screen name="confirmation" options={{ title: 'Confirmado', headerBackVisible: false, headerLeft: () => null, gestureEnabled: false }} />
    </Stack>
  );
}
