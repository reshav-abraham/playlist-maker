# Playlist Maker — Mobile (Expo / React Native)

A thin client for the existing FastAPI backend (`main.py`). It reuses the
same three endpoints the web frontend uses:

- `GET /login` — opens the Spotify authorization page
- `GET /getme` — returns the logged-in user's Spotify profile
- `GET /create_playlist` — scrapes Bandcamp and builds the Spotify playlist

## Setup

```bash
cd mobile
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_BASE_URL
npx expo start
```

`EXPO_PUBLIC_API_BASE_URL` must point at a host your phone/simulator can
actually reach:

- iOS Simulator on the same Mac as the backend: `http://localhost:8888` works.
- Android emulator: use `http://10.0.2.2:8888`.
- Physical device: use your computer's LAN IP, e.g. `http://192.168.1.50:8888`.

The backend already allows all CORS origins (`origins = ["*"]` in `main.py`),
so no server changes are needed for the app to call it directly.

## How login works here

The backend's OAuth `redirect_uri` (`SPOTIFY_APPROVED_REDIRECT`) points back
at the FastAPI server itself, not at the app, and the token exchange happens
server-side in `/callback` — the same as the existing web frontend. So the
app just opens `/login` in an in-app browser tab (`expo-web-browser`) and
lets Spotify's login + the backend's redirect chain play out there.

That chain currently ends by redirecting to `http://localhost:3000/<code>`
(intended for the web frontend's dev server), which won't resolve for a
mobile user — you may see a blank/error page after logging in. That's
expected: the access token was already cached server-side by the time that
last redirect fires. Just close the browser tab and return to the app; it
automatically re-checks `/getme`, or you can tap "I already logged in —
refresh".

## Notes

- No navigation library is used — it's a single screen with a logged-out
  and a logged-in state, matching the current scope of the backend.
- `Create Playlist` calls `/create_playlist`, which scrapes several Bandcamp
  genre pages synchronously — it can take a while and the endpoint doesn't
  return any data on success, so the app just reports completion.
