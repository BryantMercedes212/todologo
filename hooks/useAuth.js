import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * Subscribes to both auth state AND the user profile doc.
 * Previous version used a one-shot getDoc — profile updates (role pick in
 * complete-profile, name edit in profile editor) didn't propagate until the
 * next app launch, leaving the auth guard and other screens with stale data.
 */
export const useAuth = () => {
  const [user,        setUser]        = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Tear down previous profile listener on every auth change
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (firebaseUser) {
        setUser(firebaseUser);
        unsubProfile = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            setUserProfile(snap.exists() ? snap.data() : null);
            setLoading(false);
          },
          (err) => {
            console.error('useAuth profile listener:', err);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      if (unsubProfile) unsubProfile();
      unsubAuth();
    };
  }, []);

  return { user, userProfile, loading };
};
