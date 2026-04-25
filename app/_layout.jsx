import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { BookingProvider } from '../context/BookingContext';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

/**
 * Auth + role routing guard.
 *
 * Three states:
 *   1. No auth user              → force (auth)/login
 *   2. Auth user, no profile yet → wait (loading spinner if you want)
 *   3. Auth user, profile loaded → route by profileCompleted + role
 *
 * Rules:
 *   - profileCompleted === false → force /complete-profile (even if signed in)
 *   - role === 'tasker' + on (client) route → bounce to tasker home
 *   - role === 'client' + on (tasker) route → bounce to client home
 *   - signed in + on (auth) login  → bounce to correct home
 *
 * Note: we intentionally depend on segments[0] and segments[1] (primitives)
 * rather than `segments` (a new array ref every render) so the effect only
 * fires when the route group actually changes.
 */
function AuthGuard() {
  const { user, userProfile, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();
  const group    = segments[0];  // '(auth)' | '(client)' | '(tasker)' | undefined
  const screen   = segments[1];  // e.g. 'login' | 'complete-profile' | 'booking' ...

  useEffect(() => {
    if (loading) return;

    const inAuth            = group === '(auth)';
    const inTasker          = group === '(tasker)';
    const inClient          = group === '(client)';
    const onCompleteProfile = inAuth && screen === 'complete-profile';
    const onLogin           = inAuth && screen === 'login';

    // 1. Not signed in → must be on login
    if (!user) {
      if (!onLogin) router.replace(ROUTES.LOGIN);
      return;
    }

    // 2. Signed in, profile still loading (first snapshot not arrived)
    if (!userProfile) return;

    // 3. Signed in but profile not completed → force complete-profile
    if (!userProfile.profileCompleted) {
      if (!onCompleteProfile) router.replace(ROUTES.COMPLETE_PROFILE);
      return;
    }

    // 4. Signed in + completed profile
    const homeRoute = userProfile.role === 'tasker'
      ? ROUTES.TASKER_HOME
      : ROUTES.CLIENT_HOME;

    if (inAuth) {
      router.replace(homeRoute);
      return;
    }
    if (userProfile.role === 'tasker' && inClient) {
      router.replace(ROUTES.TASKER_HOME);
      return;
    }
    if (userProfile.role === 'client' && inTasker) {
      router.replace(ROUTES.CLIENT_HOME);
      return;
    }
  }, [user, userProfile, loading, group, screen]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <BookingProvider>
      <AuthGuard />
    </BookingProvider>
  );
}
