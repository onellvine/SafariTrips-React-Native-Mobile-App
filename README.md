# Safari Trips: React Native (Expo) app

Mobile client for the Django REST "Safari & Adventure Trips API". TypeScript, Expo SDK 57, React Navigation 7, TanStack Query.

## Run
```bash
# 1. start the API (in safari_api/)
python manage.py migrate && python manage.py seed_posters && python manage.py runserver 0.0.0.0:8000

# 2. start the app
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL if needed
npx expo start              # press a (Android), i (iOS), or scan the QR in Expo Go
```
`EXPO_PUBLIC_API_URL` defaults to `http://10.0.2.2:8000/api/v1` on the Android emulator and
`http://localhost:8000/api/v1` on the iOS simulator. On a physical phone use your computer's LAN IP,
e.g. `http://192.168.1.20:8000/api/v1`, and keep both on the same Wi-Fi.
Production builds must use HTTPS.

## Screens → endpoints
| Screen | Endpoints |
|---|---|
| Explore (search, category chips, sort, infinite scroll) | `GET /trips/`, `GET /categories/` |
| Trip detail (prices, departures, inclusions/exclusions, deposit & M-PESA info, call/email/web) | `GET /trips/{slug}/` |
| Departures calendar (grouped by month) | `GET /departures/` |
| Book (date, price option, travellers, live total/deposit preview) | `POST /bookings/` |
| My bookings / Booking detail (pay instructions with copy buttons, submit M-PESA code, payment status, cancel) | `GET /bookings/`, `GET /bookings/{ref}/`, `POST /bookings/{ref}/payments/`, `POST /bookings/{ref}/cancel/` |
| Sign in / Register / Profile | `POST /auth/register/`, `POST /auth/token/`, `GET /auth/me/` |

## Design notes
- **Guest browsing:** everything public works signed out; tapping *Book now* opens sign-in first.
- **Auth:** JWT stored in `expo-secure-store`; `src/api/client.ts` transparently refreshes an expired access token once and signs the user out if refresh fails.
- **Errors:** DRF validation payloads (e.g. "Only 2 seat(s) left") are flattened into readable alerts.
- **Money/dates:** DRF returns decimals as strings; formatting lives in `src/utils/format.ts`. KES and USD prices are shown as returned.
- **Totals shown while booking are a preview;** the server's response is authoritative.
- Trips have no photos in the API yet (`cover_image_url` is empty), so cards use category emoji banners. Render `cover_image_url` with `<Image>` once the backend serves images.
- Accommodation offers (Neptune Hotels) are browse-only, with call/email buttons instead of *Book now*.

## Structure
```
App.tsx                     providers (Query, Auth, Navigation)
src/api/{client,endpoints}.ts   fetch wrapper, token refresh, typed endpoint functions
src/auth/AuthContext.tsx        session state
src/navigation/                 stack + bottom tabs
src/screens/                    Explore, Calendar, TripDetail, Book, Bookings, BookingDetail, Auth, Profile
src/components/ui.tsx           Button, Field, Chip, Badge, Card, TripCard...
src/types.ts                    TypeScript mirror of the API payloads
```
Checks: `npx tsc --noEmit` passes, and `npx expo export --platform android` bundles successfully.
