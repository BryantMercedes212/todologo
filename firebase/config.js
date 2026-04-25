import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} = process.env;

// Crash at startup if any key is missing
Object.entries({
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
}).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing env variable: ${key}. Copy .env.example to .env.`);
});

export const firebaseConfig = {
  apiKey:            EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// CRITICAL: initializeAuth + ReactNativePersistence.
// Using the default getAuth() in RN gives in-memory persistence only, so
// users are logged out on every app restart. This wires auth to AsyncStorage.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db        = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
