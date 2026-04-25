# TaskApp

TaskRabbit-style home services marketplace for the Dominican Republic. Clients book local technicians; taskers accept/decline; everything priced in RD$ with ITBIS 18% applied server-side.

Stack: Expo (React Native) + Firebase (Auth, Firestore, Functions, FCM).

---

## Setup from zero

### 1. Prerequisites

```bash
node --version   # >= 20
npm --version    # >= 10
```

Install the Firebase CLI globally:

```bash
npm install -g firebase-tools
```

### 2. Install dependencies

From the project root:

```bash
cd TaskApp
npm install
npx expo install --fix
```

The second command pins every Expo package to the version that matches the Expo SDK in `package.json` — very helpful if you bump SDK versions later.

Cloud Functions have their own dependencies:

```bash
cd functions
npm install
cd ..
```

### 3. Create a Firebase project

- Go to https://console.firebase.google.com → Add project.
- Enable **Authentication → Phone** sign-in.
- Enable **Firestore** (start in production mode — our rules lock it down).
- Enable **Cloud Functions** and **Cloud Messaging**.
- Upgrade the project to the **Blaze plan** (required for Cloud Functions; stays free under free-tier limits).

### 4. Wire up env vars

```bash
cp .env.example .env
```

Fill in the values from **Project settings → General → Your apps → Web app**:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_GOOGLE_MAPS_KEY=...
```

For the Google Maps key: https://console.cloud.google.com → same project → APIs & Services → Credentials → Create API key. Enable **Maps SDK for Android** and **Maps SDK for iOS**.

### 5. Link Firebase CLI to your project

```bash
firebase login
firebase use --add       # pick your project, alias it "default"
```

### 6. Deploy Firestore rules + Cloud Functions

```bash
firebase deploy --only firestore:rules
firebase deploy --only functions
```

Rules enforce server-side pricing (`allow create: if false` on bookings) and field-level restrictions on updates. Functions host `createBooking` (pricing + validation) and `onBookingCreated` (FCM push to the tasker).

### 7. Run the app

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR with Expo Go. Note: Expo Go supports phone auth via the bundled reCAPTCHA verifier; for a real build you'll want to migrate off `expo-firebase-recaptcha` (it's archived).

---

## Project layout

```
app/                Screens (expo-router) — no business logic
  (auth)/           Login, complete-profile
  (client)/         Client flows — booking wizard, bookings, map, home
  (tasker)/         Tasker flows — dashboard, jobs, earnings, profile
components/         Presentation only
  shared/           Avatar, EmptyState, StarRating, StatusPill
  client/           CategoryGrid, TaskerCard
  tasker/           BookingRequestCard, ConfirmedJobCard
services/           Firebase calls (bookings, taskers, users)
hooks/              useAuth, useLocation, useAsync, useTaskerBookings
context/            BookingContext (in-flight booking state)
firebase/           config (initializeAuth + AsyncStorage), auth helpers
functions/          Cloud Functions — createBooking + onBookingCreated
utils/              format, whatsapp
constants/          colors, routes, data (categories, sectors, pricing rates)
firestore.rules     Security rules — deployed via firebase CLI
firebase.json       Firebase CLI config (points rules + functions)
```

---

## Security model

- API keys live in `.env` only (never committed); `firebase/config.js` throws if any required key is missing.
- Clients **cannot** create bookings directly. The `createBooking` Cloud Function fetches the real `hourlyRate` from Firestore, calculates price (10% service fee + 18% ITBIS) server-side, and writes the booking with the Admin SDK (which bypasses rules).
- Firestore rules lock `bookings` to `create: false`, enforce participant-only reads, and restrict updates to whitelisted fields with a valid status state machine.
- Message chats are scoped to the two participants of the parent booking via a `get()` lookup.

---

## DR-specific notes

- Prices in RD$ — always `formatCurrency()`.
- Phones: `+1` country code, area codes 809/829/849. `formatDRPhone()` handles normalization.
- Default map center: Santo Domingo (18.4861, -69.9312), search radius 15 km.
- Common sectors are hardcoded in `constants/data.js` — expand as you go.
- WhatsApp is the user-visible notification channel; the current implementation uses `Linking.openURL('wa.me/...')` which opens WhatsApp on the *client's* phone. For server-to-tasker delivery, add WhatsApp Business API via Twilio/Wati.

---

## Common commands

```bash
npx expo start                             # Run the app
npx expo install --fix                     # Re-pin deps to Expo SDK
firebase deploy --only firestore:rules     # Ship rules
firebase deploy --only functions           # Ship Cloud Functions
firebase functions:log                     # Tail function logs
firebase emulators:start --only functions  # Run functions locally
```

---

## Known TODOs

- **Slot-conflict check** in `createBooking` (three clients can book the same 2 pm slot).
- **Idempotency key** so retries don't create duplicates.
- **GeoFirestore** migration when tasker count > ~500 (current client-side haversine filter is fine until then).
- **cancelados tab** in `(tasker)/jobs.jsx` (subscription now returns `cancelled`, the hook just doesn't plumb it through yet).
- **Real WhatsApp delivery** via Twilio or similar — `Linking.openURL` is client-side only.
- **Azul / CardNet payment SDK** once you have merchant docs.
- **`expo-firebase-recaptcha` replacement** before production — package is archived.
- **TypeScript migration** — add `types/index.ts`, rename `.js/.jsx` → `.ts/.tsx`.

---

## First-time smoke test

1. `npx expo start` — app boots, lands on login.
2. Enter a DR phone number, receive OTP (check Firebase → Authentication → Users for test numbers you can allowlist).
3. Verify OTP → lands on **Completa tu perfil**.
4. Enter name, pick "Soy Cliente" → lands on client home.
5. Enter name, pick "Soy Técnico" → lands on tasker dashboard. Open **Perfil**, set hourly rate + categories, flip **Disponible** on. Now you're discoverable.
6. Log in with a different number as client, browse, pick the tasker, go through the booking wizard — price is calculated by the Cloud Function.
7. Switch back to the tasker account → you see the pending request; accept/decline/start/complete.
